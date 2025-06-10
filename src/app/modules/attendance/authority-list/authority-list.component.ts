import {Component, Inject, Injector, OnDestroy, OnInit} from '@angular/core';
import {UntypedFormBuilder} from '@angular/forms';
import {Subscription} from 'rxjs';
import {MessageService, SelectItem} from 'primeng/api';
import {faCheckCircle, faCircle} from '@fortawesome/free-regular-svg-icons';
import {faQrcode, faTimes} from '@fortawesome/free-solid-svg-icons';

import {AttendanceModel, AuthTypeEnum} from '@app/shared/models/AttendanceModel';
import {Locality} from '@app/shared/models/locality';
import {LocalityService} from '@app/shared/services/locality.service';
import {AuthService} from '@app/shared/services/auth.service';
import { MeetingService } from '@app/shared/services/meeting.service';
import { ConferenceService } from '@app/shared/services/conference.service';
import * as moment from 'moment';
import { IConferenceWithMeetings } from '@app/shared/interface/IConferenceWithMeetings';
import { Meeting } from '@app/shared/models/Meeting';
import { concat } from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { ActionBarService } from '@app/core/actionbar/app.actionbar.actions.service';
import { BreadcrumbService } from '@app/core/breadcrumb/breadcrumb.service';
import { IQueryOptions } from '@app/shared/interface/IQueryOptions';
import { getColorBasedOnText } from '@app/shared/util/Colors.utils';
import { howLongAgo } from '@app/shared/util/Date.utils';
import { IAttendee } from '@app/shared/interface/IAttendee';
import { IAttendeeAuthority } from '@app/shared/interface/IAttendeeAuthority';
import { AuthorityCredentialService } from '@app/shared/services/authority-credential.service';
import { CitizenSenderModel } from '@app/shared/models/CitizenSenderModel';

@Component({
  selector: 'app-authority-list',
  templateUrl: './authority-list.component.html',
  styleUrl: './authority-list.component.scss'
})
export class AuthorityListComponent extends AttendanceModel implements OnInit, OnDestroy {

  iconChecked = faCheckCircle;
  iconCircle = faCircle;
  iconRemove = faTimes;
  // iconPreRegister = faQrcode;
  optionsOrderBy: SelectItem[] = [
    {label: 'name', value: 'name'},
    {label: 'attendance.arrival', value: 'checkedInDate'},
  ];
  resultSearchCounty: Locality[];

  optionsFilterBy: SelectItem[] = [
    {label: 'Presentes', value: 'pres'},
    {label: 'Pré-credenciados', value: 'prereg'},
    {label: 'Pré-credenciados e Presentes', value: 'prereg_pres'},
    {label: 'Pré-credenciados e Ausentes', value: 'prereg_notpres'},
    {label: 'Presentes não Pré-credenciados', value: 'notprereg_pres'},
  ]

  authTypeChangeSub: Subscription;
  valueChangeCPFSub: Subscription;

  listAttendeesAuthority: IAttendeeAuthority[];

  selectedAttendeAuthority : IAttendeeAuthority

  constructor(
    protected messageSrv: MessageService,
    public localitySrv: LocalityService,
    protected formBuilder: UntypedFormBuilder,
    public authSrv: AuthService,
    @Inject(Injector) injector: Injector,
    private authcSrv : AuthorityCredentialService
  ) {
    super(injector, true);
  }
  
  override async setActionBar() {

    await this.getTotalParticipants();

    this.actionbarSrv.setItems([
      {
        position: 'LEFT',
        handle: () => this.showSelectMeeting = !this.showSelectMeeting,
        icon: 'change.svg',

      }
    ]);
  }
  
  async toggleAnnounced(attendee: IAttendeeAuthority, isEdit: boolean = false) {
    
  
      const {
        isAnnounced
      } = await this.authcSrv.toggleAnnounced(attendee.idCheckIn);
      attendee.announced = isAnnounced;
      this.searchByName();

    
  }

  override toggleSelectedAttendee() {
    this.isAttendeeSelected = !this.isAttendeeSelected;
    this.selectedAttendeAuthority = null;
    this.authName = [];
    this.form.reset();
  }
    
  override async setCurrentMeeting() {
    if (this.currentConference !== this.selectedConference) {
      this.currentConference = this.selectedConference;
      await this.getLocalitiesBasedOnConference();
    }
    if (this.currentMeeting !== this.selectedMeeting) {
      this.currentMeeting = this.selectedMeeting;
      this.idMeeting = this.currentMeeting.id;
      this.listAttendees = [];
      this.lastPage = true;
      this.nameSearch = '';
      this.noResult = false;
      this.breadcrumbSrv.setItems([
        { label: 'attendance.authority' },
        {
          label: `${this.translate.instant("attendance.authority") } ${this.currentMeeting.name}`,
          routerLink: [`/attendance/${this.routerLinkItem}`]
        },
      ]);
    }

    await this.searchByName();
    await this.setActionBar();
    // await this.searchByName();
    this.showSelectMeeting = false;
  }

  async selectAttendeeAuthority(attendee: IAttendeeAuthority , isEdit: boolean = false) {
    const { name, locality, authType, cpf, email, phone, password, isAuthority, organization, role } = this.form.controls;
    try {
      this.isAttendeeSelected = true;
      this.selectedAttendeAuthority = attendee;
      const {
        success,
        data
      } = await this.citizenSrv.GetById(attendee.idPerson, { search: { conferenceId: this.currentConference.id, meetingId: this.idMeeting, isEdit: isEdit } });
      if (success) {
        name.setValue(data.name);
        locality.setValue(data.localityId ?? attendee.idLocality);
        authType.setValue(AuthTypeEnum.EMAIL);
        this.isReadonly = true
        email.setValue(data.email);
        phone.setValue(data.telephone);
        this.citizenAutentications = data.autentication || [];
        this.authName = data.authName || [];
        isAuthority.setValue(data.isAuthority ?? false);
        this.markAuthorityTouched();
        organization.updateValueAndValidity();
        role.updateValueAndValidity();
        this.readonlyOrganization = data.organization != null;
        this.readonlyRole = data.role != null;
        organization.setValue(data.organization);
        role.setValue(data.role);

      }
    } catch (error) {
    this.messageSrv.add({
      severity: 'warn',
      summary: this.translate.instant('error'),
      detail: this.translate.instant('attendance.error.couldNotGetCitizenInfo'),
    });
    this.toggleSelectedAttendee();
    }
  }

  override handleChangeAuthType(value: AuthTypeEnum) {
    const { password: passwordControl, email: emailControl, cpf: cpfControl } = this.form.controls;
    if (this.valueChangeCPFSub) {
      this.valueChangeCPFSub.unsubscribe();
    }
    passwordControl.reset();
    emailControl.reset();
    cpfControl.reset();
    switch (value) {
      case AuthTypeEnum.CPF:
        cpfControl.setValidators(this.cpfValidators);
        cpfControl.enable();
        passwordControl.setValidators(this.passwordValidators);
        passwordControl.enable();
        emailControl.clearValidators();
        emailControl.disable();
        this.valueChangeCPFSub = this.form.controls.cpf.valueChanges.subscribe(change => emailControl.setValue(change + '@cpf'));
        break;
      case AuthTypeEnum.EMAIL:
        cpfControl.clearValidators();
        cpfControl.disable();
        passwordControl.clearValidators();
        passwordControl.disable();
        emailControl.setValidators(this.emailValidators);
        emailControl.enable();
        break;
    }
  }
  

  override async searchByName() {
    if (!this.idMeeting) {
      return;
    }
    this.listAttendeesAuthority = [];
    this.isSearching = true;
    this.noResult = false;
    this.lastPage = true;
    this.currentPage = 0;
    try {
      const result = await this.meetingSrv.getListAuthority(this.idMeeting, this.getQueryListAttendees());
      this.listAttendeesAuthority = result;
      this.noResult = result.length === 0;
    } catch(error) {
      this.messageSrv.add({
        severity: 'warn',
        summary: this.translate.instant('error'),
        detail: error.error?.message
      });
    }
    await this.setActionBar();
    this.isSearching = false;
    
  }

  ngOnInit(): void {
    this.authTypeChangeSub = this.form.controls.authType.valueChanges.subscribe(change => this.handleChangeAuthType(change));
    this.handleChangeAuthType(AuthTypeEnum.CPF);
    setTimeout( () => {
      this.searchByName();
    }, 300)
  }

  ngOnDestroy(): void {
    this.authTypeChangeSub.unsubscribe();
    if (this.valueChangeCPFSub !== null) {
      this.valueChangeCPFSub.unsubscribe();
    }
    this.actionbarSrv.setItems([]);
  }

  
  
    override async save(): Promise<{ success: boolean; result?: any }> {
      if (!this.form.valid) {
        this.messageSrv.add({
          severity: 'warn',
          summary: this.translate.instant('error'),
          detail: this.translate.instant('attendance.error.invalidForm'),
        });
  
        return { success: false };
      }
  
      const { name, locality, phone, authType, cpf, password, email, resetPassword, sub, isAuthority, organization, role } = this.form.value;
  
      const formAPI: CitizenSenderModel = {
        name,
        telephone: phone,
        contactEmail: email,
        confirmEmail: email,
        password,
        confirmPassword: password,
        cpf,
        typeAuthentication: authType === AuthTypeEnum.CPF ? 'cpf' : 'mail',
        selfDeclaration: {
          conference: this.selectedConference.id,
          locality,
        },
        resetPassword: !!resetPassword,
        sub: sub
      };
  
      const result = await this.citizenSrv.save(formAPI as any, this.selectedAttendeAuthority?.idPerson);
  
      if (result) {
        this.form.reset();
        return { success: true, result: { ...result, name: formAPI.name, email: formAPI.confirmEmail, isAuthority, organization, role } };
      }
  
      this.messageSrv.add({
        severity: 'warn',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('attendance.error.errorSaving'),
      });
  
      return { success: false };
    }

  async saveEdit() {
    const isAuthority: boolean = this.form.get('isAuthority')?.value;
    const organization: string = this.form.get('organization')?.value;
    const role: string = this.form.get('role')?.value;
    const {success} = await this.save();
    if (success) {
      if (this.authorityTouched) {
        var now = new Date();
        var timeZone = now.toString().split(' ')[5];
  
        const params: any = {
          meetingId: this.idMeeting,
          personId: this.selectedAttendeAuthority?.idPerson,
          timeZone,
          isAuthority: isAuthority ?? false,
        };
        if(isAuthority){
          params.organization = organization;
          params.role = role;
        }
        await this.meetingSrv.postCheckIn(params);
      }

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
    const attendee = this.selectedAttendeAuthority;
    const result = await this.meetingSrv.deleteCheckIn(this.idMeeting, attendee.idPerson);

    if (result) {
      this.messageSrv.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant('attendance.successDetail.uncheckin')
      });
      this.listAttendees.splice(this.listAttendeesAuthority.findIndex(att => att === attendee), 1);
      await this.setActionBar();
      this.toggleSelectedAttendee();
    } else {
      this.messageSrv.add({
        severity: 'warn',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('attendance.error.couldNotUncheck')
      });
    }
  }

  handleSearchCounty({query}) {
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
