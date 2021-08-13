import { Component, OnInit, OnDestroy, Injector, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { faCircle, faCheckCircle } from '@fortawesome/free-regular-svg-icons';

import { IAttendee } from '@app/shared/interface/IAttendee';
import { AttendanceModel, AuthTypeEnum } from '@app/shared/models/AttendanceModel';
import { ActionBarService } from '@app/core/actionbar/app.actionbar.actions.service';
import { BreadcrumbService } from '@app/core/breadcrumb/breadcrumb.service';
import { CitizenService } from '@app/shared/services/citizen.service';
import { ConferenceService } from '@app/shared/services/conference.service';
import { MeetingService } from '@app/shared/services/meeting.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '@app/shared/services/auth.service';
import { LocalityService } from '@app/shared/services/locality.service';
import * as moment from 'moment';
import 'moment-timezone';

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

  constructor(
    protected breadcrumbSrv: BreadcrumbService,
    protected messageSrv: MessageService,
    protected formBuilder: FormBuilder,
    protected meetingSrv: MeetingService,
    protected translate: TranslateService,
    protected conferenceSrv: ConferenceService,
    protected actionbarSrv: ActionBarService,
    protected citizenSrv: CitizenService,
    public authSrv: AuthService,
    public localitySrv: LocalityService,
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
    if (attendee.checkingIn) {
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
    try {
      const timeZone = moment.tz.guess(true);
      const result = await this.meetingSrv.postCheckIn(this.idMeeting, attendee.personId, timeZone);
      if (result) {
        attendee.checkedIn = true;
        attendee.checkedInDate = result.time;
        this.messageSrv.add({
          severity: 'success',
          summary: this.translate.instant('success'),
          detail: this.translate.instant('attendance.successDetail.checkin')
        });
        this.isAttendeeSelected = false;
        this.selectedAttende = null;
        await this.setActionBar();
      } else {
        throw new Error();
      }
    } catch (error) {
      this.messageSrv.add({
        severity: 'warn',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('attendance.error.failedToCheckIn')
      });
    }
    attendee.checkingIn = false;
  }

  async saveAccount() {
    const { success, result } = await this.save();
    if (success) {
      if (!this.selectedAttende) {
        const newAttendee: IAttendee = {
          personId: result.id,
          name: result.name,
          email: result.email,
          checkedIn: false
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
}
