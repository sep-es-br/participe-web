import { attendanceListModeEnum } from './../../../shared/models/Meeting';
import { PersonService } from '@app/shared/services/person.service';
import * as _ from 'lodash';

import {ActivatedRoute, Router} from '@angular/router';
import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {DatePipe, DOCUMENT, Location} from '@angular/common';
import {take} from 'rxjs/operators';
import {MessageService, SelectItem} from 'primeng/api';

import {IPerson} from '@app/shared/interface/IPerson';
import {Locality} from '@app/shared/models/locality';
import {Meeting, typeMeetingEnum} from '@app/shared/models/Meeting';
import {Conference} from '@app/shared/models/conference';
import {MeetingFilterModel} from '@app/shared/models/MeetingFilterModel';
import {calendar} from '@app/shared/constants';
import {ActionBarService} from '@app/core/actionbar/app.actionbar.actions.service';
import {BreadcrumbService} from '@app/core/breadcrumb/breadcrumb.service';
import {ConferenceService} from '@app/shared/services/conference.service';
import {LocalityService} from '@app/shared/services/locality.service';
import {MeetingService} from '@app/shared/services/meeting.service';
import {ModerationService} from '@app/shared/services/moderation.service';
import {PlanService} from '@app/shared/services/plan.service';
import {TranslateChangeService} from '@app/shared/services/translateChange.service';
import {TranslateService} from '@ngx-translate/core';
import {IResultPlanItemByConference} from '@app/shared/interface/IResultPlanItemByConference';
import {IChannel} from '@app/shared/interface/IChannel';
import {CustomValidators} from '@app/shared/util/CustomValidators';
import { ModalService } from '@app/core/modal/modal.service';
import { ModalData } from '@app/shared/interface/IModalData';
import {$} from 'protractor';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss'],
})
export class MeetingComponent implements OnInit, OnDestroy {
  edit = false;
  search = false;
  localitycitizenSelected = false;
  showSelectConference: boolean = false;
  optionsTypesMeeting: SelectItem[];
  optionsAttendanceListModes: SelectItem[];
  typesMeetingEnum = typeMeetingEnum;
  typeMeetingAlreadySet = false;
  attendaceListModesEnum = attendanceListModeEnum;

  form: UntypedFormGroup;
  searchForm: UntypedFormGroup;
  searchFormReceptionists: UntypedFormGroup;
  formChannels: UntypedFormGroup;
  conference: Conference;
  conferenceId: number;
  meetings: Meeting[] = [];
  meetingId: number;
  labelLocality: string;
  localities: SelectItem[] = [];
  localitiesCover: SelectItem[] = [];
  planItems: SelectItem[] = [];
  plans: SelectItem[] = [];
  minDate: Date = new Date();
  calendarTranslate: any;
  selfdeclarations = 0;
  conferencesActives: Conference[] = [];
  conferenceSelect: Conference = new Conference();
  receptionistsSearch: IPerson[] = [];
  receptionistsActived: IPerson[] = [];
  channels: IChannel[] = [];
  clonedChannels: IChannel[] = [];

  resultBeginDate:any;
  resultEndDate:any;
  beginDateLengh1:string;
  beginDateLengh2:number;
  endDateLengh1:string;
  endDateLengh2:number;
  showModalLink:Boolean = false;
  modalData: ModalData;
  meetingDataSelected?:Meeting;
  meetingUrl: {
    url: string
  };
  ImageQrCode:any;

  localityPlaceValidators = Validators.required;
  addressValidators = Validators.required;
  placeValidators = Validators.required;

  constructor(
    private breadcrumbSrv: BreadcrumbService,
    private meetingSrv: MeetingService,
    private conferenceSrv: ConferenceService,
    public localitySrv: LocalityService,
    private planSrv: PlanService,
    private personSrv: PersonService,
    private formBuilder: UntypedFormBuilder,
    private messageSrv: MessageService,
    private translate: TranslateService,
    private translateChange: TranslateChangeService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private actionbarSrv: ActionBarService,
    private moderationSrv: ModerationService,
    private datePipe: DatePipe,
    private location: Location,
    private ModalService: ModalService,
    @Inject(DOCUMENT) private document: Document,
  ) {
  }

  private static getDate(str) {
    if (str instanceof Date) {
      return new Date(str);
    }

    if(str === '') return undefined;
    const [dateStr, timeStr] = str.split(' ');
    const args = dateStr.split('/');
    const argsTime = timeStr.split(':');
    return argsTime[2] ?
        new Date(args[2], (args[1] - 1), args[0], argsTime[0], argsTime[1], argsTime[2])
      : new Date(args[2], (args[1] - 1), args[0], argsTime[0], argsTime[1]);
  }

  private static markFormGroupTouched(formGroup: UntypedFormGroup) {
    formGroup.markAllAsTouched();
  }

  ngOnDestroy(): void {
    this.actionbarSrv.setItems([]);
  }

  ngOnInit() {
    this.activeRoute.params.pipe(take(1)).subscribe(async ({id}) => {
      this.conferenceId = +id;
      await this.prepareScreen();
    });
  }

  async selectOtherConference(conference: Conference) {
    this.conferenceId = conference.id;
    await this.prepareScreen();
    this.showSelectConference = false;
    this.location.replaceState(`/administration/conferences/${conference.id}/meeting`);
  }

  async loadConferencesActives() {
    try {
      const data = await this.moderationSrv.getConferencesActive(true);
      this.conferencesActives = data;
      if (data.length > 0) {
        this.conferenceSelect = data[0];
      }
    } catch (error) {
      console.error(error);
      this.messageSrv.add({
        severity: 'error', summary: 'Erro',
        detail: this.translate.instant('meeting.error.fetch.conferenceActive'),
      });
    }
  }

  configureActionBar() {
    this.actionbarSrv.setItems([
      {
        position: 'LEFT', handle: () => {
          this.showSelectConference = !this.showSelectConference;
        }, icon: 'change.svg',
      },
    ]);
  }

  async populateLocalities() {
    try {
      const {
        localities,
        nameType
      } = await this.localitySrv.getLocalitiesBasedOnConferenceCitizenAuth(this.conferenceId);
      this.localities = localities.map(({id, name}) => ({value: {id}, label: name}));
      this.labelLocality = nameType;
      const {localities: localitiesCover} = await this.localitySrv.findByConference(this.conferenceId);
      this.localitiesCover = localitiesCover.map(({id, name}) => ({value: {id}, label: name}));
    } catch (error) {
      this.messageSrv.add({
        severity: 'error', summary: this.translate.instant('error'),
        detail: this.translate.instant('conference.meeting.error.fetch.localities'),
      });
    }
  }

  async loadPlanItemsTargetedBy() {
    try {
      const planItemsData = await this.meetingSrv.getPlanItemsTargetedByConference(this.conferenceId);
      this.planItems = planItemsData.map(({id, name}) => ({value: {id}, label: name}));
      if (!(this.planItems.length > 0)) {
        this.form.controls.segmentations.clearValidators();
      }
    } catch (error) {
      this.messageSrv.add({
        severity: 'error', summary: this.translate.instant('error'),
        detail: this.translate.instant('conference.meeting.error.fetch.plan-items'),
      });
    }
  }

  async populatePlans() {
    try {
      const plans = await this.planSrv.listAll(null);
      this.plans = plans.map(({id, domain, localitytype, name}) => ({value: {id, domain, localitytype}, label: name}));
    } catch (error) {
      this.messageSrv.add({
        severity: 'error', summary: this.translate.instant('error'),
        detail: this.translate.instant('conference.meeting.error.fetch.plans'),
      });
    }
  }

  async loadMeetings(formData?) {
    let name = _.get(formData, 'name', '');
    name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    name = name.replace(/[^a-z0-9]/gi, ' ');
    name = name.replace(/\s\s+/g, ' ').trim();

    const filter: MeetingFilterModel = new MeetingFilterModel();

    filter.beginDate = _.get(formData, 'beginDate');
    if (filter.beginDate) {
      filter.beginDate = this.datePipe.transform(filter.beginDate, 'dd/MM/yyyy HH:mm:ss');
    }

    filter.endDate = _.get(formData, 'endDate');
    if (filter.endDate) {
      filter.endDate = this.datePipe.transform(filter.endDate, 'dd/MM/yyyy HH:mm:ss');
    }

    const localities: Locality[] = _.get(formData, 'localities', new Array<Locality>());
    if (localities.length > 0) {
      filter.localities = localities.map(l => l.id);
    }
    filter.name = name;
    const {content} = await this.meetingSrv.getSearch(this.conferenceId, filter, {pageSize: 9999});
    this.meetings = content;
  }

  loadOptionsTypesMeeting() {
    this.optionsTypesMeeting = [
      {value: typeMeetingEnum.PRESENCIAL, label: this.translate.instant('conference.meeting.type.presential')},
      {value: typeMeetingEnum.VIRTUAL, label: this.translate.instant('conference.meeting.type.virtual')},
      {
        value: typeMeetingEnum.PRESENCIAL_VIRTUAL,
        label: this.translate.instant('conference.meeting.type.presential-virtual')
      },
    ];
  }

  loadOptionsAttendanceListModes() {
    this.optionsAttendanceListModes = [
      {value: attendanceListModeEnum.AUTO, label: this.translate.instant('conference.meeting.attendanceListMode.auto')},
      {value: attendanceListModeEnum.MANUAL, label: this.translate.instant('conference.meeting.attendanceListMode.manual')},
    ];
  }


  validTypeDifferentFromVirtual() {
    return this.form.value.type !== typeMeetingEnum.VIRTUAL;
  }

  validTypeDifferentFromPresential() {
    return this.form.value.type !== typeMeetingEnum.PRESENCIAL;
  }

  async handleSearchReceptionists(form) {
    const mail = _.get(form, 'mail');
    const name = _.get(form, 'name');
    this.receptionistsSearch = await this.conferenceSrv.searchReceptionists(name, mail);
    if (this.receptionistsSearch) {
      this.receptionistsSearch.sort((a, b) => (this.comparePersonName(a, b)));
    }
  }

/*

  async addReceptionist(receptionist: IPerson) {
    let person = await this.meetingSrv.getReceptionistByEmail(receptionist.contactEmail);
    if (!person) {
      person = await this.personSrv.postOperator('Recepcionist', receptionist);
    }
    if (person) {
      person.name = receptionist.name;
      if (!this.receptionistsActived) {
        this.receptionistsActived = [];
      }
      if (!(this.receptionistsActived.find((p) => (p.contactEmail === person.contactEmail)))) {
        this.receptionistsActived.push(person);
      }
      this.setFormSearchReceptionists();
    }
  }
*/

  async activateReceptionist(receptionist: IPerson) {
    if (!this.receptionistsActived) {
      this.receptionistsActived = [];
    }
    if (!(this.receptionistsActived.find(await ((p) => (p.contactEmail === receptionist.contactEmail))))) {
      this.receptionistsActived.push(receptionist);
    }
    if (this.receptionistsActived) {
      this.receptionistsActived.sort((a, b) => this.comparePersonName(a, b));
    }

    this.setFormSearchReceptionists();
  }

  comparePersonName( a, b ) {
    let aName: string = a.name;
    let bName: string = b.name;
    aName = aName.normalize().toUpperCase();
    bName = bName.normalize().toUpperCase();
    if ( aName < bName ) {
      return -1;
    }
    if ( aName > bName ) {
      return 1;
    }
    return 0;
  }

  removeReceptionist(index: number) {
    this.receptionistsActived.splice(index, 1);
  }

  async clearSearch() {
    this.setFormSearch();
    await this.loadMeetings();
  }

  toggleSearch() {
    this.search = !this.search;
  }

  changeTypeMeeting() {
    const typeMeeting = this.form.value.type;
    const {localityPlace, address, place} = this.form.controls;
    const {name, url, containsChannel} = this.formChannels.controls;

    this.form.reset();
    this.setForm({typeMeetingEnum: typeMeeting});


    if (typeMeeting === typeMeetingEnum.PRESENCIAL) {
      this.formChannels.reset();
      localityPlace.setValidators(this.localityPlaceValidators);
      address.setValidators(this.addressValidators);
      place.setValidators(this.placeValidators);

      url.clearValidators();
      name.clearValidators();
      containsChannel.clearValidators();

    } else {

      name.setValidators([Validators.required, CustomValidators.noWhitespaceValidator]);

      url.setValidators([Validators.required, CustomValidators.ChannelURL]);

      containsChannel.setValidators([CustomValidators.DoesNotContainChannel]);
    }
    containsChannel.updateValueAndValidity();
    url.updateValueAndValidity();
    name.updateValueAndValidity();
  }

  goToLink(url: string) {
    window.open(url, '_blank');
  }

  handleAddChannel() {
    this.formChannels.controls.containsChannel.clearValidators();
    this.formChannels.controls.containsChannel.updateValueAndValidity();

    const {url, name} = this.formChannels.value;

    const isGreaterThanZero = name.trim().length > 0 && url.trim().length > 0;
    const isUrlValid = this.isUrlValid(url);

    if (!isGreaterThanZero) {
      this.messageSrv.add({
        severity: 'error', summary: this.translate.instant('error'),
        detail: this.translate.instant('conference.meeting.error.channel-name-empty'),
      });
      return;
    }

    if (!isUrlValid) {
      this.messageSrv.add({
        severity: 'error', summary: this.translate.instant('error'),
        detail: this.translate.instant('conference.meeting.error.channelUrlInvalid'),
      });
      return;
    }

    if (this.channels && this.channels.length > 0) {
      this.channels.push({
        ...this.formChannels.value,
        tableId: this.channels.length + 1,
      });
    } else {
      this.channels = [{
        ...this.formChannels.value,
        tableId: 1,
      }];
    }
    this.formChannels.get('name').reset();
    this.formChannels.get('url').reset();

    this.formChannels.controls.name.clearValidators();
    this.formChannels.controls.name.updateValueAndValidity();

    this.formChannels.controls.url.clearValidators();
    this.formChannels.controls.url.updateValueAndValidity();
  }

  isUrlValid(url: string): boolean {
    // tslint:disable-next-line: max-line-length
    const regexUri = /^([a-z][a-z0-9+.-]*):(?:\/\/((?:(?=((?:[a-z0-9-._~!$&'()*+,;=:]|%[0-9A-F]{2})*))(\3)@)?(?=(\[[0-9A-F:.]{2,}]|(?:[a-z0-9-._~!$&'()*+,;=]|%[0-9A-F]{2})*))\5(?::(?=(\d*))\6)?)(\/(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*))\8)?|(\/?(?!\/)(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*))\10)?)(?:\?(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9A-F]{2})*))\11)?(?:#(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9A-F]{2})*))\12)?$/i;
    return regexUri.test(url);
  }

  onRowEditChannelInit(channel: IChannel) {
    this.clonedChannels[channel.tableId] = {...channel};
  }

  onRowEditChannelSave(channel: IChannel) {
    if (channel.name.length > 0 && channel.url.length > 0) {
      delete this.clonedChannels[channel.tableId];
      this.messageSrv.add({
        severity: 'success',
        summary: 'Success',
        detail: this.translate.instant('conference.meeting.success.update')
      });
    } else {
      this.messageSrv.add({
        severity: 'error',
        summary: 'Error',
        detail: this.translate.instant('conference.meeting.error.edit-channel')
      });
    }
  }

  onRowEditChannelCancel(channel: IChannel, index: number) {
    this.channels[index] = this.clonedChannels[channel.tableId];
    delete this.clonedChannels[channel.tableId];
  }

  onDeleteChannel(index: number) {
    this.channels.splice(index, 1);
  }

  setForm(value?) {
    this.form = this.formBuilder.group({
      type: [{
        value: _.get(value, 'typeMeetingEnum', typeMeetingEnum.PRESENCIAL),
        disabled: false
      }, [Validators.required]],
      name: [_.get(value, 'name', ''), [Validators.required]],
      authorityLink: [`${this.document.location.origin.replace('4000', '4200')}/${this.location.prepareExternalUrl(`/authority-credential/${this.meetingId}`)}`],
      beginDate: [_.get(value, 'beginDate', ''), [Validators.required]],
      endDate: [_.get(value, 'endDate', ''), [Validators.required]],
      localityPlace: [_.get(value, 'localityPlace', '')],
      address: [_.get(value, 'address', '')],
      place: [_.get(value, 'place', '')],
      localityCovers: [_.get(value, 'localityCovers', ''), [Validators.required]],
      segmentations: [_.get(value, 'segmentations', '')],
      attendanceListMode: [{
        value: _.get(value, 'attendanceListMode', attendanceListModeEnum.AUTO),
        disabled: false
      }, [Validators.required]],
    });

    this.minDate = MeetingComponent.getDate(_.get(value, 'beginDate', ''));
  }

  setFormSearch(value?) {
    this.searchForm = this.formBuilder.group({
      name: [_.get(value, 'name', '')],
      beginDate: [_.get(value, 'beginDate', '')],
      endDate: [_.get(value, 'endDate', '')],
      localities: [_.get(value, 'localities', '')],
    });
  }

  setFormSearchReceptionists(value?) {
    this.searchFormReceptionists = this.formBuilder.group({
      mail: [_.get(value, 'mail', '')],
    });
  }

  setFormChannels() {
    this.formChannels = this.formBuilder.group({
      name: [''],
      url: [''],
      containsChannel: [''],
    });
  }

  async cancel() {
    this.typeMeetingAlreadySet = false;
    this.router.navigated = false;
    await this.router.navigateByUrl(this.location.path());
    this.selfdeclarations = 0;
  }

  async handleCreateOrEdit(meetingId?: number) {
    this.edit = true;

    this.buildBreadcrumb();

    if (meetingId) {
      this.typeMeetingAlreadySet = true;
      const meeting = await this.meetingSrv.getMeetingById(meetingId);
      meeting.localityCovers = _.map(meeting.localityCovers as Locality[], l => ({id: l.id}) as any);
      meeting.segmentations = _.map(meeting.segmentations as IResultPlanItemByConference[], s => ({id: s.id}) as any);
      meeting.localityPlace = {id: _.get(meeting, 'localityPlace.id')} as any;

      this.receptionistsActived = meeting.receptionists as IPerson[];
      if (this.receptionistsActived) {
        this.receptionistsActived.forEach(async (rec) => {
          const acPeople = await this.conferenceSrv.searchReceptionists('', rec.contactEmail);
          const acPerson = acPeople.find((p) => (p.contactEmail === rec.contactEmail));
          if (acPerson) {
            rec.name = acPerson.name;
          }
        });
      }
      if (this.receptionistsActived) {
        this.receptionistsActived.sort((a, b) => (this.comparePersonName(a, b)));
      }


      this.meetingId = meetingId;
      this.channels = meeting.channels ? meeting.channels : [];
      this.setForm(meeting);
    }
  }

  handleShowPanel(meetingId?: Number) {
    if (!meetingId) {
      return;
    }

    //this.location.replaceState(`/administration/conferences/${this.conference.id}/meeting/${meetingId}/panel`);

    const url = this.router.serializeUrl(
      this.router.createUrlTree([`/administration/conferences/${this.conference.id}/meeting/${meetingId}/panel`]));

      //this.router.navigate(['../', 'meetingId', 'panel', '_blank'], {relativeTo: this.activeRoute})
      window.open('#' + url, '_blank');
  }

  changeBeginDate(event) {
    this.minDate = MeetingComponent.getDate(event);
    if (_.get(this.form, 'value.endDate')) {
      const endDate = MeetingComponent.getDate(this.form.value.endDate);
      if (endDate < this.minDate) {
        this.form.get('endDate').setValue(this.minDate);
      }
    }
  }

  async save(form: Meeting) {
    try {
      if (this.channels && this.form.value.type !== typeMeetingEnum.PRESENCIAL && this.channels.length === 0) {
        this.formChannels.controls.name.setValidators([Validators.required]);
        this.formChannels.controls.name.updateValueAndValidity();

        this.formChannels.controls.url.setValidators([Validators.required, CustomValidators.ChannelURL]);
        this.formChannels.controls.url.updateValueAndValidity();

        this.formChannels.controls.containsChannel.setValidators([CustomValidators.DoesNotContainChannel]);
        this.formChannels.controls.containsChannel.updateValueAndValidity();
      }

      MeetingComponent.markFormGroupTouched(this.form);
      MeetingComponent.markFormGroupTouched(this.formChannels);

      if (!this.isValidForm(this.form) || !this.isValidForm(this.formChannels)) {
        return;
      }

      if (this.receptionistsActived) {
        for (let i = 0 ; this.receptionistsActived.length > i ; i++) {
          if (!this.receptionistsActived[i].id) {
            const a = await this.personSrv.postOperator('Recepcionist', this.receptionistsActived[i]);
            const p = await this.meetingSrv.getReceptionistByEmail(this.receptionistsActived[i].contactEmail);
            this.receptionistsActived[i] = p;
          }
        }
      }

      const sender = {...form} as Meeting;
      sender.receptionists = this.receptionistsActived ? this.receptionistsActived.map(r => r.id) : [];
      sender.channels = this.channels;
      this.resultBeginDate=   sender.beginDate;
      this.beginDateLengh1 = this.resultBeginDate;
      this.beginDateLengh2=   this.beginDateLengh1.length;
      this.resultEndDate=   sender.endDate;
      this.endDateLengh1 = this.resultEndDate;
      this.endDateLengh2=   this.endDateLengh1.length;
      if(this.beginDateLengh2 == 16){
        sender.beginDate = this.datePipe.transform(MeetingComponent.getDate(sender.beginDate + ':00'), 'dd/MM/yyyy HH:mm:ss');
      }else{
        sender.beginDate = this.datePipe.transform(MeetingComponent.getDate(sender.beginDate), 'dd/MM/yyyy HH:mm:ss');
        sender.beginDate = this.datePipe.transform(MeetingComponent.getDate(sender.beginDate + ':00'), 'dd/MM/yyyy HH:mm:ss');
      }
      if(this.endDateLengh2 == 16){
        sender.endDate = this.datePipe.transform(MeetingComponent.getDate(sender.endDate + ':00'), 'dd/MM/yyyy HH:mm:ss');
      }else{
        sender.endDate = this.datePipe.transform(MeetingComponent.getDate(sender.endDate), 'dd/MM/yyyy HH:mm:ss');
        sender.endDate = this.datePipe.transform(MeetingComponent.getDate(sender.endDate + ':00'), 'dd/MM/yyyy HH:mm:ss');
      }
      sender.localityPlace = _.get(sender, 'localityPlace.id');
      sender.localityCovers = _.map((sender.localityCovers as Locality[]), l => l.id);
      sender.segmentations = _.map((sender.segmentations as IResultPlanItemByConference[]), p => p.id);
      sender.attendanceListMode = (this.form.value.type === typeMeetingEnum.VIRTUAL) ? 'MANUAL' : this.form.value.attendanceListMode;
      sender.conference = this.conferenceId;
      const result = await this.meetingSrv.save(sender, this.meetingId);
      const messageSuccess = this.meetingId ? 'conference.meeting.success.updated' : 'conference.meeting.success.created';

      setTimeout(() => {
        this.messageSrv.add({
          severity: 'success',
          summary: this.translate.instant('success'),
          detail: this.translate.instant(messageSuccess, {name: result.name}),
          life: 8000,
        });
      }, 5000);

      await this.loadMeetings();
      await this.cancel();

    } catch (err) {
      console.error(err);
      this.messageSrv.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('conference.meeting.error.saving'),
      });
    }
  }

  async handleDelete(meeting: Meeting) {
    try {
      const result = await this.meetingSrv.delete(meeting);
      if (result) {
        await this.loadMeetings();
        return this.messageSrv.add({
          severity: 'success',
          summary: this.translate.instant('success'),
          detail: this.translate.instant('conference.meeting.success.delete', {name: meeting.name}),
        });
      }
    } catch (error) {
      return this.messageSrv.add({
        severity: 'warn',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('conference.meeting.error.delete', {name: meeting.name}),
      });
    }
  }

  private async prepareScreen() {
    await this.loadConference(this.conferenceId);
    this.buildBreadcrumb();
    this.setFormSearch();
    this.setFormSearchReceptionists();
    this.setFormChannels();
    this.setForm();
    await this.populateLocalities();
    await this.populatePlans();
    this.configureActionBar();
    await this.loadConferencesActives();
    await this.loadMeetings();
    this.loadOptionsTypesMeeting();
    this.loadOptionsAttendanceListModes();
    await this.loadPlanItemsTargetedBy();
    this.translateChange.getCurrentLang().subscribe(({lang}) => {
      this.calendarTranslate = calendar[lang];
    });
  }

  private buildBreadcrumb() {
    const presentialMeetingItem = {
      label: 'administration.presential-meeting'
    };

    const conferenceNameItem = {
      label: this.translate.instant('administration.conference-name', {name: this.conference.name}),
      routerLink: ['/administration/conferences/']
    };

    if (this.edit) {
      conferenceNameItem.routerLink[0] += `${this.conferenceId}/meeting`;
    }

    this.breadcrumbSrv.setItems([presentialMeetingItem, conferenceNameItem]);
  }

  private async loadConference(id: number) {
    this.conferenceId = id;
    this.conference = await this.conferenceSrv.getById(id);
    this.conferenceSelect = this.conference;
  }

  private isValidForm(form, errorMessage = this.translate.instant('erro.invalid.data')) {
    if (!form.valid) {
      this.messageSrv.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: errorMessage,
      });
      return false;
    }
    return true;
  }

  async generateLinkMeetingPrecadastro(meeting: Meeting){
    this.meetingUrl = await this.meetingSrv.generateLinkPreRegistration(meeting.id);
    this.modalData = {title: meeting.name};
    this.ModalService.open('geraLink');
    this.meetingDataSelected = meeting;
  }

  copyUrl(url: string){
    const el = document.createElement('textarea');
    el.value = url;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    this.messageSrv.add({
      severity: 'success',
      summary: this.translate.instant('success'),
      detail: 'Link copiado para a àrea de trnasferência',
    });
  }

  generateQRCodeAutoChekIn(meeting: Meeting){
    this.ImageQrCode = '';
    this.meetingSrv.generateQRCodeAutoCheckIn(meeting.id).
    then(url => {
      this.ImageQrCode = url;
    });
    this.modalData = {title: meeting.name};
    this.ModalService.open('QRCodeImage');
    this.meetingDataSelected = meeting;
  }


}
