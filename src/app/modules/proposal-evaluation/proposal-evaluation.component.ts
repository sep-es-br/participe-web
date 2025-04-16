
import { Component, OnInit } from "@angular/core";
import { ActionBarService } from "@app/core/actionbar/app.actionbar.actions.service";
import { BreadcrumbService } from "@app/core/breadcrumb/breadcrumb.service";
import { IProposal } from "@app/shared/interface/IProposal";
import { ProposalEvaluationFilter } from "@app/shared/models/ProposalEvaluationFilter";
import { Conference } from "@app/shared/models/conference";
import { ConferenceService } from "@app/shared/services/conference.service";
import { ProposalEvaluationService } from "@app/shared/services/proposal-evaluation.service";
import { HelperUtils } from "@app/shared/util/HelpersUtil";
import { SelectItem } from "primeng/api";
import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Location } from "@angular/common";

import { SelectItem } from "primeng/api";
import { PaginatorState } from "primeng/paginator";

import { TranslateService } from "@ngx-translate/core";
import { ActionBarService } from "@app/core/actionbar/app.actionbar.actions.service";
import { BreadcrumbService } from "@app/core/breadcrumb/breadcrumb.service";
import { ProposalEvaluationService } from "@app/shared/services/proposal-evaluation.service";
import { EvaluatorsService } from "@app/shared/services/evaluators.service";

import {
  IProposal,
  IProposalEvaluationSearchFilter,
} from "@app/shared/interface/IProposal";

import { Conference } from "@app/shared/models/conference";
import { faComment } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "app-proposal-evaluation",
  standalone: false,
  templateUrl: "./proposal-evaluation.component.html",
  styleUrl: "./proposal-evaluation.component.scss",
})
export class ProposalEvaluationComponent implements OnInit {
  loading: boolean = false;

  conferences: Conference[];
  conferenceSelect: Conference = new Conference();
  showSelectConference: boolean = false;

  evaluationStatusOptions: SelectItem[] = [];
  microrregionOptions: SelectItem[] = [];
  themeAreaOptions: SelectItem[] = [];
  budgetCategoryOptions: SelectItem[] = [];
  entityOptions: SelectItem[] = [];
  loaIncludedOptions: SelectItem[] = [];

  search: boolean = false;
  filter: ProposalEvaluationFilter;

  // proposalList: IProposal[] = [];
  proposalList: any[] = []; // por enquanto

export class ProposalEvaluationComponent implements OnInit, AfterViewInit, OnDestroy {
  public loading: boolean = false;

  public domainConfigNamesObj: Object = {};

  public conferences: Conference[];
  public conferenceSelect: Conference = new Conference();
  public showSelectConference: boolean = false;

  public search: boolean = false;
  public isEvaluationOpen: boolean = false;
  public proposalEvaluationSearchForm: FormGroup;
  private propEvalSearchFilter: IProposalEvaluationSearchFilter;

  public evaluationStatusOptions: SelectItem[] = [];
  public localityOptions: SelectItem[] = [];
  public planItemAreaOptions: SelectItem[] = [];
  public planItemOptions: SelectItem[] = [];
  public organizationOptions: SelectItem[] = [];
  public transformedOptions: SelectItem[] = [];
  public loaIncludedOptions: SelectItem[] = [];

  public pageState: PaginatorState = {
    first: 0,
    page: 0,
    pageCount: 0,
    rows: 10,
  };

  public totalRecords: number = 0;
  public rowsPerPageOptions: Array<number> = [10, 25, 50];

  public proposalList: IProposal[] = [];


  constructor(
    private breadcrumbService: BreadcrumbService,
    private actionBarService: ActionBarService,
    private conferenceService: ConferenceService,
    private proposalEvaluationService: ProposalEvaluationService,
    private translateService: TranslateService,
    private proposalEvaluationService: ProposalEvaluationService,
    private evaluatorsService: EvaluatorsService
  ) {
    const propEvalFilter = sessionStorage.getItem("propEvalFilter");

    this.filter = propEvalFilter
      ? JSON.parse(propEvalFilter)
      : new ProposalEvaluationFilter();
  }

  async ngOnInit() {
    await this.loadConferences();
    this.populateSearchFilterOptions();
    // this.loadProposals();

    await this.testFetchProposals();
  }

  async loadConferences() {
    await this.conferenceService
      .listAll()
      .then((data) => {
        this.conferences = data;
        this.conferenceSelect =
          JSON.parse(sessionStorage.getItem("selectedConference")) ??
          this.conferences[0];

    
  ) {
    this.propEvalSearchFilter = JSON.parse(
      sessionStorage.getItem("propEvalSearchFilter")
    );

    this.getEvaluationStatusOptions();
    this.getLoaIncludedOptions();
  }

  public async ngOnInit() {
    this.setInfo();
  }

  public async setInfo() {
    await this.loadConferences();

    await this.listProposalEvaluationsByConference(
      this.pageState.page,
      this.pageState.rows,
      this.propEvalSearchFilter
    );

    await this.populateSearchFilterOptions().finally(
      () =>
        (this.organizationOptions =
          this.evaluatorsService.organizationsListSelectItem)
    );
    this.transformedOptions = this.organizationOptions.map(option => ({
      ...option,
      label: this.invertLabel(option.label)
    }));
    if (
      this.propEvalSearchFilter &&
      Object.values(this.propEvalSearchFilter).some((value) => !!value)
    ) {
      this.search = true;
    }

    this.initSearchForm();
  }

  public ngAfterViewInit(): void {
    this.translateService.onLangChange.subscribe((langConfig) => {
      this.search = false;
      this.translateSearchFormOptions(langConfig.translations["all"]);
    });
  }

  public async pageChange(event: PaginatorState) {
    await this.listProposalEvaluationsByConference(
      event.page,
      event.rows,
      this.proposalEvaluationSearchForm?.value
    );
  }

  public async selectOtherConference(conference: Conference) {
    this.conferenceSelect = conference;
    sessionStorage.setItem("selectedConference", JSON.stringify(conference));
    sessionStorage.setItem("isEvaluationOpen", JSON.stringify(false));
    if (
      this.conferenceSelect.evaluationConfiguration &&
      this.conferenceSelect.evaluationConfiguration.evaluationDisplayStatus ==
        "OPEN"
    ) {
      sessionStorage.setItem("isEvaluationOpen", JSON.stringify(true));
    }
    this.buildBreadcrumb();
    await this.listProposalEvaluationsByConference(0, 10);
    await this.getDomainConfiguration();
    this.showSelectConference = false;
  }

  public ngOnDestroy(): void {
      this.actionBarService.recordAmount = undefined;
  }

  public toggleSearch() {
    this.search = !this.search;
    sessionStorage.setItem("searchState", this.search ? "show" : "hide");
  }

  public clearSearchForm() {
    for (const key in this.proposalEvaluationSearchForm.controls) {
      this.proposalEvaluationSearchForm.controls[key].patchValue(null);
    }
  }

  public async downloadProposalEvaluation(){
    await this.proposalEvaluationService.jasperxlsx( this.conferenceSelect.id, this.proposalEvaluationSearchForm.value)
  }

  public async searchHandle() {

    sessionStorage.setItem(
      "propEvalSearchFilter",
      JSON.stringify(this.proposalEvaluationSearchForm.value)
    );

    await this.listProposalEvaluationsByConference(
      0,
      10,
      this.proposalEvaluationSearchForm.value
    );
  }

  private async loadConferences() {
    await this.proposalEvaluationService
      .getConferencesActive(false)
      .then((data) => {
        this.conferences = data;
        sessionStorage.setItem("isEvaluationOpen", JSON.stringify(false));
        if (sessionStorage.getItem("selectedConference") === null) {
          if (data.length > 0) {
            if (
              data.filter(
                (conf) =>
                  conf.evaluationConfiguration?.evaluationDisplayStatus ==
                  "OPEN"
              ).length > 0
            ) {
              this.conferenceSelect = data.filter(
                (conf) =>
                  conf.evaluationConfiguration?.evaluationDisplayStatus ==
                  "OPEN"
              )[0];
              sessionStorage.setItem("isEvaluationOpen", JSON.stringify(true));
            } else if (data.filter((conf) => conf.isActive).length === 0) {
              this.conferenceSelect = data[0];
            } else {
              this.conferenceSelect = data.filter((conf) => conf.isActive)[0];
            }
          }
        } else {
          this.conferenceSelect = JSON.parse(
            sessionStorage.getItem("selectedConference")
          );

          this.conferenceSelect = this.conferences.find(conference => conference.id === this.conferenceSelect.id)

          if (
            this.conferenceSelect.evaluationConfiguration &&
            this.conferenceSelect.evaluationConfiguration
              .evaluationDisplayStatus == "OPEN"
          ) {
            sessionStorage.setItem("isEvaluationOpen", JSON.stringify(true));
          }
        }
      })
      .then(() => {
        this.buildBreadcrumb();
        this.configureActionBar();
      });
  }

  async testFetchProposals() {
    // console.log(this.conferenceSelect)
    const conferenceId = this.conferenceSelect.id

    await this.proposalEvaluationService
      .testFetchProposals(conferenceId)
      .then((data) => this.proposalList = data);
  }

  populateSearchFilterOptions() {
    const filterOptions = this.proposalEvaluationService.getFilterOptions();

    this.evaluationStatusOptions = filterOptions.evaluationStatusOptions;
    this.evaluationStatusOptions.unshift({ label: "Todos", value: null });

    this.microrregionOptions = filterOptions.microrregionOptions;
    this.microrregionOptions.unshift({ label: "Todos", value: null });

    this.themeAreaOptions = filterOptions.themeAreaOptions;
    this.themeAreaOptions.unshift({ label: "Todos", value: null });

    this.budgetCategoryOptions = filterOptions.budgetCategoryOptions;
    this.budgetCategoryOptions.unshift({ label: "Todos", value: null });

    this.entityOptions = filterOptions.entityOptions;
    this.entityOptions.unshift({ label: "Todos", value: null });

    this.loaIncludedOptions = filterOptions.loaIncludedOptions;
    this.loaIncludedOptions.unshift({ label: "Todos", value: null });
  }

  loadProposals() {
    this.proposalList =
      this.proposalEvaluationService.getProposalListForEvaluation();
  }

  async selectOtherConference(conference: Conference) {
    this.conferenceSelect = conference;
    sessionStorage.setItem("selectedConference", JSON.stringify(conference));
    this.buildBreadcrumb();
    await this.testFetchProposals();
    this.showSelectConference = false;
  }

  toggleSearch() {
    this.search = !this.search;
    sessionStorage.setItem("searchState", this.search ? "show" : "hide");
  }

  getIcon(icon?: string) {
    return HelperUtils.loadingIcon(icon, this.loading);
  }

  searchHandle() {
    console.log(this.filter);
    sessionStorage.setItem("propEvalFilter", JSON.stringify(this.filter));

      })
      .finally(async () => {
        await this.getDomainConfiguration();
      });
  }

  private async getDomainConfiguration() {
    await this.proposalEvaluationService
      .getDomainConfiguration(this.conferenceSelect.id)
      .then(
        (response) =>
          (this.proposalEvaluationService.domainConfigNamesObj = response)
      )
      .finally(
        () =>
          (this.domainConfigNamesObj =
            this.proposalEvaluationService.domainConfigNamesObj)
      );
  }

  private async listProposalEvaluationsByConference(
    pageNumber: number,
    pageSize: number,
    searchFilter?: IProposalEvaluationSearchFilter
  ) {
    this.loading = true;
    await this.proposalEvaluationService
      .listProposalEvaluationsByConference(
        this.conferenceSelect.id,
        pageNumber,
        pageSize,
        searchFilter
      )
      .then((response) => {
        this.totalRecords = response.totalElements;
        this.actionBarService.recordAmount = {
          icon: faComment,
          label: "dashboard.proposals",
          amount:response.totalElements
        }
        this.pageState.first =
          response.pageable.pageNumber * response.pageable.pageSize;
        this.pageState.rows = response.pageable.pageSize;
        this.pageState.pageCount = response.totalPages;
        this.pageState.page = response.pageable.pageNumber;
        this.proposalList = response.content;
      })
      .finally(() => (this.loading = false));
  }

  private initSearchForm() {
    this.proposalEvaluationSearchForm = new FormGroup({
      evaluationStatus: new FormControl(
        this.propEvalSearchFilter?.evaluationStatus ?? null
      ),
      localityId: new FormControl(
        this.propEvalSearchFilter?.localityId ?? null
      ),
      planItemAreaId: new FormControl(
        this.propEvalSearchFilter?.planItemAreaId ?? null
      ),
      planItemId: new FormControl(
        this.propEvalSearchFilter?.planItemId ?? null
      ),
      organizationGuid: new FormControl(
        this.propEvalSearchFilter?.organizationGuid ?? null
      ),
      loaIncluded: new FormControl(
        this.propEvalSearchFilter?.loaIncluded ?? null
      ),
      commentText: new FormControl(
        this.propEvalSearchFilter?.commentText ?? null
      ),
    });
  }

  private getEvaluationStatusOptions() {
    this.evaluationStatusOptions =
      this.proposalEvaluationService.getEvaluationStatusOptions();
  }

  private getLoaIncludedOptions() {
    this.loaIncludedOptions =
      this.proposalEvaluationService.getLoaIncludedOptions();
  }

  private async getLocalityOptions() {
    await this.proposalEvaluationService
      .getLocalityOptions(this.conferenceSelect.id)
      .then((response) => {
        this.localityOptions = response.map((locality) => {
          return { label: locality.localityName, value: locality.localityId };
        });
        this.localityOptions.unshift({
          label: this.translateService.instant("all"),
          value: null,
        });
      });
  }

  private async getPlanItemOptions() {
    await this.proposalEvaluationService
      .getPlanItemOptions(this.conferenceSelect.id)
      .then((response) => {
        this.planItemOptions = response.map((planItem) => {
          return { label: planItem.name, value: planItem.id };
        });
        this.planItemOptions.unshift({
          label: this.translateService.instant("all"),
          value: null,
        });
      });
  }

  private async getPlanItemAreaOptions() {
    await this.proposalEvaluationService
      .getPlanItemAreaOptions(this.conferenceSelect.id)
      .then((response) => {
        this.planItemAreaOptions = response.map((planItemArea) => {
          return { label: planItemArea.name, value: planItemArea.id };
        });
        this.planItemAreaOptions.unshift({
          label: this.translateService.instant("all"),
          value: null,
        });
      });
  }

  private async populateSearchFilterOptions() {
    await this.getLocalityOptions();
    await this.getPlanItemOptions();
    await this.getPlanItemAreaOptions();
    this.getEvaluationStatusOptions();
    this.getLoaIncludedOptions();

  }

  private buildBreadcrumb() {
    this.breadcrumbService.setItems([

      { label: "proposal_evaluation" },

      { label: "proposal_evaluation.title" },

      {
        label: this.conferenceSelect.name,
        routerLink: ["/proposal-evaluation"],
      },
    ]);
  }

  private configureActionBar() {
    this.actionBarService.setItems([
      {
        position: "LEFT",
        handle: () => {
          this.showSelectConference = !this.showSelectConference;
        },
        icon: "change.svg",
      },
    ]);
  }

  private translateSearchFormOptions(translation: string) {
    this.evaluationStatusOptions[0].label = translation;
    this.localityOptions[0].label = translation;
    this.planItemAreaOptions[0].label = translation;
    this.planItemOptions[0].label = translation;
    this.loaIncludedOptions[0].label = translation;

    this.getEvaluationStatusOptions();
    this.getLoaIncludedOptions();

    const propEvalSearchFormControls =
      this.proposalEvaluationSearchForm.controls;

    for (const key in propEvalSearchFormControls) {
      if (propEvalSearchFormControls[key].value == null) {
        propEvalSearchFormControls[key].patchValue(null);
        propEvalSearchFormControls[key].updateValueAndValidity();
      }
    }
  }

  invertLabel(label: string): string {
    const parts = label.split(' - ');
    return parts.length > 1 ? `${parts[1]} - ${parts[0]}` : label;
  }

}
