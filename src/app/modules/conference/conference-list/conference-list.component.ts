import {Component, OnInit} from '@angular/core';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';
import {FormBuilder, FormGroup} from '@angular/forms';

import {BreadcrumbService} from '@app/core/breadcrumb/breadcrumb.service';
import {Conference} from '@app/shared/models/conference';
import {ConferenceService} from '@app/shared/services/conference.service';
import {DatePipe} from '@angular/common';
import {LocalityService} from '@app/shared/services/locality.service';
import {PlanService} from '@app/shared/services/plan.service';
import {Router} from '@angular/router';
import {TranslateChangeService} from '@app/shared/services/translateChange.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-conference-list',
  templateUrl: './conference-list.component.html',
  styleUrls: ['./conference-list.component.scss'],
})
export class ConferenceListComponent implements OnInit {

  searchForm: FormGroup;

  conferences: Conference[] = [];
  conference: Conference;

  plans: SelectItem[] = [];
  months: SelectItem[] = [];
  years: SelectItem[] = [];

  searchModeratorsForm: FormGroup;

  search = false;
  edit = false;
  localityCitizenSelected = false;
  minDate: Date = new Date();
  showTargetedByItems = false;
  conferenceResearchForm: FormGroup;

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
  ) {
  }

  async ngOnInit() {
    this.buildBreadcrumb();
    this.clearSearchForm();
    await this.loadConferences();
    await this.listAllDropdown();
  }

  async listAllDropdown() {
    this.plans = [];
    try {
      const plans = await this.planService.listAll(null);
      plans.forEach(plan => {
        this.plans.push({
          value: {
            id: plan.id,
            name: plan.name,
            domain: plan.domain,
            localitytype: plan.localitytype,
            structure: plan.structure,
          },
          label: plan.name,
        });
      });
      this.months = [];
      this.months.push({label: this.translate.instant('month.january'), value: 1});
      this.months.push({label: this.translate.instant('month.february'), value: 2});
      this.months.push({label: this.translate.instant('month.march'), value: 3});
      this.months.push({label: this.translate.instant('month.april'), value: 4});
      this.months.push({label: this.translate.instant('month.may'), value: 5});
      this.months.push({label: this.translate.instant('month.june'), value: 6});
      this.months.push({label: this.translate.instant('month.july'), value: 7});
      this.months.push({label: this.translate.instant('month.august'), value: 8});
      this.months.push({label: this.translate.instant('month.september'), value: 9});
      this.months.push({label: this.translate.instant('month.october'), value: 10});
      this.months.push({label: this.translate.instant('month.november'), value: 11});
      this.months.push({label: this.translate.instant('month.december'), value: 12});

      this.years = [];
      const year = new Date().getFullYear();
      for (let i = year - 5; i < year + 5; i++) {
        this.years.push({label: i.toString(), value: i});
      }

    } catch (err) {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('conference.error.fetch.plans'),
      });
    }
  }

  toggleSearch() {
    this.search = !this.search;
    if (this.search) {
      setTimeout(() => document.getElementById('search-input').focus(), 100);
    }
  }

  clearSearchForm() {
    this.searchForm = this.formBuilder.group({
      nameSearch: [''],
      planSearch: [''],
      monthSearch: [''],
      yearSearch: [''],
    });
  }

  async searchConferences(formData) {
    let name = formData && formData.nameSearch ? formData.nameSearch : null;
    name = name && name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    name = name && name.replace(/[^a-z0-9]/gi, ' ');
    name = name && name.replace(/\s\s+/g, ' ').trim();

    const plan: number = formData && formData.planSearch ? formData.planSearch : null;
    const year: number = formData && formData.yearSearch ? formData.yearSearch : null;
    const month: number = formData && formData.monthSearch ? formData.monthSearch : null;
    this.conferences = await this.conferenceService.search(name, plan, year, month);
  }

  async clearSearch() {
    this.clearSearchForm();
    await this.searchConferences(null);
  }

  async delete(conference) {
    const comments = await this.conferenceService.comments(conference.id);
    const highlights = await this.conferenceService.highlights(conference.id);

    if (comments === 0 && highlights === 0) {
      this.confirmationService.confirm({
        message: this.translate.instant('conference.confirm.delete', {name: conference.name}),
        key: 'deleteConference',
        acceptLabel: this.translate.instant('yes'),
        rejectLabel: this.translate.instant('no'),
        accept: () => {
          this.confirmDelete(conference.id);
        },
        reject: () => {
          return;
        },
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('warn'),
        detail: this.translate.instant('conference.in-progress'),
      });
    }
  }

  goToMetting(c: Conference) {
    return `/administration/conferences/${c.id}/meeting`;
  }

  async handleEditConference(c: Conference) {
    await this.router.navigate(
      ['/administration/conferences/conference'],
      {
        queryParams: {
          id: c.id,
        },
      },
    );
  }

  disableBtnDelete(conference) {
    return !conference.hasAttend;
  }

  async handleCreateConference() {
    await this.router.navigate(
      ['/administration/conferences/conference'],
    );
  }

  private buildBreadcrumb() {
    this.breadcrumbService.setItems([
      {label: 'administration.label'},
      {label: 'administration.conference', routerLink: ['/administration/conferences']},
    ]);
  }

  private async loadConferences() {
    this.conferences = await this.conferenceService.listAll();
  }

  private async confirmDelete(id) {
    try {
      await this.conferenceService.delete(id);
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant('register.removed'),
      });
      this.conferences = Array.from(this.conferences.filter(conf => conf.id !== id));
    } catch (err) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('erro.removing.register'),
      });
    }
  }

}
