import { Component, OnInit, Inject, Injector, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessageService, SelectItem } from 'primeng/api';
import { faCheckCircle, faCircle } from '@fortawesome/free-regular-svg-icons';
import { faTimes, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';

import { AttendanceModel, AuthTypeEnum } from '@app/shared/models/AttendanceModel';
import { Locality } from '@app/shared/models/locality';
import { CitizenService } from '@app/shared/services/citizen.service';
import { LocalityService } from '@app/shared/services/locality.service';
import { AuthService } from '@app/shared/services/auth.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent extends AttendanceModel implements OnInit, OnDestroy {

  iconChange = faExchangeAlt;
  iconChecked = faCheckCircle;
  iconCircle = faCircle;
  iconRemove = faTimes;
  optionsOrderBy: SelectItem[] = [
    { label: 'name', value: 'name' },
    { label: 'attendance.arrival', value: 'checkedInDate' },
  ];
  resultSearchCounty: Locality[];
  authTypeChangeSub: Subscription;
  valueChangeCPFSub: Subscription;

  constructor(
    protected citizenSrv: CitizenService,
    protected messageSrv: MessageService,
    public localitySrv: LocalityService,
    protected formBuilder: FormBuilder,
    public authSrv: AuthService,
    @Inject(Injector) injector: Injector
  ) {
    super(injector, true);
  }

  ngOnInit(): void {
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

  async saveEdit() {
    const { success } = await this.save();
    if (success) {
      this.messageSrv.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant('attendance.successDetail.saveAccount')
      });
      this.toggleSelectedAttendee();
    }
    return;
  }

  async uncheckIn() {
    const attendee = this.selectedAttende;
    try {
      const result = await this.meetingSrv.deleteCheckIn(this.idMeeting, attendee.personId);
      if (result) {
        this.messageSrv.add({
          severity: 'success',
          summary: this.translate.instant('success'),
          detail: this.translate.instant('attendance.successDetail.uncheckin')
        });
        this.listAttendees.splice(this.listAttendees.findIndex(att => att === attendee), 1);
        await this.setActionBar();
        this.toggleSelectedAttendee();
      } else {
        throw new Error();
      }
    } catch (error) {
      this.messageSrv.add({
        severity: 'warn',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('attendance.error.couldNotUncheck')
      });
    }
  }

  async handleSearchCounty({ query }) {
    // const result = await this.localitySrv.listAllByNameType(query, 1020);
    const search = this.toStandardText(query);
    this.resultSearchCounty = this.localities.filter(l => this.toStandardText(l.name).indexOf(search) !== -1);
  }

  toStandardText(str: string) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  getTooltipRemoveText() {
    const name = this.form.value.name;
    if (!name) {
      return this.translate.instant('attendance.tooltipLabelUnchecking');
    }
    const names = name.trim().split(' ');
    const customName = names.length > 2 ? `${names[0]} ${names[names.length - 1]}` : names.join(' ');
    return this.translate.instant('attendance.tooltipLabelUnchecking') + customName;
  }
}
