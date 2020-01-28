import { BreadcrumbService } from '@app/core/breadcrumb/breadcrumb.service';
import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService, TreeNode, SelectItem } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { Conference } from '@app/shared/models/conference';
import { ConferenceService } from '@app/shared/services/conference.service';
import { PlanService } from '@app/shared/services/plan.service';

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

  constructor(
    private breadcrumbService: BreadcrumbService,
    private confirmationService: ConfirmationService,
    private conferenceService: ConferenceService,
    private planService: PlanService,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private messageService: MessageService,
  ) {}

  ngOnInit() {
    this.buildBreadcrumb();
    this.clearSearchForm();
    this.clearConferences();
    this.clearConferenceForm(null);
    this.listAllDropdown();
  }

  async listAllDropdown () {
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
      this.months.push({label: 'January', value: 1});
      this.months.push({label: 'February', value: 2});
      this.months.push({label: 'March', value: 3});
      this.months.push({label: 'April', value: 4});
      this.months.push({label: 'May', value: 5});
      this.months.push({label: 'June', value: 6});
      this.months.push({label: 'July', value: 7});
      this.months.push({label: 'August', value: 8});
      this.months.push({label: 'September', value: 9});
      this.months.push({label: 'October', value: 10});
      this.months.push({label: 'November', value: 11});
      this.months.push({label: 'December', value: 12});

      this.years = [];
      let year = new Date().getFullYear();
      for(let i = year - 5; i < year + 5; i++) {
        this.years.push({label: i.toString(), value: i});
      }

    } catch (err) {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Error fetching plans.'
      });
    }
  }

  private buildBreadcrumb() {
    this.breadcrumbService.setItems([
      { label: 'Administration' },
      { label: 'Conference', routerLink: ['/administration/conferences'] }
    ]);
  }

  private async clearConferences() {
    this.conferences = await this.conferenceService.listAll();
  }


  toogleSearch() {
    this.search = !this.search;
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
        beginDate: this.datePipe.transform(this.getDate(formData.beginDate),"dd/MM/yyyy"),
        endDate:  this.datePipe.transform(this.getDate(formData.endDate),"dd/MM/yyyy")
      }

      await this.conferenceService.save(formData, this.edit);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: `New conference "${formData.name}" registered.`
      });
      this.clearConferenceForm(null);
      this.clearConferences();
    } catch (err) {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error saving conference.'
      });
    }
  }

  private getDate(str) {
    if(str instanceof Date) {
      return new Date(str);
    }
    let args = str.split('/');
    return new Date(`${args[2]}-${args[1]}-${args[0]}`);
  }

  async delete(conference) {

    this.confirmationService.confirm({
      message: `Are you sure that you want to delete "${conference.name}?"`,
      key: 'deleteConference',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.confirmDelete(conference.id);
      }
    });
  }

  private async confirmDelete(id) {
    try{
      await this.conferenceService.delete(id);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Register removed.'
      });
    } catch(err){
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error removing register.'
      });
    }
    this.clearConferences();
  }


  private isValidForm(form, errorMessage = 'Invalid data. Verify provided information and try again.') {
    if (!form.valid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
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
    if(this.conferenceForm && this.conferenceForm.value.endDate) {
      let endDate = this.getDate(this.conferenceForm.value.endDate);
      if(endDate < this.minDate) {
        this.conferenceForm.get('endDate').setValue(this.minDate);
      }
    }
  }

  async validateName(event) {
    const id = this.conferenceForm.value.id;
    const nameValid = await this.conferenceService.validate(event.target.value, id);
    if(!nameValid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: "This name already exists"
      });
    }
  }

}
