import { Inject, Injector } from '@angular/core';
import { MessageService, SelectItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

import { IAttendee } from '../interface/IAttendee';
import { IConferenceWithMeetings } from '../interface/IConferenceWithMeetings';
import { IQueryOptions } from '../interface/IQueryOptions';
import { Meeting } from './Meeting';
import { Locality } from './locality';
import { howLongAgo } from '../util/Date.utils';
import { getColorBasedOnText } from '../util/Colors.utils';
import { ActionBarService } from '@app/core/actionbar/app.actionbar.actions.service';
import { BreadcrumbService } from '@app/core/breadcrumb/breadcrumb.service';
import { ConferenceService } from '../services/conference.service';
import { MeetingService } from '../services/meeting.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CustomValidators } from '../util/CustomValidators';
import { Subscription } from 'rxjs';
import { CitizenSenderModel } from './CitizenSenderModel';
import { CitizenService } from '../services/citizen.service';
import { CitizenAuthenticationModel } from './CitizenAuthenticationModel';
import { LocalityService } from '../services/locality.service';
import * as moment from 'moment';
import { concat } from 'lodash';

export enum AuthTypeEnum {
  CPF = 'CPF',
  EMAIL = 'E-Mail'
}

export class AttendanceModel {

  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  idMeeting: number;
  totalCheckedIn: number;
  totalPreRegistered: number;
  listAttendees: IAttendee[] = [];

  nameSearch: string;
  lastPage = true;
  currentPage = 0;
  pageSize = 30;
  noResult = false;
  isSearching = false;
  isReadonly = false;

  showSelectMeeting = false;
  optionsConference: IConferenceWithMeetings[];
  optionsMeeting: Meeting[];
  openListMeetings: Meeting[];
  closedListMeetings: Meeting[];
  selectedConference: IConferenceWithMeetings;
  selectedMeeting: Meeting;
  currentConference: IConferenceWithMeetings;
  currentMeeting: Meeting;

  isAttendeeSelected = false;
  selectedAttende: IAttendee;
  selectedOrderBy = 'name';
  selectedFilterBy = 'pres';
  citizenAutentications: CitizenAuthenticationModel[] = [];
  authName:string[]

  selectedCounty: Locality;
  localities: Locality[];

  form: UntypedFormGroup;
  localityLabel: string;
  optionsLocalities: SelectItem[];
  authTypeEnum: string[] = Object.values(AuthTypeEnum);
  cpfValidators = [Validators.required, Validators.maxLength(14), CustomValidators.ValidateCPF];
  passwordValidators = [Validators.required, CustomValidators.AttendeeCitizenPassword];
  emailValidators = [Validators.required, Validators.email];
  valueChangeCPFSub: Subscription;

  protected actionbarSrv: ActionBarService;
  protected breadcrumbSrv: BreadcrumbService;
  protected conferenceSrv: ConferenceService;
  protected meetingSrv: MeetingService;
  protected translate: TranslateService;
  protected messageSrv: MessageService;
  protected formBuilder: UntypedFormBuilder;
  protected citizenSrv: CitizenService;
  protected localitySrv: LocalityService;

  constructor(
    @Inject(Injector) injector: Injector,
    private editing: boolean,
  ) {
    this.actionbarSrv = injector.get(ActionBarService);
    this.breadcrumbSrv = injector.get(BreadcrumbService);
    this.conferenceSrv = injector.get(ConferenceService);
    this.meetingSrv = injector.get(MeetingService);
    this.translate = injector.get(TranslateService);
    this.messageSrv = injector.get(MessageService);
    this.formBuilder = injector.get(UntypedFormBuilder);
    this.citizenSrv = injector.get(CitizenService);
    this.localitySrv = injector.get(LocalityService);

    this.form = this.formBuilder.group({
      name: ['', [Validators.required, CustomValidators.noWhitespaceValidator]],
      locality: ['', Validators.required],
      authType: [AuthTypeEnum.CPF, Validators.required],
      cpf: ['', this.cpfValidators],
      password: ['', this.passwordValidators],
      email: [''],
      phone: ['', Validators.maxLength(20)],
      resetPassword: false,
      sub: ['']
    });

    this.getConferencesAndMeetings().then();
  }

  get requestSearch() {
    return this.editing
      ? this.meetingSrv.getListAttendees(this.idMeeting, this.getQueryListAttendees())
      : this.meetingSrv.getListPerson(this.idMeeting, this.getQueryListAttendees());
  }

  get labelBreadCrumb() {
    return this.editing ? 'attendance.edit' : 'attendance.registerAttendanceIn';
  }

  get routerLinkItem() {
    return this.editing ? 'edit' : 'register';
  }

  get citizenHasNativeAuth() {
    return this.citizenAutentications.length > 0 ? this.citizenAutentications.findIndex(c => c.loginName === 'Participe') !== -1 : false;
  }

  async getTotalParticipants() {
    await this.meetingSrv.getTotalParticipantsInMeeting(this.idMeeting, this.getQueryListAttendees()).then(
      (response) => {
        this.totalCheckedIn = response.checkedIn
        this.totalPreRegistered = response.preRegistered
      }
    )
  }

  toggleNewAccount(attendee?: IAttendee) {
  }

  async selectAttendee(attendee: IAttendee) {
    if(!attendee.personId){
      this.toggleNewAccount(attendee);
    }else{
      const { name, locality, authType, cpf, email, phone, password } = this.form.controls;
      try {
        this.isAttendeeSelected = true;
        this.selectedAttende = attendee;
        const {
          success,
          data
        } = await this.citizenSrv.GetById(attendee.personId, { search: { conferenceId: this.currentConference.id } });
        if (success) {
          name.setValue(data.name);
          locality.setValue(data.localityId ? data.localityId : attendee.superLocalityId);
          authType.setValue(AuthTypeEnum.EMAIL);
          this.isReadonly = true
          email.setValue(data.email);
          phone.setValue(data.telephone);
          this.selectedAttende.password = data.password;
          this.citizenAutentications = data.autentication || [];
          this.authName = data.authName || [];
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
  }

  async save(): Promise<{ success: boolean; result?: any }> {
    if (!this.form.valid) {
      this.messageSrv.add({
        severity: 'warn',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('attendance.error.invalidForm'),
      });

      return { success: false };
    }

    const { name, locality, phone, authType, cpf, password, email, resetPassword, sub } = this.form.value;

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

    const result = await this.citizenSrv.save(formAPI as any, this.selectedAttende ? this.selectedAttende.personId : null);

    if (result) {
      this.form.reset();
      return { success: true, result: { ...result, name: formAPI.name, email: formAPI.confirmEmail } };
    }

    this.messageSrv.add({
      severity: 'warn',
      summary: this.translate.instant('error'),
      detail: this.translate.instant('attendance.error.errorSaving'),
    });

    return { success: false };
  }

  async searchByName() {
    if (!this.idMeeting) {
      return;
    }
    this.listAttendees = [];
    this.isSearching = true;
    this.noResult = false;
    this.lastPage = true;
    this.currentPage = 0;
    try {
      const result = await this.requestSearch;
      this.listAttendees = result.content;
      this.lastPage = result.last;
      this.noResult = result.empty;
    } catch(error) {
      this.messageSrv.add({
        severity: 'warn',
        summary: this.translate.instant('error'),
        detail: error.error.message
      });
    }
    await this.setActionBar();
    this.isSearching = false;
    
  }

  async loadNextPageRegister() {
    this.isSearching = true;
    try {
      const result = await this.meetingSrv.getListPerson(this.idMeeting, this.getQueryListAttendees(true));
      this.lastPage = result.last;
      this.listAttendees = this.listAttendees.concat(result.content);
    } catch (error){
      this.messageSrv.add({
        severity: 'warn',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('attendance.error.whenSearching'),
      });
    }

    await this.setActionBar();
    this.isSearching = false;
  }

  async loadNextPageEdit() {
    this.isSearching = true;
    try {
      const result = await this.meetingSrv.getListAttendees(this.idMeeting, this.getQueryListAttendees(true));
      this.lastPage = result.last;
      this.listAttendees = this.listAttendees.concat(result.content);
    } catch {
      this.messageSrv.add({
        severity: 'warn',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('attendance.error.whenSearching'),
      });
    }

    await this.setActionBar();
    this.isSearching = false;
  }
  handleChangeAuthType(value: AuthTypeEnum) {
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
        if (this.isAttendeeSelected) {
          if (this.selectedAttende.email.indexOf('@cpf') > 0) {
            cpfControl.setValue(this.getCPFFromEmailField(this.selectedAttende.email));
            passwordControl.setValue(this.selectedAttende.password);
          }
        }
        break;
      case AuthTypeEnum.EMAIL:
        cpfControl.clearValidators();
        cpfControl.disable();
        passwordControl.clearValidators();
        passwordControl.disable();
        emailControl.setValidators(this.emailValidators);
        emailControl.enable();
        if (this.isAttendeeSelected && this.selectedAttende.email.indexOf('@cpf') === -1) {
          emailControl.setValue(this.selectedAttende.email);
        }
        break;
    }
  }

  handleChangeConference(item? : IConferenceWithMeetings) {
    if(!item){
      this.openListMeetings = this.getRunningMeeting(this.selectedConference.meeting, 'open');
      this.closedListMeetings = this.getRunningMeeting(this.selectedConference.meeting, 'closed');
    }else{
      this.openListMeetings = this.getRunningMeeting(item.meeting, 'open');
      this.closedListMeetings = this.getRunningMeeting(item.meeting, 'closed');
      this.selectedConference = item
    }

    if (this.openListMeetings.length > 0) {
      this.openListMeetings.sort((b, a) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
      this.optionsMeeting = concat(this.openListMeetings, this.closedListMeetings)
      this.selectedMeeting = this.optionsMeeting[0]

    } else {
      this.optionsMeeting = this.optionsMeeting = concat(this.openListMeetings, this.closedListMeetings)
      this.selectedMeeting = this.optionsMeeting[0]
    }
  }

  callbackHideModal() {
    setTimeout(() => {
      if (this.currentConference !== this.selectedConference || this.currentMeeting !== this.selectedMeeting) {
        this.selectedConference = this.currentConference;
        this.optionsMeeting = this.currentConference.meeting;
        this.selectedMeeting = this.currentMeeting;
      }
    }, 500);
  }

  async setCurrentMeeting() {
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
        { label: 'attendance.label' },
        {
          label: `${this.labelBreadCrumb} ${this.currentMeeting.name}`,
          routerLink: [`/attendance/${this.routerLinkItem}`]
        },
      ]);
    }

    await this.searchByName();
    await this.setActionBar();
    // await this.searchByName();
    this.showSelectMeeting = false;
  }

  async setActionBar() {

    await this.getTotalParticipants();

    this.actionbarSrv.setItems([
      {
        position: 'LEFT',
        handle: () => this.showSelectMeeting = !this.showSelectMeeting,
        icon: 'change.svg',
      },
      {
        position: 'RIGHT',
        handle: () => {},
        icon: 'user-solid.svg',
        label: `${this.totalCheckedIn} ${this.translate.instant('attendance.attendant')}`,
      },
      {
        position: 'RIGHT',
        handle: () => {},
        icon: 'preregister_phone.svg',
        label: `${this.totalPreRegistered} Pré-credenciados`
      }
    ]);
  }

  async cleanListAtendees() {
    this.listAttendees = [];
    this.nameSearch = '';
  }

  async getConferencesAndMeetings() {
    const date = moment().format('DD/MM/YYYY HH:mm:ss');
    const result = await this.conferenceSrv.getConferencesWithPresentialMeetings(date);
    this.optionsConference = result;

    this.optionsConference.forEach(item => {
      if (item.meeting.length > 0) {
        this.handleChangeConference(item)
      }
    })

    await this.setCurrentMeeting();
  }

  getRunningMeeting(meetings: Meeting[], type: string): Meeting[] {

    let now = Date.now();
    let runningMeeting = meetings.filter((m) => {
      let start = new Date(
        +m.beginDate.toString().substring(6, 10), // Year
        +m.beginDate.toString().substring(3, 5) - 1, // Month
        +m.beginDate.toString().substring(0, 2), // Day
        0, 0, 0, 0);
      let end = new Date(
        +m.endDate.toString().substring(6, 10), // Year
        +m.endDate.toString().substring(3, 5) - 1, // Month
        +m.endDate.toString().substring(0, 2), // Day
        23, 59, 59, 999);

      let openMeeting = (now.valueOf() >= start.valueOf()) && (now.valueOf() <= end.valueOf())
      let closedMeeting = !((now.valueOf() >= start.valueOf()) && (now.valueOf() <= end.valueOf()))
      
      if (type == 'open') {
        return openMeeting
      } else if (type == 'closed') {
        return closedMeeting
      }
    })
    return runningMeeting
  }

  async getLocalitiesBasedOnConference() {
    try {
      const result = await this.localitySrv.getLocalitiesBasedOnConferenceCitizenAuth(this.selectedConference.id);
      this.localityLabel = result.nameType;
      this.localities = result.localities;
      this.optionsLocalities = result.localities.map(({ id, name }) => ({ label: name, value: id }));
    } catch (error) {
      this.messageSrv.add({
        severity: 'warn',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('attendance.error.couldNotGetLocalities'),
      });
    }
  }

  getQueryListAttendees(nextPage?: boolean): IQueryOptions {
    return {
      search: {
        name: this.nameSearch,
        size: this.pageSize,
        page: nextPage ? ++this.currentPage : this.currentPage,
        sort: this.selectedOrderBy,
        filter: this.selectedFilterBy,
        ...this.selectedCounty ? { localities: this.selectedCounty.id } : {},
      },
    };
  }

  getHowLongAgo(when: string): string {
    // API date format dd/mm/yyyy hh:mm:ss
    const [strDate, strTime] = when.split(' ');
    const [day, month, year] = strDate.split('/');

    const date = new Date(`${month}-${day}-${year} ${strTime}`);
    return howLongAgo(date, this.translate.defaultLang);
  }

  getToolTipText(person: IAttendee): string {
    if (!person.name) {
      return this.translate.instant('attendance.tooltipLabelView');
    }
    const names = person.name.trim().split(' ');
    const customName = names.length > 2 ? `${names[0]} ${names[names.length - 1]}` : names.join(' ');
    return this.translate.instant('attendance.tooltipLabelView') + customName;
  }

  getListOfLettersForLoading(): string[] {
    const lastInListLetter = this.listAttendees?.length > 0 ? this.listAttendees[this.listAttendees.length - 1].name.trim()[0] : 'A';
    const indexLastLetter = this.alphabet.indexOf(lastInListLetter.toUpperCase());
    return this.alphabet.split('').splice(indexLastLetter, this.pageSize);
  }

  getNameIconColor(name: string) {
    return getColorBasedOnText(name);
  }

  getCPFFromEmailField(emailStr: string): string {
    return !!emailStr ? emailStr.slice(0, emailStr.indexOf('@')) : '';
  }

  toggleSelectedAttendee() {
    this.isAttendeeSelected = !this.isAttendeeSelected;
    this.selectedAttende = null;
    this.authName = [];
    this.form.reset();
  }
}
