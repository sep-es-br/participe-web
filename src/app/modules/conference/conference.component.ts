import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService, SelectItem, TreeNode } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { BreadcrumbService } from '@app/core/breadcrumb/breadcrumb.service';
import { Conference } from '@app/shared/models/conference';
import { ConferenceService } from '@app/shared/services/conference.service';
import { DatePipe } from '@angular/common';
import { IPerson } from './../../shared/interface/IPerson';
import { LocalityService } from '@app/shared/services/locality.service';
import { Plan } from './../../shared/models/plan';
import { PlanService } from '@app/shared/services/plan.service';
import { Router } from '@angular/router';
import { TranslateChangeService } from '../../shared/services/translateChange.service';
import { TranslateService } from '@ngx-translate/core';
import { calendar, StoreKeys } from '../../shared/constants';
import { environment } from '@environments/environment';
import { FilesService } from '@app/shared/services/files.service';

@Component({
  selector: 'tt-conference',
  templateUrl: './conference.component.html',
  styleUrls: ['./conference.component.scss']
})
export class ConferenceComponent implements OnInit {
  searchForm: FormGroup;

  conferences: Conference[] = [];
  conferenceTree: TreeNode[];
  conferenceForm: FormGroup;
  conference: Conference;

  plans: SelectItem[] = [];
  months: SelectItem[] = [];
  years: SelectItem[] = [];
  localitiesOfDomain: SelectItem[] = [];

  moderators: IPerson[] = [];
  moderatorsEnabled: IPerson[] = [];
  searchModeratorsForm: FormGroup;

  conferenceItemForm: FormGroup;
  conferenceItems: string[];

  search = false;
  edit = false;
  showConferenceForm = false;
  localitycitizenSelected = false;
  minDate: Date = new Date();
  calendarTranslate: any;
  selfdeclarations = 0;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private confirmationService: ConfirmationService,
    private conferenceService: ConferenceService,
    private planService: PlanService,
    private localityService: LocalityService,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private messageService: MessageService,
    private translate: TranslateService,
    private translateChange: TranslateChangeService,
    private router: Router,
    private filesSrv: FilesService
  ) {
  }

  ngOnInit() {
    this.buildBreadcrumb();
    this.clearSearchForm();
    this.clearConferences();
    this.clearConferenceForm(null);
    this.listAllDropdown();

    this.translateChange.getCurrentLang().subscribe(({ lang }) => {
      this.calendarTranslate = calendar[lang];
    });
  }

  async listAllDropdown() {
    this.plans = [];
    try {
      const plans = await this.planService.listAll(null);
      plans.forEach(plan => {
        this.plans.push({
          value: {
            id: plan.id,
            domain: plan.domain,
            localitytype: plan.localitytype
          },
          label: plan.name
        });
      });
      this.months = [];
      this.months.push({ label: this.translate.instant('month.january'), value: 1 });
      this.months.push({ label: this.translate.instant('month.february'), value: 2 });
      this.months.push({ label: this.translate.instant('month.march'), value: 3 });
      this.months.push({ label: this.translate.instant('month.april'), value: 4 });
      this.months.push({ label: this.translate.instant('month.may'), value: 5 });
      this.months.push({ label: this.translate.instant('month.june'), value: 6 });
      this.months.push({ label: this.translate.instant('month.july'), value: 7 });
      this.months.push({ label: this.translate.instant('month.august'), value: 8 });
      this.months.push({ label: this.translate.instant('month.september'), value: 9 });
      this.months.push({ label: this.translate.instant('month.october'), value: 10 });
      this.months.push({ label: this.translate.instant('month.november'), value: 11 });
      this.months.push({ label: this.translate.instant('month.december'), value: 12 });

      this.years = [];
      const year = new Date().getFullYear();
      for (let i = year - 5; i < year + 5; i++) {
        this.years.push({ label: i.toString(), value: i });
      }

    } catch (err) {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('conference.error.fetch.plans')
      });
    }
  }

  private buildBreadcrumb() {
    this.breadcrumbService.setItems([
      { label: 'administration.label' },
      { label: 'administration.conference', routerLink: ['/administration/conferences'] }
    ]);
  }

  private async clearConferences() {
    this.conferences = await this.conferenceService.listAll();
  }

  toggleSearch() {
    this.search = !this.search;
    this.search ? setTimeout(() => document.getElementById('search-input').focus(), 100) : null;
  }

  clearSearchForm() {
    this.searchForm = this.formBuilder.group({
      nameSearch: [''],
      planSearch: [''],
      monthSearch: [''],
      yearSearch: ['']
    });
  }

  async searchConferences(formData) {
    let name = formData && formData.nameSearch ? formData.nameSearch : null;
    name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    name = name.replace(/[^a-z0-9]/gi, ' ');
    name = name.replace(/\s\s+/g, ' ').trim();

    const plan: number = formData && formData.planSearch ? formData.planSearch : null;
    const year: number = formData && formData.yearSearch ? formData.yearSearch : null;
    const month: number = formData && formData.monthSearch ? formData.monthSearch : null;
    this.conferences = await this.conferenceService.search(name, plan, year, month);
  }

  clearSearch() {
    this.clearSearchForm();
    this.searchConferences(null);
  }

  clearConferenceForm(conference) {

    this.showConferenceForm = false;
    this.conference = new Conference();
    this.conferenceForm = this.formBuilder.group({
      id: [conference && conference.id],
      name: [conference && conference.name, Validators.required],
      description: [conference && conference.description, Validators.required],
      beginDate: [conference && conference.beginDate, Validators.required],
      endDate: [conference && conference.endDate, Validators.required],
      plan: [conference && conference.plan && conference.plan.id && this.findPlanInList(conference.plan), Validators.required],
      titleAuthentication: [conference && conference.titleAuthentication, Validators.required],
      subtitleAuthentication: [conference && conference.subtitleAuthentication, Validators.required],
      localityType: [conference && conference.localityType && conference.localityType.id],
      titleParticipation: [conference && conference.titleParticipation, Validators.required],
      subtitleParticipation: [conference && conference.subtitleParticipation, Validators.required],
      titleRegionalization: [conference && conference.subtitleRegionalization, Validators.required],
      subtitleRegionalization: [conference && conference.subtitleRegionalization, Validators.required],
    });
    this.searchModeratorsForm = this.formBuilder.group({
      nameModerator: [''],
      emailModerator: ['', Validators.email]
    });

    this.moderatorsEnabled = [];
    this.moderators = [];
  }

  cancel() {
    this.router.navigated = false;
    this.router.navigateByUrl(this.router.url);
    this.moderatorsEnabled = [];
    this.moderators = [];
    this.selfdeclarations = 0;
  }

  showCreateConference() {
    this.edit = false;
    this.showConferenceForm = true;
  }

  async showEdit(conference) {
    conference = await this.conferenceService.show(conference.id);
    this.selfdeclarations = await this.conferenceService.selfdeclarations(conference.id);
    this.clearConferenceForm(conference);
    this.conference = conference;
    this.moderatorsEnabled = conference.moderators && conference.moderators.length > 0 ? conference.moderators : [];
    this.moderators = [];

    const plan = this.plans.find(p => p.value.id === conference.plan.id);
    this.onChangePlans(plan.value, conference);
    this.showConferenceForm = true;
    this.edit = true;
  }

  async saveConference(formData) {
    try {

      this.markFormGroupTouched(this.conferenceForm);
      if (!this.isValidForm(this.conferenceForm)) { return; }

      formData = {
        ...formData,
        plan: formData.plan,
        localityType: formData.localityType,
        beginDate: this.datePipe.transform(this.getDate(formData.beginDate), 'dd/MM/yyyy'),
        endDate: this.datePipe.transform(this.getDate(formData.endDate), 'dd/MM/yyyy'),
        fileAuthentication: this.conference.fileAuthentication,
        fileParticipation: this.conference.fileParticipation,
        moderators: this.moderatorsEnabled
      };

      await this.conferenceService.save(formData, this.edit);

      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant(this.edit ? 'conference.updated' : 'conference.inserted', { name: formData.name })
      });
      this.clearConferenceForm(null);
      this.clearConferences();
    } catch (err) {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('conference.error.saving')
      });
    }
  }

  private getDate(str) {
    if (str instanceof Date) {
      return new Date(str);
    }
    const args = str.split('/');
    return new Date(args[2], (args[1] - 1), args[0]);
  }

  async delete(conference) {
    const comments = await this.conferenceService.comments(conference.id);
    const highlights = await this.conferenceService.highlights(conference.id);

    if (comments === 0 && highlights === 0) {
      this.confirmationService.confirm({
        message: this.translate.instant('conference.confirm.delete', { name: conference.name }),
        key: 'deleteConference',
        acceptLabel: this.translate.instant('yes'),
        rejectLabel: this.translate.instant('no'),
        accept: () => {
          this.confirmDelete(conference.id);
        },
        reject: () => {
          this.clearConferences();
        }
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('warn'),
        detail: this.translate.instant('conference.in-progress')
      });
    }
  }

  private async confirmDelete(id) {
    try {
      await this.conferenceService.delete(id);
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant('register.removed')
      });
    } catch (err) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('erro.removing.register')
      });
    }
    this.clearConferences();
  }

  private isValidForm(form, errorMessage = this.translate.instant('erro.invalid.data')) {
    if (!form.valid) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: errorMessage
      });
      return false;
    }

    return true;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    (Object as any).values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  changeBeginDate(event) {
    this.minDate = this.getDate(event);
    if (this.conferenceForm && this.conferenceForm.value.endDate) {
      const endDate = this.getDate(this.conferenceForm.value.endDate);
      if (endDate < this.minDate) {
        this.conferenceForm.get('endDate').setValue(this.minDate);
      }
    }
  }

  async validateName(event) {
    const id = this.conferenceForm.value.id;
    const nameValid = await this.conferenceService.validate(event.target.value, id);
    if (!nameValid) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('exists.name')
      });
    }
  }

  goToMetting(c: Conference) {
    return `/administration/conferences/${c.id}/meeting`;
  }

  async uploadFile(data: { files: File }, setFile: string) {
    const formData: FormData = new FormData();
    const file = data.files[0];
    formData.append('file', file, file.name);
    try {
      switch (setFile) {
        case 'participation':
          this.conference.fileParticipation = await this.filesSrv.uploadFile(formData);
          break;
        case 'authentication':
          this.conference.fileAuthentication = await this.filesSrv.uploadFile(formData);
          break;
      }
    } catch (error) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('error')
      });
    }
  }

  getUrlFile(url) {
    return `${environment.apiEndpoint}/files/${url}`;
  }

  async removeFileParticipation(event) {
    try {
      await this.planService.deleteLogo(this.conference.fileParticipation.id).toPromise();
    } catch (err) {
      console.error(err);
    }
    this.conference.fileParticipation = null;
  }

  async removeFileAuthentication(event) {
    try {
      await this.planService.deleteLogo(this.conference.fileAuthentication.id).toPromise();
    } catch (err) {
      console.error(err);
    }
    this.conference.fileAuthentication = null;
  }

  async onChangePlans(plan, conference?) {
    this.localitiesOfDomain = [];
    const visit = {};
    let localities = [];
    if (plan.domain && plan.domain.id) {
      localities = await this.localityService.findByDomain(plan.domain.id);
    }

    localities.forEach(locality => {
      if (locality.children) {
        this.loadLocalities(locality.children, this.localitiesOfDomain, plan, visit);
      }

      if (locality.type && locality.type.name && !visit[locality.type.name]) {
        visit[locality.type.name] = true;
        this.localitiesOfDomain.push({
          value: {
            id: locality.type.id
          },
          label: locality.type.name
        });
      }

    });
    this.localitycitizenSelected = true;
    if (conference && conference.localityType && conference.localityType.id) {
      this.conferenceForm.get('localityType').setValue(this.localitiesOfDomain.find(l => l.value.id == conference.localityType.id).value);
    }
  }

  private loadLocalities(localities, localitiesOfDomain, plan, visit) {
    localities.forEach(locality => {
      if (locality.children) {
        this.loadLocalities(locality.children, localitiesOfDomain, plan, visit);
      }

      if (!visit[locality.type.name]) {
        visit[locality.type.name] = true;
        this.localitiesOfDomain.push({
          value: {
            id: locality.type.id
          },
          label: locality.type.name
        });
      }
    });
  }

  disableBtnDelete(conference) {
    return conference.hasAttend ? false : true;
  }

  async serachModerators(formData) {
    let name = formData.nameModerator;
    let email = formData.emailModerator;
    name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    name = name.replace(/[^a-z0-9]/gi, ' ');
    email = email.replace(/[^a-z0-9]/gi, ' ');
    email = email.replace(/\s\s+/g, ' ').trim();
    email = email.replace(/\s\s+/g, ' ').trim();
    this.moderators = await this.conferenceService.searchModerators(name, email);

    if (!this.moderators || this.moderators.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('conference.moderator.empty')
      });
    }
  }

  addModeratorsEnabled(moderator: IPerson) {
    if (this.moderatorsEnabled && this.moderatorsEnabled.length > 0) {
      if (this.moderatorsEnabled.findIndex(m => m.contactEmail == moderator.contactEmail) != -1) {
        this.messageService.add({
          severity: 'warn',
          summary: this.translate.instant('warn'),
          detail: this.translate.instant('conference.moderator.already-enabled', { name: moderator.name })
        });
        return;
      }
    }

    this.moderators = this.moderators.filter(m => m.name != moderator.name && m.contactEmail != moderator.contactEmail);
    this.moderatorsEnabled.push(moderator);
  }

  removeModeratorsEnabled(moderator: IPerson) {
    this.moderatorsEnabled = this.moderatorsEnabled.filter(m => m.name != moderator.name && m.contactEmail != moderator.contactEmail);
  }

  private findPlanInList(plan: Plan) {
    return this.plans.find(p => p.value.id === plan.id).value;
  }

}
