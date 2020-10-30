import * as _ from 'lodash';

import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe, Location } from '@angular/common';
import { take } from 'rxjs/operators';
import { MessageService, SelectItem } from 'primeng/api';

import { IPerson } from '@app/shared/interface/IPerson';
import { Locality } from '../../../shared/models/locality';
import { Meeting } from '../../../shared/models/Meeting';
import { Conference } from '@app/shared/models/conference';
import { MeetingFilterModel } from './../../../shared/models/MeetingFilterModel';
import { calendar } from './../../../shared/constants';
import { ActionBarService } from '../../../core/actionbar/app.actionbar.actions.service';
import { BreadcrumbService } from '@app/core/breadcrumb/breadcrumb.service';
import { ConferenceService } from '@app/shared/services/conference.service';
import { LocalityService } from './../../../shared/services/locality.service';
import { MeetingService } from './../../../shared/services/meeting.service';
import { ModerationService } from '../../../shared/services/moderation.service';
import { PlanService } from '@app/shared/services/plan.service';
import { TranslateChangeService } from './../../../shared/services/translateChange.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss']
})
export class MeetingComponent implements OnInit, OnDestroy {
  edit = false;
  search = false;
  localitycitizenSelected = false;
  showSelectConference: boolean = false;

  form: FormGroup;
  searchForm: FormGroup;
  searchFormReceptionists: FormGroup;
  conference: Conference;
  conferenceId: number;
  meetings: Meeting[] = [];
  meetingId: number;
  labelLocality: string;
  localities: SelectItem[] = [];
  localitiesCover: SelectItem[] = [];
  plans: SelectItem[] = [];
  minDate: Date = new Date();
  calendarTranslate: any;
  selfdeclarations = 0;
  conferencesActives: Conference[] = [];
  conferenceSelect: Conference = new Conference();
  receptionistsSearch: IPerson[] = [];
  receptionistsActived: IPerson[] = [];

  constructor(
    private breadcrumbSrv: BreadcrumbService,
    private meetingSrv: MeetingService,
    private conferenceSrv: ConferenceService,
    public localitySrv: LocalityService,
    private planSrv: PlanService,
    private formBuilder: FormBuilder,
    private messageSrv: MessageService,
    private translate: TranslateService,
    private translateChange: TranslateChangeService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private actionbarSrv: ActionBarService,
    private moderationSrv: ModerationService,
    private datePipe: DatePipe,
    private location: Location
  ) { }

  ngOnDestroy(): void {
    this.actionbarSrv.setItems([]);
  }

  ngOnInit() {
    this.activeRoute.params.pipe(take(1)).subscribe(async ({ id }) => {
      this.conferenceId = +id;
      this.prepareScreen();
    });
  }

  private async prepareScreen() {
    await this.loadConference(this.conferenceId);
    this.buildBreadcrumb();
    this.setFormSearch();
    this.setFormSearchReceptionists();
    this.setForm();
    this.populateLocalities();
    this.populatePlans();
    this.configureActionBar();
    this.loadConferencesActives();
    this.handleSearch();
    this.translateChange.getCurrentLang().subscribe(({ lang }) => {
      this.calendarTranslate = calendar[lang];
    });
  }

  private buildBreadcrumb() {
    this.breadcrumbSrv.setItems([
      { label: 'administration.presential-meeting' },
      {
        label: this.translate.instant('administration.conference-name',
          { name: this.conference.name }), routerLink: [`/administration/conferences/`]
      },
    ]);
  }

  async selectOtherConference(conference: Conference) {
    this.conferenceId = conference.id;
    this.prepareScreen();
    this.showSelectConference = false;
    this.location.replaceState(`/administration/conferences/${conference.id}/meeting`);

  }

  private async loadConference(id: number) {
    this.conferenceId = id;
    this.conference = await this.conferenceSrv.getById(id);
    this.conferenceSelect = this.conference;
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
        detail: this.translate.instant('meeting.error.fetch.conferenceActive')
      });
    }
  }

  configureActionBar() {
    this.actionbarSrv.setItems([
      {
        position: 'LEFT', handle: () => {
          this.showSelectConference = !this.showSelectConference;
        }, icon: 'change.svg'
      }
    ]);
  }

  async populateLocalities() {
    try {
      const { localities, nameType } = await this.localitySrv.getLocalitiesBasedOnConferenceCitizenAuth(this.conferenceId);
      this.localities = localities.map(({ id, name }) => ({ value: { id }, label: name }));
      this.labelLocality = nameType;
      const { localities: localitiesCover } = await this.localitySrv.findByConference(this.conferenceId);
      this.localitiesCover = localitiesCover.map(({ id, name }) => ({ value: { id }, label: name }));
    } catch (error) {
      this.messageSrv.add({
        severity: 'error', summary: this.translate.instant('error'),
        detail: this.translate.instant('conference.meeting.error.fetch.localities')
      });
    }
  }

  async populatePlans() {
    try {
      const plans = await this.planSrv.listAll(null);
      this.plans = plans.map(({ id, domain, localitytype, name }) => ({ value: { id, domain, localitytype }, label: name }));
    } catch (error) {
      this.messageSrv.add({
        severity: 'error', summary: this.translate.instant('error'),
        detail: this.translate.instant('conference.meeting.error.fetch.plans')
      });
    }
  }

  async handleSearch(formData?) {
    let name = _.get(formData, 'name', '');
    name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    name = name.replace(/[^a-z0-9]/gi, ' ');
    name = name.replace(/\s\s+/g, ' ').trim();

    const filter: MeetingFilterModel = new MeetingFilterModel();

    filter.beginDate = _.get(formData, 'beginDate');
    if (filter.beginDate) { filter.beginDate = this.datePipe.transform(filter.beginDate, 'dd/MM/yyyy'); }

    filter.endDate = _.get(formData, 'endDate');
    if (filter.endDate) { filter.endDate = this.datePipe.transform(filter.endDate, 'dd/MM/yyyy'); }

    const localities = _.get(formData, 'localities', []);
    filter.localities = localities.map(l => l.id);
    filter.name = name;
    const { content } = await this.meetingSrv.getSearch(this.conferenceId, filter);
    this.meetings = content;
  }

  async handleSearchReceptionists(form) {
    const mail = _.get(form, 'mail');
    const name = _.get(form, 'name');
    const receptionists = await this.conferenceSrv.searchReceptionists(name, mail);
    this.receptionistsSearch = receptionists;
  }

  async addReceptionist(receptionist: IPerson) {
    const person = await this.meetingSrv.getReceptionistByEmail(receptionist.contactEmail);
    if (person) {
      this.receptionistsActived.push(person);
      this.receptionistsSearch = [];
      this.setFormSearchReceptionists();
    }
  }

  removeReceptionist(index: number) {
    this.receptionistsActived.splice(index, 1);
  }

  clearSearch() {
    this.setFormSearch();
    this.handleSearch();
  }

  toggleSearch() {
    this.search = !this.search;
  }

  setForm(value?) {
    this.form = this.formBuilder.group({
      name: [_.get(value, 'name', ''), [Validators.required]],
      beginDate: [_.get(value, 'beginDate', ''), [Validators.required]],
      endDate: [_.get(value, 'endDate', ''), [Validators.required]],
      localityPlace: [_.get(value, 'localityPlace', ''), [Validators.required]],
      address: [_.get(value, 'address', ''), [Validators.required]],
      place: [_.get(value, 'place', ''), [Validators.required]],
      localityCovers: [_.get(value, 'localityCovers', ''), [Validators.required]],
    });
  }

  setFormSearch(value?) {
    this.searchForm = this.formBuilder.group({
      name: [_.get(value, 'name', '')],
      beginDate: [_.get(value, 'beginDate', '')],
      endDate: [_.get(value, 'endDate', '')],
      localities: [_.get(value, 'localities', '')]
    });
  }

  setFormSearchReceptionists(value?) {
    this.searchFormReceptionists = this.formBuilder.group({
      mail: [_.get(value, 'mail', '')]
    });
  }

  cancel() {
    this.router.navigated = false;
    this.router.navigateByUrl(this.location.path());
    this.selfdeclarations = 0;
  }

  async handleCreateOrEdit(meetingId?: number) {
    this.edit = true;
    if (meetingId) {
      const meeting = await this.meetingSrv.getMeetingById(meetingId);
      meeting.localityCovers = _.map(meeting.localityCovers as Locality[], l => ({ id: l.id }) as any);
      meeting.localityPlace = { id: _.get(meeting, 'localityPlace.id') } as any;
      this.receptionistsActived = meeting.receptionists as IPerson[];
      this.meetingId = meetingId;
      this.setForm(meeting);
    }
  }

  changeBeginDate(event) {
    this.minDate = this.getDate(event);
    if (_.get(this.form, 'value.endDate')) {
      const endDate = this.getDate(this.form.value.endDate);
      if (endDate < this.minDate) {
        this.form.get('endDate').setValue(this.minDate);
      }
    }
  }

  private getDate(str) {
    if (str instanceof Date) {
      return new Date(str);
    }
    const [ dateStr, timeStr ] = str.split(' ');
    const args = dateStr.split('/');
    const argsTime = timeStr.split(':');
    return new Date(args[2], (args[1] - 1), args[0], argsTime[0], argsTime[1], argsTime[2]);
  }

  async save(form: Meeting) {
    const sender = { ...form } as Meeting;
    sender.receptionists = [];
    sender.receptionists = this.receptionistsActived.map(r => r.id);
    sender.beginDate = this.datePipe.transform(this.getDate(sender.beginDate), 'dd/MM/yyyy HH:mm:ss');
    sender.endDate = this.datePipe.transform(this.getDate(sender.endDate), 'dd/MM/yyyy HH:mm:ss');
    sender.localityPlace = _.get(sender, 'localityPlace.id');
    sender.localityCovers = _.map((sender.localityCovers as Locality[]), l => l.id);
    sender.conference = this.conferenceId;
    await this.meetingSrv.save(sender, this.meetingId);
    await this.handleSearch();
    this.cancel();
  }

  async handleDelete(meeting: Meeting) {
    try {
      const result = await this.meetingSrv.delete(meeting);
      if (result) {
        await this.handleSearch();
        return this.messageSrv.add({
          severity: 'success',
          summary: this.translate.instant('success'),
          detail: this.translate.instant('conference.meeting.success.delete', { name: meeting.name })
        });
      }
    } catch (error) {
      return this.messageSrv.add({
        severity: 'warn',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('conference.meeting.error.delete', { name: meeting.name })
      });
    }
  }
}
