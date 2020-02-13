import { BreadcrumbService } from '@app/core/breadcrumb/breadcrumb.service';
import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService, TreeNode, SelectItem } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { Conference } from '@app/shared/models/conference';
import { ConferenceService } from '@app/shared/services/conference.service';
import { PlanService } from '@app/shared/services/plan.service';
import { TranslateService } from '@ngx-translate/core';
import { calendar } from '../../shared/constants';
import { TranslateChangeService } from '../../shared/services/translateChange.service';
import { Router } from '@angular/router';

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

  conferenceItemForm: FormGroup;
  conferenceItems: string[];

  search = false;
  edit = false;
  showConferenceForm = false;
  minDate: Date = new Date();
  calendarTranslate: any;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private confirmationService: ConfirmationService,
    private conferenceService: ConferenceService,
    private planService: PlanService,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private messageService: MessageService,
    private translate: TranslateService,
    private translateChange: TranslateChangeService,
    private router: Router
  ) { }

  ngOnInit() {
    this.buildBreadcrumb();
    this.clearSearchForm();
    this.clearConferences();
    this.clearConferenceForm(null);
    this.listAllDropdown();

    this.translateChange.getCurrentLang().subscribe(({ lang }) => {
      this.calendarTranslate = calendar[lang];
    })
  }

  async listAllDropdown() {
    this.plans = [];
    try {
      let plans = await this.planService.listAll(null);
      plans.forEach(plan => {
        this.plans.push({
          value: plan.id,
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
      let year = new Date().getFullYear();
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
    setTimeout(() => document.getElementById('search-input').focus(), 100);
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
    const name = formData && formData.nameSearch ? formData.nameSearch : null;
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
      plan: [conference && conference.plan.id, Validators.required],
    });
  }

  cancel() {
    this.router.navigated = false;
    this.router.navigateByUrl(this.router.url);
  }

  showCreateConference() {
    this.edit = false;
    this.showConferenceForm = true;
  }

  async showEdit(conference) {
    this.conference = conference;
    this.clearConferenceForm(this.conference);
    this.showConferenceForm = true;
    this.edit = true;
  }

  async saveConference(formData) {
    try {
      this.markFormGroupTouched(this.conferenceForm);
      if (!this.isValidForm(this.conferenceForm)) return;
      formData = {
        ...formData,
        plan: { id: formData.plan },
        beginDate: this.datePipe.transform(this.getDate(formData.beginDate), "dd/MM/yyyy"),
        endDate: this.datePipe.transform(this.getDate(formData.endDate), "dd/MM/yyyy")
      }
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
    let args = str.split('/');
    return new Date(`${args[2]}-${args[1]}-${args[0]}`);
  }

  async delete(conference) {

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
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  changeBeginDate(event) {
    this.minDate = this.getDate(event);
    if (this.conferenceForm && this.conferenceForm.value.endDate) {
      let endDate = this.getDate(this.conferenceForm.value.endDate);
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

}
