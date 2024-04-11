import { PersonService } from '@app/shared/services/person.service';
import { FileCtrl } from './../../shared/models/file';
import {AfterViewChecked, AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';
import {UntypedFormBuilder, FormGroup, Validators} from '@angular/forms';
import {DatePipe, Location} from '@angular/common';
import {BreadcrumbService} from '@app/core/breadcrumb/breadcrumb.service';
import {Conference} from '@app/shared/models/conference';
import {ConferenceService} from '@app/shared/services/conference.service';
import {IPerson} from '@app/shared/interface/IPerson';
import {LocalityService} from '@app/shared/services/locality.service';
import {Plan} from '@app/shared/models/plan';
import {PlanService} from '@app/shared/services/plan.service';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateChangeService} from '@app/shared/services/translateChange.service';
import {TranslateService} from '@ngx-translate/core';
import {calendar} from '@app/shared/constants';
import {environment} from '@environments/environment';
import {FilesService} from '@app/shared/services/files.service';
import {File} from '@app/shared/models/file';
import {StructureItemService} from '@app/shared/services/structure-item.service';
import * as moment from 'moment';
import {IHowItWorkStep} from '@app/shared/interface/IHowItWorkStep';
import {IExternalLinks} from '@app/shared/interface/IExternalLinks';
import {CustomValidators} from '@app/shared/util/CustomValidators';
import { FileUpload } from 'primeng/fileupload';

@Component({
  selector: 'app-conference',
  templateUrl: './conference.component.html',
  styleUrls: ['./conference.component.scss'],
})

export class ConferenceComponent implements OnInit {

  idConference: number;
  conferenceForm: FormGroup;
  conference: Conference;
  plans: SelectItem[] = [];
  localitiesOfDomain: SelectItem[] = [];
  structureRegionalization = false;
  moderators: IPerson[] = [];
  moderatorsEnabled: IPerson[] = [];
  searchModeratorsForm: FormGroup;
  conferenceCustomProperties: FormGroup;
  localitycitizenSelected = false;
  minDate: Date = new Date();
  researchMinDate: Date = new Date();
  calendarTranslate = calendar.pt;
  selfdeclarations = 0;
  structureItems = [];
  targetedByItemsSelected: string;
  optionsStatusConference = [];
  optionsStatusResearchConference = [];
  newStep: IHowItWorkStep;
  howItWorkSteps: IHowItWorkStep[] = [];
  clonedSteps: { [s: string]: IHowItWorkStep; } = {};
  externalLinksMenuLabel: string;
  externalLinksForm: FormGroup;
  externalLinks: IExternalLinks[] = [];
  clonedExternalLinks: { [s: string]: IExternalLinks; } = {};
  showTargetedByItems = false;
  conferenceResearchForm: FormGroup;
  menuLabelForm: FormGroup;
  howItWorksForm: FormGroup;
  loadCustomPreferences: boolean = false;

  participationImages: FileCtrl[] = [];
  authenticationImages: FileCtrl[] = [];
  backgroundImages: FileCtrl[] = [];
  calendarImages: FileCtrl[] = [];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private confirmationService: ConfirmationService,
    private conferenceService: ConferenceService,
    private planService: PlanService,
    private localityService: LocalityService,
    private formBuilder: UntypedFormBuilder,
    private datePipe: DatePipe,
    private messageService: MessageService,
    private translate: TranslateService,
    private translateChange: TranslateChangeService,
    private router: Router,
    private actRouter: ActivatedRoute,
    private filesSrv: FilesService,
    private structureItemSrv: StructureItemService,
    private personService: PersonService,
    private location: Location)  {
    this.actRouter.queryParams.subscribe(async queryParams => {
      this.idConference = queryParams.id;
    });
  }

  getDate(str) {
    if (str) {
      if (str instanceof Date) {
        return new Date(str);
      }
      const dateTime = str.split(' ');
      const dataArgs = dateTime[0].split('/');
      const timeArgs = dateTime[1].split(':');
      return new Date(dataArgs[2], (dataArgs[1] - 1), dataArgs[0], timeArgs[0], timeArgs[1], timeArgs[2]);
    }
  }

  setDate(date: Date) {
    return moment(date).format('DD/MM/yyyy HH:mm:ss');
  }

  async ngOnInit() {
    this.buildBreadcrumb();
    await this.loadPlanOptions();
    if (this.idConference) {
      this.instanceConferenceForm();
      await this.loadConference();
    } else {
      this.instanceConferenceForm();
      this.loadCustomPreferences = true;
    }
    this.loadListOptions();
    this.translateChange.getCurrentLang().subscribe(({lang}) => {
      this.calendarTranslate = calendar[lang];
      this.loadListOptions();
    });
  }

  async loadPlanOptions() {
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
    } catch (err) {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('conference.error.fetch.plans'),
      });
    }
  }

  loadListOptions() {
    this.optionsStatusConference = [
      {
        label: this.translate.instant('conference.preOpening'),
        value: 'PRE_OPENING',
      },
      {
        label: this.translate.instant('conference.open'),
        value: 'OPEN',
      },
      {
        label: this.translate.instant('conference.postClosure'),
        value: 'POST_CLOSURE',
      },
    ];
    this.optionsStatusResearchConference = [
      {
        label: this.translate.instant('status.active'),
        value: 'ACTIVE',
      },
      {
        label: this.translate.instant('status.inactive'),
        value: 'INACTIVE',
      },
    ];
  }

  async loadConference() {
    this.conference = await this.conferenceService.show(this.idConference);
    this.minDate = this.conference.beginDate && this.getDate(this.conference.beginDate);
    this.researchMinDate = this.conference.researchConfiguration && this.conference.researchConfiguration.beginDate
      && this.getDate(this.conference.researchConfiguration.beginDate);
    this.selfdeclarations = await this.conferenceService.selfdeclarations(this.conference.id);
    const plan = this.plans.find(p => p.value.id === this.conference.plan.id);
    await this.onChangePlans(plan.value, this.conference);
    await this.setConferenceForm();
    if (this.conference.plan) {
      await this.loadStructureItens(this.conference.plan);
    }
    this.howItWorkSteps = this.conference.howItWork && this.conference.howItWork.map((step, i) => ({
      ...step,
      tableId: i + 1,
    }));
    this.externalLinks = this.conference.externalLinks && this.conference.externalLinks.map((link, i) => ({
      ...link,
      tableId: i + 1,
    }));

    if (this.conference.fileAuthentication !== undefined && this.conference.fileAuthentication !== null) {
      this.authenticationImages.push({
        file: this.conference.fileAuthentication,
        toAdd: false,
        toDelete: false
      });
    }
    if (this.conference.fileParticipation !== undefined && this.conference.fileParticipation !== null) {
      this.participationImages.push({
        file: this.conference.fileParticipation,
        toAdd: false,
        toDelete: false
      });
    }
    if (this.conference.backgroundImages !== undefined && this.conference.backgroundImages !== null) {
      this.conference.backgroundImages.forEach(image => {
        this.backgroundImages.push({
          file: image,
          toAdd: false,
          toDelete: false
        });
      });
    }
    if (this.conference.calendarImages !== undefined && this.conference.calendarImages !== null) {
      this.conference.calendarImages.forEach(image => {
        this.calendarImages.push({
          file: image,
          toAdd: false,
          toDelete: false
        });
      });
    }
    this.moderatorsEnabled = this.conference.moderators && this.conference.moderators.length > 0 ? this.conference.moderators : [];
    this.moderatorsEnabled.sort((a, b) => (this.comparePersonName(a, b)));
    this.moderators = [];
  }

  instanceConferenceForm() {
    this.conference = new Conference();
    this.conferenceForm = this.formBuilder.group({
      id: null,
      name: ['', [Validators.required, CustomValidators.noWhitespaceValidator]],
      description: ['', Validators.compose([Validators.required, CustomValidators.noWhitespaceValidator])],
      serverName: ['', [Validators.compose([Validators.required, CustomValidators.URIServerName, CustomValidators.noWhitespaceValidator])]],
      defaultServerConference: false,
      showStatistics: true,
      showCalendar: true,
      showStatisticsPanel: true,
      showExternalLinks: true,
      beginDate: [null, [Validators.required]],
      endDate: [null, [Validators.required]],
      plan: [null, Validators.required],
      titleAuthentication: ['', Validators.compose([Validators.required, CustomValidators.noWhitespaceValidator])],
      subtitleAuthentication: ['', Validators.compose([Validators.required, CustomValidators.noWhitespaceValidator])],
      localityType: null,
      titleParticipation: ['', Validators.compose([Validators.required, CustomValidators.noWhitespaceValidator])],
      subtitleParticipation: ['', Validators.compose([Validators.required, CustomValidators.noWhitespaceValidator])],
      titleRegionalization: ['', this.structureRegionalization && Validators.compose([
        Validators.required,
        CustomValidators.noWhitespaceValidator,
      ])],
      subtitleRegionalization: ['', this.structureRegionalization && Validators.compose([
        Validators.required,
        CustomValidators.noWhitespaceValidator,
      ])],
      segmentation: [false, Validators.required],
      targetedByItems: null,
      displayMode: ['AUTOMATIC', Validators.required],
      displayStatusConference: 'OPEN',
      preOpeningText: '',
      postClosureText: '',
    });

    this.conferenceCustomProperties = this.formBuilder.group({
      typeBackgroundColor: '',
      background: '',
      fontColor: '',
      borderColor: '',
      accentColor: '',
      cardColor: '',
      cardFontColor: '',
      cardColorHover: '',
      cardFontColorHover: '',
      cardBorderColor: ''
    });
    
    this.searchModeratorsForm = this.formBuilder.group({
      nameModerator: [''],
      emailModerator: ['', Validators.email],
    });
    this.instanceNewStep();
    this.instanceHowItWorksForm();
    this.instanceMenuLabelForm();
    this.instanceExternalLinksForm();
    this.instanceConferenceResearchForm();
    
  }

  instanceNewStep() {
    this.newStep = {
      order: null,
      title: null,
      text: null,
    };
  }

  instanceHowItWorksForm() {
    this.howItWorksForm = this.formBuilder.group({
      order: 0,
      title: ['', [CustomValidators.noWhitespaceValidator]],
      text: [''],
    });
  }

  instanceMenuLabelForm() {
    this.menuLabelForm = this.formBuilder.group({
      menuLabel: ['', [CustomValidators.noWhitespaceValidator]],
    });
  }

  instanceExternalLinksForm() {
    this.externalLinksForm = this.formBuilder.group({
      label: ['', [CustomValidators.noWhitespaceValidator]],
      url: ['', [Validators.required, CustomValidators.ExternalURL]],
    });
  }

  instanceConferenceResearchForm() {
    this.conferenceResearchForm = this.formBuilder.group({
      beginDate: null,
      endDate: null,
      displayModeResearch: 'MANUAL',
      researchDisplayStatus: 'INACTIVE',
      researchLink: ['', [CustomValidators.noWhitespaceValidator]],
      estimatedTimeResearch: ['', [CustomValidators.noWhitespaceValidator]],
    });
  }

  async setConferenceForm() {
    if (this.conference && this.conference.targetedByItems) {
      this.showTargetedByItems = this.conference && this.conference.segmentation;
      this.targetedByItemsSelected = this.conference.targetedByItems.length > 1 ? 'TODOS' : this.conference.targetedByItems[0].toString();
    }

    this.conferenceForm.controls.id.setValue(this.conference.id);
    this.conferenceForm.controls.name.setValue(this.conference.name);
    this.conferenceForm.controls.description.setValue(this.conference.description);
    this.conferenceForm.controls.plan.setValue(this.findPlanInList(this.conference.plan));
    this.conferenceForm.controls.serverName.setValue(this.conference.serverName);
    this.conferenceForm.controls.defaultServerConference.setValue(this.conference.defaultServerConference);
    this.conferenceForm.controls.showStatistics.setValue(this.conference.showStatistics);
    this.conferenceForm.controls.showStatisticsPanel.setValue(this.conference.showStatisticsPanel);
    this.conferenceForm.controls.showCalendar.setValue(this.conference.showCalendar);
    this.conferenceForm.controls.showExternalLinks.setValue(this.conference.showExternalLinks);
    this.conferenceForm.controls.beginDate.setValue(this.getDate(this.conference.beginDate));
    this.conferenceForm.controls.endDate.setValue(this.getDate(this.conference.endDate));
    this.conferenceForm.controls.titleAuthentication.setValue(this.conference.titleAuthentication);
    this.conferenceForm.controls.subtitleAuthentication.setValue(this.conference.subtitleAuthentication);
    this.conferenceForm.controls.titleParticipation.setValue(this.conference.titleParticipation);
    this.conferenceForm.controls.subtitleParticipation.setValue(this.conference.subtitleParticipation);
    this.conferenceForm.controls.titleRegionalization.setValue(this.conference.titleRegionalization);
    this.conferenceForm.controls.subtitleRegionalization.setValue(this.conference.subtitleRegionalization);
    this.conferenceForm.controls.segmentation.setValue(this.conference.segmentation);
    const targetedByItemsValue = this.targetedByItemsSelected ? this.targetedByItemsSelected
      : (this.structureItems && this.structureItems.length > 0) && this.structureItems[0].value;
    this.conferenceForm.controls.targetedByItems.setValue(targetedByItemsValue);

    this.conferenceForm.controls.displayMode.setValue(this.conference.displayMode);
    this.conferenceForm.controls.displayStatusConference.setValue(this.conference.displayStatusConference);
    this.conferenceForm.controls.preOpeningText.setValue(this.conference.preOpeningText);
    this.conferenceForm.controls.postClosureText.setValue(this.conference.postClosureText);

    if(this.conference.customProperties){
      await this.setConferenceCustomProperties();
      this.loadCustomPreferences = true;
    }else{
      this.loadCustomPreferences = true;
    }

    if (this.conference.researchConfiguration) {
      this.setConferenceResearchForm();
    }
    this.moderatorsEnabled = this.conference && this.conference.moderators ? this.conference.moderators : [];
    this.moderators = [];
    this.setStatusDisplayConference();
    this.menuLabelForm.controls.menuLabel.setValue(this.conference.externalLinksMenuLabel);
    this.externalLinksMenuLabel = this.conference.externalLinksMenuLabel;
  }

  setConferenceResearchForm() {
    this.conferenceResearchForm.controls.beginDate.setValue(this.getDate(this.conference.researchConfiguration.beginDate));
    this.conferenceResearchForm.controls.endDate.setValue(this.getDate(this.conference.researchConfiguration.endDate));
    this.conferenceResearchForm.controls.displayModeResearch.setValue(this.conference.researchConfiguration.displayModeResearch);
    this.conferenceResearchForm.controls.researchDisplayStatus.setValue(this.conference.researchConfiguration.researchDisplayStatus);
    this.conferenceResearchForm.controls.researchLink.setValue(this.conference.researchConfiguration.researchLink);
    this.conferenceResearchForm.controls.estimatedTimeResearch.setValue(this.conference.researchConfiguration.estimatedTimeResearch);

    this.setResearchDisplayStatus();
  }

  async setConferenceCustomProperties(){
    this.conferenceCustomProperties.controls.typeBackgroundColor.setValue(this.conference.customProperties.typeBackgroundColor);
    this.conferenceCustomProperties.controls.background.setValue(this.conference.customProperties.background);
    this.conferenceCustomProperties.controls.fontColor.setValue(this.conference.customProperties.fontColor);
    this.conferenceCustomProperties.controls.borderColor.setValue(this.conference.customProperties.borderColor);
    this.conferenceCustomProperties.controls.cardColorHover.setValue(this.conference.customProperties.cardColorHover);
    this.conferenceCustomProperties.controls.cardColor.setValue(this.conference.customProperties.cardColor);
    this.conferenceCustomProperties.controls.accentColor.setValue(this.conference.customProperties.accentColor);
    this.conferenceCustomProperties.controls.cardFontColor.setValue(this.conference.customProperties.cardFontColor);
    this.conferenceCustomProperties.controls.cardFontColorHover.setValue(this.conference.customProperties.cardFontColorHover);
    this.conferenceCustomProperties.controls.cardBorderColor.setValue(this.conference.customProperties.cardBorderColor);
  }

  addHowItWorkStep() {
    this.markFormGroupTouched(this.howItWorksForm);

    if (!this.isValidForm(this.howItWorksForm)) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('conference.error.savingStep'),
      });
      return;
    }

    const order = this.howItWorksForm.controls.order.value;
    const title = this.howItWorksForm.controls.title.value;
    const text = this.howItWorksForm.controls.text.value;

    this.newStep = {order, title, text};

    if (this.howItWorkSteps) {
      this.howItWorkSteps.push({
        ...this.newStep,
        tableId: this.howItWorkSteps.length + 1,
      });
    } else {
      this.howItWorkSteps = [{
        ...this.newStep,
        tableId: 1,
      }];
    }
    // this.instanceNewStep();
    this.instanceHowItWorksForm();
  }

  onRowStepEditInit(step: IHowItWorkStep) {
    this.clonedSteps[step.tableId] = {...step};
  }

  onRowStepEditSave(step: IHowItWorkStep) {
    if (step.order > 0 && step.title.length > 0 && step.text.length > 0) {
      delete this.clonedSteps[step.tableId];
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant('conference.stepUpdated'),
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('conference.requiredInputs'),
      });
    }
  }

  onRowStepEditCancel(step: IHowItWorkStep, index: number) {
    this.howItWorkSteps[index] = this.clonedSteps[step.tableId];
    delete this.clonedSteps[step.tableId];
  }

  onDeleteStep(step: IHowItWorkStep, index: number) {
    this.howItWorkSteps.splice(index, 1);
  }

  addExternalLink() {
    if (this.externalLinksForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('conference.error.savingExternalLink'),
      });
      return;
    }
    if (this.externalLinks && this.externalLinks.length > 0) {
      this.externalLinks.push({
        ...this.externalLinksForm.value,
        tableId: this.externalLinks.length + 1,
      });
    } else {
      this.externalLinks = [{
        ...this.externalLinksForm.value,
        tableId: 1,
      }];
    }
    this.instanceExternalLinksForm();
  }

  onDeleteExternalLink(link: IExternalLinks, index: number) {
    this.externalLinks.splice(index, 1);
  }

  onRowLinkEditInit(link: IExternalLinks) {
    this.clonedExternalLinks[link.tableId] = {...link};
  }

  isUrlValid(url: string): boolean {
    // tslint:disable-next-line: max-line-length
    const regexUri = /^([a-z][a-z0-9+.-]*):(?:\/\/((?:(?=((?:[a-z0-9-._~!$&'()*+,;=:]|%[0-9A-F]{2})*))(\3)@)?(?=(\[[0-9A-F:.]{2,}|(?:[a-z0-9-._~!$&'()*+,;=]|%[0-9A-F]{2})*))\5(?::(?=(\d*))\6)?)(\/(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*))\8)?|(\/?(?!\/)(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*))\10)?)(?:\?(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9A-F]{2})*))\11)?(?:#(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9A-F]{2})*))\12)?$/i;
    return regexUri.test(url);
  }

  onRowLinkEditSave(link: IExternalLinks, index: number) {
    const isGreaterThanZero = link.label.trim().length > 0 && link.url.trim().length > 0;
    const isUrlValid = this.isUrlValid(link.url);
    const hasError = !isGreaterThanZero || !isUrlValid;

    if (hasError) {
      this.externalLinks[index] = this.clonedExternalLinks[link.tableId];
    }

    if (!isGreaterThanZero) {
      this.messageService.add({
        severity: 'error', summary: this.translate.instant('error'),
        detail: this.translate.instant('conference.requiredInputs'),
      });
      return;
    }

    if (!isUrlValid) {
      this.messageService.add({
        severity: 'error', summary: this.translate.instant('error'),
        detail: this.translate.instant('conference.error.externalLinkInvalid'),
      });
      return;
    }

    this.messageService.add({
      severity: 'success', summary: this.translate.instant('success'),
      detail: this.translate.instant('conference.externalLinkUpdated'),
    });

    delete this.clonedExternalLinks[link.tableId];
  }

  onRowLinkEditCancel(link: IExternalLinks, index: number) {
    this.externalLinks[index] = this.clonedExternalLinks[link.tableId];
    delete this.clonedExternalLinks[link.tableId];
  }

  validadeResearchDates(event) {
    this.researchMinDate = this.getDate(event);
    if (this.conferenceResearchForm && this.conferenceResearchForm.controls.endDate.value) {
      const endDate = this.getDate(this.conferenceResearchForm.controls.endDate.value);
      if (endDate < this.researchMinDate) {
        this.conferenceResearchForm.get('endDate').setValue(this.researchMinDate);
      }
    }
  }

  setResearchDisplayStatus() {
    const dataAtual = new Date();
    const displayModeResearch = this.conferenceResearchForm.controls.displayModeResearch.value;
    const beginDate = this.conferenceResearchForm.controls.beginDate.value;
    const endDate = this.conferenceResearchForm.controls.endDate.value;
    const researchLink = this.conferenceResearchForm.controls.researchLink.value;
    const estimatedTimeResearch = this.conferenceResearchForm.controls.estimatedTimeResearch.value;

    if (displayModeResearch === 'AUTOMATIC') {
      if ((!beginDate) && (!endDate)) {
        this.conferenceResearchForm.controls.researchDisplayStatus.setValue('ACTIVE');
      }
      if (dataAtual >= beginDate && dataAtual < endDate) {
        this.conferenceResearchForm.controls.researchDisplayStatus.setValue('ACTIVE');
      }
      if ((!beginDate) && dataAtual < endDate) {
        this.conferenceResearchForm.controls.researchDisplayStatus.setValue('ACTIVE');
      }
      if ((!endDate) && dataAtual >= beginDate) {
        this.conferenceResearchForm.controls.researchDisplayStatus.setValue('ACTIVE');
      }
      if ((dataAtual < beginDate) || (dataAtual > endDate)) {
        this.conferenceResearchForm.controls.researchDisplayStatus.setValue('INACTIVE');
      }
      if (!beginDate || !endDate || !researchLink || !estimatedTimeResearch) {
        this.conferenceResearchForm.controls.researchDisplayStatus.setValue('INACTIVE');
      }
    }
  }

  cancel() {
    this.location.back();
  }

  async saveConference(formData) {
    try {
      const researchDisplayStatus = this.conferenceResearchForm.controls.researchDisplayStatus.value;

      if (researchDisplayStatus === 'ACTIVE') {
        this.conferenceResearchForm.controls.beginDate.setValidators([Validators.required]);
        this.conferenceResearchForm.controls.endDate.setValidators([Validators.required]);
        this.conferenceResearchForm.controls.researchLink.setValidators([Validators.required, CustomValidators.ResearchLink]);
        this.conferenceResearchForm.controls.estimatedTimeResearch.setValidators([Validators.required]);
      } else {
        this.conferenceResearchForm.controls.beginDate.clearValidators();
        this.conferenceResearchForm.controls.endDate.clearValidators();
        this.conferenceResearchForm.controls.researchLink.clearValidators();
        this.conferenceResearchForm.controls.estimatedTimeResearch.clearValidators();
      }

      this.conferenceResearchForm.controls.beginDate.updateValueAndValidity();
      this.conferenceResearchForm.controls.endDate.updateValueAndValidity();
      this.conferenceResearchForm.controls.researchLink.updateValueAndValidity();
      this.conferenceResearchForm.controls.estimatedTimeResearch.updateValueAndValidity();

      const beginDateResearchForm = this.conferenceResearchForm.controls.beginDate.value &&
        this.setDate(this.conferenceResearchForm.controls.beginDate.value);
      const endDateResearchForm = this.conferenceResearchForm.controls.endDate.value &&
        this.setDate(this.conferenceResearchForm.controls.endDate.value);

      if (beginDateResearchForm || endDateResearchForm) {
        this.conferenceResearchForm.controls.researchLink.setValidators([Validators.required, CustomValidators.ResearchLink]);
        this.conferenceResearchForm.controls.researchLink.updateValueAndValidity();

        this.conferenceResearchForm.controls.estimatedTimeResearch.setValidators([Validators.required]);
        this.conferenceResearchForm.controls.estimatedTimeResearch.updateValueAndValidity();
      }

      this.markFormGroupTouched(this.conferenceForm);
      this.markFormGroupTouched(this.conferenceResearchForm);
      if (!this.isValidForm(this.conferenceForm) || !this.isValidForm(this.conferenceResearchForm)) {
        return;
      }
      const targetedByItemsSelectedOption = this.conferenceForm.controls.segmentation && this.conferenceForm.controls.targetedByItems.value;
      const targetedByItems = targetedByItemsSelectedOption === 'TODOS' ? this.structureItems.map(item => item.value)
        : [Number(this.conferenceForm.controls.targetedByItems.value)];

      const conferenceBeginDate = this.conferenceForm.controls.beginDate.value &&
        this.setDate(this.conferenceForm.controls.beginDate.value);
      const conferenceEndDate = this.conferenceForm.controls.endDate.value &&
        this.setDate(this.conferenceForm.controls.endDate.value);

      const researchBeginDate = this.conferenceResearchForm.controls.beginDate.value &&
        this.setDate(this.conferenceResearchForm.controls.beginDate.value);
      const researchEndDate = this.conferenceResearchForm.controls.endDate.value &&
        this.setDate(this.conferenceResearchForm.controls.endDate.value);

      let i = 0;
      for (i = this.authenticationImages.length-1; i >= 0 ; i--) {
       if ((this.authenticationImages[i].file.id === null
            || this.authenticationImages[i].file.id === undefined)
            && this.authenticationImages[i].toAdd) {
          this.conference.fileAuthentication = await this.uploadFile(i, 'authentication');
        }
        else if (this.authenticationImages[i].file.id !== null
          && this.authenticationImages[i].file.id !== undefined
          && this.authenticationImages[i].toDelete) {
          await this.removeFile(this.authenticationImages[i].file.id, 'authentication');
          this.conference.fileAuthentication = null;
        }
      }

      for (i = this.participationImages.length-1; i >= 0 ; i--) {
        if ((this.participationImages[i].file.id === null
            || this.participationImages[i].file.id === undefined)
            && this.participationImages[i].toAdd) {
          this.conference.fileParticipation = await this.uploadFile(i, 'participation');
        }
        else if (this.participationImages[i].file.id !== null
          && this.participationImages[i].file.id !== undefined
          && this.participationImages[i].toDelete) {
          await this.removeFile(this.participationImages[i].file.id, 'participation');
          this.conference.fileParticipation = null;
        }
      }

      for (i = this.backgroundImages.length-1; i >= 0; i--) {
        if ((this.backgroundImages[i].file.id === null
            || this.backgroundImages[i].file.id === undefined)
            && this.backgroundImages[i].toAdd) {
          const uploadedFile: File = await this.uploadFile(i, 'background');
          if (uploadedFile !== null) {
            this.backgroundImages[i].file = uploadedFile;
          }
        }
        else if (this.backgroundImages[i].file.id !== null
          && this.backgroundImages[i].file.id !== undefined
          && this.backgroundImages[i].toDelete) {
          await this.removeFile(this.backgroundImages[i].file.id, 'background');
        }
      }
      this.conference.backgroundImages = this.backgroundImages.map(image => {
        if (image.file.id !== null && image.file.id !== undefined && !image.toDelete) {
          return image.file;
        }
      });

      for (i = this.calendarImages.length-1; i >= 0; i--) {
        if ((this.calendarImages[i].file.id === null
            || this.calendarImages[i].file.id === undefined)
            && this.calendarImages[i].toAdd) {
          const uploadedFile: File = await this.uploadFile(i, 'mobile');
          if (uploadedFile !== null) {
            this.calendarImages[i].file = uploadedFile;
          }
        }
        else if (this.calendarImages[i].file.id !== null
          && this.calendarImages[i].file.id !== undefined
          && this.calendarImages[i].toDelete) {
            debugger
          await this.removeFile(this.calendarImages[i].file.id, 'mobile');
        }
      }
      this.conference.calendarImages = this.calendarImages.map(image => {
        if (image.file.id !== null && image.file.id !== undefined && !image.toDelete) {
          return image.file;
        }
      });

      /*
      this.moderatorsEnabled.forEach(async moderator => {
        await this.personService.postOperator('Moderator', moderator);
      });
*/
      formData = {
        ...formData,
        serverName: this.conferenceForm.controls.serverName.value,
        beginDate: conferenceBeginDate,
        endDate: conferenceEndDate,
        plan: formData.plan,
        localityType: formData.localityType,
        fileAuthentication: this.conference.fileAuthentication,
        fileParticipation: this.conference.fileParticipation,
        targetedByItems,
        moderators: this.moderatorsEnabled,
        howItWork: this.howItWorkSteps,
        externalLinksMenuLabel: this.menuLabelForm.controls.menuLabel.value,
        externalLinks: this.externalLinks,
        researchConfiguration: {
          beginDate: beginDateResearchForm,
          endDate: endDateResearchForm,
          displayModeResearch: this.conferenceResearchForm.controls.displayModeResearch.value,
          researchDisplayStatus: this.conferenceResearchForm.controls.researchDisplayStatus.value,
          researchLink: this.conferenceResearchForm.controls.researchLink.value,
          estimatedTimeResearch: this.conferenceResearchForm.controls.estimatedTimeResearch.value,
        },
        backgroundImages: this.conference.backgroundImages,
        calendarImages: this.conference.calendarImages,
        customProperties:{
          typeBackgroundColor: this.conferenceCustomProperties.controls.typeBackgroundColor.value,
          background: this.conferenceCustomProperties.controls.background.value,
          fontColor: this.conferenceCustomProperties.controls.fontColor.value,
          borderColor: this.conferenceCustomProperties.controls.borderColor.value,
          cardColorHover: this.conferenceCustomProperties.controls.cardColorHover.value,
          cardColor: this.conferenceCustomProperties.controls.cardColor.value,
          accentColor: this.conferenceCustomProperties.controls.accentColor.value,
          cardFontColor: this.conferenceCustomProperties.controls.cardFontColor.value,
          cardFontColorHover: this.conferenceCustomProperties.controls.cardFontColorHover.value,
          cardBorderColor: this.conferenceCustomProperties.controls.cardBorderColor.value,          
        }
      };

      this.conferenceService.save(formData, !!this.idConference);

      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant(this.idConference ? 'conference.updated' : 'conference.inserted', {name: formData.name}),
      });

      this.location.back();
    } catch (err) {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('conference.error.saving'),
      });
    }
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

  changeEndDate() {
    const beginDate = this.conferenceForm.controls.beginDate.value;
    const endDate = this.conferenceForm.controls.endDate.value;

    if (endDate < beginDate) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('warn'),
        detail: this.translate.instant('conference.error.endDateOutOfRange'),
      });

      this.conferenceForm.controls.endDate.setValue(beginDate);
    }
  }

  async validateName(event) {
    const id = this.conferenceForm.value.id;
    const nameValid = await this.conferenceService.validate(event.target.value, id);
    if (!nameValid) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('exists.name'),
      });
    }
  }

  setStatusDisplayConference() {
    const beginDate = this.conferenceForm.controls.beginDate.value;
    const endDate = this.conferenceForm.controls.endDate.value;
    const displayMode = this.conferenceForm.controls.displayMode.value;

    const dataAtual = new Date();

    if (displayMode === 'AUTOMATIC') {
      if (beginDate !== null && (dataAtual < beginDate)) {
        this.conferenceForm.get('displayStatusConference').setValue('PRE_OPENING');
      }
      if ((beginDate !== null && (dataAtual >= beginDate)) &&
        (endDate !== null && (dataAtual < endDate))) {
        this.conferenceForm.get('displayStatusConference').setValue('OPEN');
      }
      if ((beginDate === null) &&
        (endDate !== null && (dataAtual < endDate))) {
        this.conferenceForm.get('displayStatusConference').setValue('OPEN');
      }
      if ((beginDate !== null && (dataAtual >= beginDate)) &&
        (endDate === null)) {
        this.conferenceForm.get('displayStatusConference').setValue('OPEN');
      }
      if (endDate !== null && (dataAtual > endDate)) {
        this.conferenceForm.get('displayStatusConference').setValue('POST_CLOSURE');
      }
    }
  }

  async validateDefaultConferenceServer() {
    if (this.conferenceForm.controls.defaultServerConference.value === false) {
      return;
    }
    const serverName = this.conferenceForm.controls.serverName.value;
    const defaultConferenceName = await this.conferenceService.validateDefaultConferenceServer(serverName, this.conference.id);
    if (defaultConferenceName && defaultConferenceName.conferenceName && defaultConferenceName.conferenceName.length > 0) {
      this.confirmationService.confirm({
        message: this.translate.instant('conference.confirm.defaultConferenceServer', {name: defaultConferenceName.conferenceName}),
        key: 'defaultConference',
        acceptLabel: this.translate.instant('yes'),
        rejectLabel: this.translate.instant('no'),
        accept: () => {
          this.conferenceForm.controls.defaultServerConference.setValue(true);
        },
        reject: () => {
          this.conferenceForm.controls.defaultServerConference.setValue(false);
        },
      });
    }
  }

  async uploadFile(index: number, setFile: string): Promise<File> {
    const formData: FormData = new FormData();
    let file: any;
    try {
      switch (setFile) {
        case 'authentication':
          if (this.authenticationImages[index].file.id === null || this.authenticationImages[index].file.id === undefined) {
            file = this.authenticationImages[index].file;
            formData.append('file', file, file.name);
            return await this.filesSrv.uploadFile(formData);
          }
          break;
        case 'participation':
          if (this.participationImages[index].file.id === null || this.participationImages[index].file.id === undefined) {
            file = this.participationImages[index].file;
            formData.append('file', file, file.name);
            return await this.filesSrv.uploadFile(formData);
          }
          break;
        case 'background':
          if (this.backgroundImages[index].file.id === null || this.backgroundImages[index].file.id === undefined) {
            file = this.backgroundImages[index].file;
            formData.append('file', file, file.name);
            return await this.filesSrv.uploadFile(formData);
          }
          break;
        case 'mobile':
          if (this.calendarImages[index].file.id === null || this.calendarImages[index].file.id === undefined) {
            file = this.calendarImages[index].file;
            formData.append('file', file, file.name);
            return await this.filesSrv.uploadFile(formData);
          }
          break;
      }

    } catch (error) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('error'),
      });
      return null;
    }
  }

  syncFiles2Upload(data: {files: File[]}, setFile: string) {
    let i = 0;
    switch (setFile) {
      case 'participation':
        this.participationImages = this.participationImages.filter(image => (image.file.id !== null && image.file.id !== undefined));
        for (i = 0; i < data.files.length; i++) {
          this.participationImages.push({file: data.files[i], toDelete: false, toAdd: true});
        }
        break;
      case 'authentication':
        this.authenticationImages = this.authenticationImages.filter(image => (image.file.id !== null && image.file.id !== undefined));
        for (i = 0; i < data.files.length; i++) {
          this.authenticationImages.push({file: data.files[i], toDelete: false, toAdd: true});
        }
        break;
      case 'background':
        this.backgroundImages = this.backgroundImages.filter(image => (image.file.id !== null && image.file.id !== undefined));
        for (i = 0; i < data.files.length; i++) {
          this.backgroundImages.push({file: data.files[i], toDelete: false, toAdd: true});
        }
        break;
    }
  }

  addFiles2Upload(data: {files: File[]}, setFile: string) {
    let i = 0;
    switch (setFile) {
      case 'participation':
        for (i = 0; i < data.files.length; i++) {
          this.participationImages.push({file: data.files[i], toDelete: false, toAdd: true});
        }
        break;
      case 'authentication':
        for (i = 0; i < data.files.length; i++) {
          this.authenticationImages.push({file: data.files[i], toDelete: false, toAdd: true});
        }
        break;
      case 'background':
        for (i = 0; i < data.files.length; i++) {
          this.backgroundImages.push({file: data.files[i], toDelete: false, toAdd: true});
        }
        break;
      case 'mobile':
        for (i = 0; i < data.files.length; i++) {
          this.calendarImages.push({file: data.files[i], toDelete: false, toAdd: true});
        }
        break;
    }
  }

  getUrlFile(url) {
    return `${environment.apiEndpoint}/files/${url}`;
  }

  async removeFile(id: number, from: string) {
    try {
      await this.planService.deleteLogo(id).toPromise();
    } catch (err) {
      console.error(err);
    }
    switch (from) {
      case 'authentication':
        this.authenticationImages = this.authenticationImages.filter(image => image.file.id !== id);
        break;
      case 'participation':
        this.participationImages = this.participationImages.filter(image => image.file.id !== id);
        break;
      case 'background':
        this.backgroundImages = this.backgroundImages.filter(image => image.file.id !== id);
        break;
      case 'mobile':
        this.calendarImages  = this.calendarImages.filter(image => image.file.id !== id);
        break;
    }
  }

  noSavedImages2Show(images: FileCtrl[]): boolean {
    const toShow = images.filter(img => (img.file.id !== null && img.file.id !== undefined && !img.toDelete));
    return (toShow.length === 0);
  }

  prepare2RemoveSavedImage(image2Delete: FileCtrl, from: string) {
    switch (from) {
      case 'participation':
        this.participationImages.forEach(image => {
          if ((image.file.id !== null && image.file.id !== null) && image.file.id === image2Delete.file.id) {
            image.toDelete = true;
          }
        });
        break;

      case 'authentication':
        this.authenticationImages.forEach(image => {
          if ((image.file.id !== null && image.file.id !== undefined) && image.file.id === image2Delete.file.id) {
            image.toDelete = true;
          }
        });
        break;


      case 'background':
        this.backgroundImages.forEach(image => {
          if ((image.file.id !== null && image.file.id !== undefined) && image.file.id === image2Delete.file.id) {
            image.toDelete = true;
          }
        });
        break;
      case 'mobile':
        this.calendarImages.forEach(image => {
          if ((image.file.id !== null && image.file.id !== undefined) && image.file.id === image2Delete.file.id) {
            image.toDelete = true;
          }
        });
        break;

    }
  }

  async removeUnsavedFile(data: {file: File}, from: string) {
    switch (from) {
      case 'participation':
        this.participationImages = this.participationImages
          .filter(image => ((image.file.id !== null && image.file.id !== undefined) || image.file.name !== data.file.name));
        break;

      case 'authentication':
        this.authenticationImages = this.authenticationImages
          .filter(image => ((image.file.id !== null && image.file.id !== undefined) || image.file.name !== data.file.name));
        break;

      case 'background':
        this.backgroundImages = this.backgroundImages
          .filter(image => ((image.file.id !== null && image.file.id !== undefined) || image.file.name !== data.file.name));
        break;
      case 'mobile':
        this.calendarImages = this.calendarImages
          .filter(image => ((image.file.id !== null && image.file.id !== undefined) || image.file.name !== data.file.name));
        break;
    }
  }

  async onChangePlans(plan, conference?) {
    this.localitiesOfDomain = [];
    const visit = {};
    let localities = [];
    if (plan.domain && plan.domain.id) {
      localities = await this.localityService.findByDomain(plan.domain.id);
    }
    this.checkRegionalization(plan);
    localities.forEach(locality => {
      if (locality.children) {
        this.loadLocalities(locality.children, this.localitiesOfDomain, plan, visit);
      }

      if (locality.type && locality.type.name && !visit[locality.type.name]) {
        visit[locality.type.name] = true;
        this.localitiesOfDomain.push({
          value: {
            id: locality.type.id,
          },
          label: locality.type.name,
        });
      }

    });
    this.localitycitizenSelected = true;
    if (conference && conference.localityType && conference.localityType.id) {
      this.conferenceForm.get('localityType').setValue(this.localitiesOfDomain.find(l => l.value.id === conference.localityType.id).value);
    }
  }

  checkRegionalization(plan: Plan) {
    if (plan && plan.structure) {
      this.structureRegionalization = plan.structure.regionalization;
    }
  }

  async searchModerators(formData) {
    let name = formData.nameModerator;
    const email = formData.emailModerator;
    name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    name = name.replace(/[^a-z0-9]/gi, ' ');
    this.moderators = await this.conferenceService.searchModerators(name, email);

    if (!this.moderators || this.moderators.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: this.translate.instant('conference.moderator.empty'),
      });
    } else {
      this.moderators.sort((a, b) => (this.comparePersonName(a, b)));
    }
  }

  addModeratorsEnabled(moderator: IPerson) {
    if (this.moderatorsEnabled && this.moderatorsEnabled.length > 0) {
      if (this.moderatorsEnabled.findIndex(m => m.contactEmail === moderator.contactEmail) !== -1) {
        this.messageService.add({
          severity: 'warn',
          summary: this.translate.instant('warn'),
          detail: this.translate.instant('conference.moderator.already-enabled', {name: moderator.name}),
        });
        return;
      }
    }

    this.moderators = this.moderators.filter(m => m.name !== moderator.name && m.contactEmail !== moderator.contactEmail);
    this.moderatorsEnabled.push(moderator);
    this.moderatorsEnabled.sort((a, b) => (this.comparePersonName(a, b)));
  }

  removeModeratorsEnabled(moderator: IPerson) {
    this.moderatorsEnabled = this.moderatorsEnabled.filter(m => m.name !== moderator.name && m.contactEmail !== moderator.contactEmail);
  }

  findPlanInList(plan: Plan) {
    this.checkRegionalization(plan);
    return this.plans.find(p => p.value.id === plan.id).value;
  }

  async loadStructureItens(conferencePlan: Plan) {
    if (conferencePlan && conferencePlan.structure) {
      const structureItemsList = conferencePlan.structure.id ?
        await this.structureItemSrv.listStructureItems(conferencePlan.structure.id) : [];
      this.structureItems = structureItemsList.map(item => ({
        value: item.id.toString(),
        label: item.name,
      }));
    }
  }

  onInput($event) {
    this.conferenceForm.patchValue(
      {name: $event.target.value.replace(/^\s+/gm, '').replace(/\s+(?=[^\s])/gm, ' ')},
      {emitEvent: false},
    );
  }

  onBlur($event) {
    this.conferenceForm.patchValue(
      {name: $event.target.value.replace(/\s+$/gm, '')},
      {emitEvent: false});
  }

  private buildBreadcrumb() {
    this.breadcrumbService.setItems([
      {label: 'administration.label'},
      {label: 'administration.conference', routerLink: ['/administration/conferences']},
    ]);
  }

  private isValidForm(form, errorMessage = this.translate.instant('erro.invalid.data')) {
    if (!form.valid) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: errorMessage,
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

  private loadLocalities(localities, localitiesOfDomain, plan, visit) {
    localities.forEach(locality => {
      if (locality.children) {
        this.loadLocalities(locality.children, localitiesOfDomain, plan, visit);
      }

      if (!visit[locality.type.name]) {
        visit[locality.type.name] = true;
        this.localitiesOfDomain.push({
          value: {
            id: locality.type.id,
          },
          label: locality.type.name,
        });
      }
    });
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

  handleFormChange(event){
    this.conferenceCustomProperties.setValue(event.value);
  }

}
