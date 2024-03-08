import { delay } from 'rxjs/operators';
import {AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, Component, Inject, Injector, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {Subscription} from 'rxjs';
import {Message, MessageService} from 'primeng/api';
import {faCheckCircle, faCircle} from '@fortawesome/free-regular-svg-icons';

import {IAttendee} from '@app/shared/interface/IAttendee';
import {AttendanceModel, AuthTypeEnum} from '@app/shared/models/AttendanceModel';
import {ActionBarService} from '@app/core/actionbar/app.actionbar.actions.service';
import {MeetingService} from '@app/shared/services/meeting.service';
import {TranslateService} from '@ngx-translate/core';
import {AuthService} from '@app/shared/services/auth.service';
import {LocalityService} from '@app/shared/services/locality.service';
import * as moment from 'moment';
import 'moment-timezone';
import { formatNumber } from '@angular/common';
import { ModalService } from '@app/core/modal/modal.service';
import { ModalData } from '@app/shared/interface/IModalData';
import { BarcodeFormat } from '@zxing/library';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent extends AttendanceModel implements OnInit, OnDestroy {

  iconChecked = faCheckCircle;
  iconUnchecked = faCircle;
  authTypeChangeSub: Subscription;
  valueChangeCPFSub: Subscription;
  newAccount = false;
  modalData: ModalData;
  readingQRCode: boolean = false;
  scannerEnabled: boolean = false;
  availableDevices: MediaDeviceInfo[];
  deviceCurrent: MediaDeviceInfo;
  deviceSelected: string;

  formatsEnabled: BarcodeFormat[] = [
    BarcodeFormat.QR_CODE,
  ];

  hasDevices: boolean = false;
  hasPermission: boolean;

  qrResultString: string;

  torchEnabled = false;
  torchAvailable$ = new BehaviorSubject<boolean>(false);
  tryHarder = false;

  constructor(
    protected messageSrv: MessageService,
    protected formBuilder: FormBuilder,
    protected meetingSrv: MeetingService,
    protected translate: TranslateService,
    protected actionbarSrv: ActionBarService,
    public authSrv: AuthService,
    public localitySrv: LocalityService,
    public modalService: ModalService,
    @Inject(Injector) injector: Injector
  ) {
    super(injector, false);
  }

   ngOnInit() {
    this.authTypeChangeSub = this.form.controls.authType.valueChanges.subscribe(change => this.handleChangeAuthType(change));
    this.handleChangeAuthType(AuthTypeEnum.CPF);
  }

  ngOnDestroy(): void {
    this.authTypeChangeSub.unsubscribe();
    if (this.valueChangeCPFSub !== null) {
      this.valueChangeCPFSub.unsubscribe();
    }
    this.actionbarSrv.setItems([]);
  }

  async checkIn(attendee: IAttendee) {
    this.form.markAllAsTouched();

    if (attendee.checkedIn || attendee.checkingIn) {
      return;
    }

    attendee.checkingIn = true;

    if (this.form.dirty) {
      const saved = await this.saveAccount();
      if (!saved) {
        attendee.checkingIn = false;
        return;
      }
    }

    var now = new Date();
    var timeZone = now.toString().split(' ')[5];

    const result = await this.meetingSrv.postCheckIn(this.idMeeting, attendee.personId, timeZone);

    if (result) {
      attendee.checkedIn = true;
      attendee.checkedInDate = result.time;
      this.messageSrv.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant('attendance.successDetail.checkin', {name: attendee.name.toUpperCase()}),
        life: 10000
      });

      this.isAttendeeSelected = false;
      this.selectedAttende = null;
      this.cleanListAtendees();
      await this.setActionBar();
    } else {
      this.messageSrv.add({
        severity: 'warn',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('attendance.error.failedToCheckIn')
      });
    }

    attendee.checkingIn = false;
  }

  async saveAccount() {
    const {success, result} = await this.save();

    if (success) {
      if (!this.selectedAttende) {
        const newAttendee: IAttendee = {
          personId: result.id,
          name: result.name,
          email: result.email,
          checkedIn: false,
          checkingIn: false
        };
        await this.checkIn(newAttendee);
        this.toggleNewAccount();
      } else {
        this.messageSrv.add({
          severity: 'success',
          summary: this.translate.instant('success'),
          detail: this.translate.instant('attendance.successDetail.saveAccount')
        });
      }
      setTimeout(() => document.getElementById('btnSearchRegister').click(), 250);
    }

    return success;
  }

  toggleNewAccount() {
    this.newAccount = !this.newAccount;
    this.form.reset();
    this.form.controls.authType.setValue(AuthTypeEnum.CPF);
  }

  onInput($event) {
    this.form.patchValue(
      {name: $event.target.value.replace(/^\s+/gm, '').replace(/\s+(?=[^\s])/gm, ' ')},
      {emitEvent: false}
    );
  }

  onBlur($event) {
    this.form.patchValue(
      {name: $event.target.value.replace(/\s+$/gm, '')},
      {emitEvent: false});
  }

  readQRCode(){
    if(!this.availableDevices){
      return this.messageSrv.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: "Você não pode realizar o check in nesse dispositivo pois não possui nenhuma câmera disponível",
        life:5000
      });
    }
    this.scannerEnabled = true;
    this.modalData = {title: "Realizar Check In"};
    console.log("Dispositivos",this.availableDevices);
    this.modalService.open('QRCodeReader'); 
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.hasDevices = Boolean(devices && devices.length);
  }

  onCodeResult(resultString: string) {
    this.qrResultString = resultString;
    console.log('Código Lido', this.qrResultString);
    this.modalService.close('QRCodeReader'); 
    this.scannerEnabled = false;

    // alert(this.qrResultString);
  }

  onDeviceSelectChange(selected: string) {
    const selectedStr = selected || '';
    if (this.deviceSelected === selectedStr) { return; }
    this.deviceSelected = selectedStr;
    const device = this.availableDevices.find(x => x.deviceId === selected);
    this.deviceCurrent = device || undefined;
  }

  onDeviceChange(device: MediaDeviceInfo) {
    const selectedStr =  device != null ? device.deviceId : '';
    if (this.deviceSelected === selectedStr) { return; }
    this.deviceSelected = selectedStr;
    this.deviceCurrent = device || undefined;
  }

  openFormatsDialog() {
    const data = {
      formatsEnabled: this.formatsEnabled,
    };

    // this._dialog
    //   .open(FormatsDialogComponent, { data })
    //   .afterClosed()
    //   .subscribe(x => {
    //     if (x) {
    //       this.formatsEnabled = x;
    //     }
    //   });
  }

  onHasPermission(has: boolean) {
    this.hasPermission = has;
  }

  openInfoDialog() {
    const data = {
      hasDevices: this.hasDevices,
      hasPermission: this.hasPermission,
    };

    // this._dialog.open(AppInfoDialogComponent, { data });
  }

  onTorchCompatible(isCompatible: boolean): void {
    this.torchAvailable$.next(isCompatible || false);
  }

  toggleTorch(): void {
    this.torchEnabled = !this.torchEnabled;
  }

  toggleTryHarder(): void {
    this.tryHarder = !this.tryHarder;
  }
}
