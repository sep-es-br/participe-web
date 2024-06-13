import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";

import { SelectItem } from "primeng/api";
import { PaginatorState } from "primeng/paginator";

import { TranslateService } from "@ngx-translate/core";
import { ActionBarService } from "@app/core/actionbar/app.actionbar.actions.service";
import { BreadcrumbService } from "@app/core/breadcrumb/breadcrumb.service";
import { ModerationService } from "@app/shared/services/moderation.service";
import { ProposalEvaluationService } from "@app/shared/services/proposal-evaluation.service";
import { EvaluatorsService } from "@app/shared/services/evaluators.service";

import { IProposal, IProposalEvaluationSearchFilter } from "@app/shared/interface/IProposal";

import { Conference } from "@app/shared/models/conference";

import { StoreKeys } from "@app/shared/constants";

@Component({
  selector: "app-proposal-evaluation",
  standalone: false,
  templateUrl: "./proposal-evaluation.component.html",
  styleUrl: "./proposal-evaluation.component.scss",
})
export class ProposalEvaluationComponent implements OnInit {
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
    private moderationSrv: ModerationService,
    private translateService: TranslateService,
    private proposalEvaluationService: ProposalEvaluationService,
    private evaluatorsService: EvaluatorsService,
    private router: Router
  ) {
      this.propEvalSearchFilter = JSON.parse(sessionStorage.getItem("propEvalSearchFilter"));
  }

  public async ngOnInit() {
    await this.loadConferences();
    this.initSearchForm();
    await this.checkIsPersonEvaluator();

    if(sessionStorage.getItem("evaluatorOrgGuid")) {
      await this.listProposalEvaluationsByConference(
        this.pageState.page,
        this.pageState.rows,
        this.propEvalSearchFilter
      );
   
      await this.populateSearchFilterOptions().finally(() => this.organizationOptions = this.evaluatorsService.organizationsListSelectItem);

      if(Object.values(this.propEvalSearchFilter).some((value) => !!value)) {
        this.search = true
      }

    } else {
      setTimeout(() => this.router.navigate([""]), 3000)
    }
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
    if(this.conferenceSelect.evaluationConfiguration && this.conferenceSelect.evaluationConfiguration.evaluationDisplayStatus == "OPEN"){
      sessionStorage.setItem("isEvaluationOpen", JSON.stringify(true));
    }
    this.buildBreadcrumb();
    await this.listProposalEvaluationsByConference(0, 10);
    await this.getDomainConfiguration();
    this.showSelectConference = false;
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
    await this.moderationSrv.getConferencesActive(false)
      .then((data) => {
        this.conferences = data;
        sessionStorage.setItem("isEvaluationOpen", JSON.stringify(false));
        if (sessionStorage.getItem("selectedConference") === null) {
          if (data.length > 0) {
            if(data.filter((conf) => conf.evaluationConfiguration?.evaluationDisplayStatus == "OPEN").length > 0){
              this.conferenceSelect = data.filter((conf) => conf.evaluationConfiguration?.evaluationDisplayStatus == "OPEN")[0];
              sessionStorage.setItem("isEvaluationOpen", JSON.stringify(true));
            }else if (data.filter((conf) => conf.isActive).length === 0) {
              this.conferenceSelect = data[0];
            } else {
              this.conferenceSelect = data.filter((conf) => conf.isActive)[0];
            }
          }
        } else {
          this.conferenceSelect = JSON.parse(
            sessionStorage.getItem("selectedConference")
          );
          if(this.conferenceSelect.evaluationConfiguration && this.conferenceSelect.evaluationConfiguration.evaluationDisplayStatus == "OPEN"){
            sessionStorage.setItem("isEvaluationOpen", JSON.stringify(true));
          }
        }
      })
      .then(() => {
        this.buildBreadcrumb();
        this.configureActionBar();
      })
      .finally(() => {
        this.getDomainConfiguration();
      });
  }

  private async getDomainConfiguration() {
    await this.proposalEvaluationService
      .getDomainConfiguration(this.conferenceSelect.id)
      .then((response) => (this.proposalEvaluationService.domainConfigNamesObj = response))
      .finally(() => this.domainConfigNamesObj = this.proposalEvaluationService.domainConfigNamesObj)
  }

  private async checkIsPersonEvaluator() {
    const personId = JSON.parse(localStorage.getItem(StoreKeys.USER_INFO))['id']

    try {
      this.loading = true
      await this.proposalEvaluationService.checkIsPersonEvaluator(personId).then(
        (response) => sessionStorage.setItem("evaluatorOrgGuid", response)
      )
    } catch (error) {
      console.error(error);
      sessionStorage.removeItem("evaluatorOrgGuid");
    } finally {
      this.loading = false
    }
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
        this.pageState.first =
          response.pageable.pageNumber * response.pageable.pageSize;
        this.pageState.rows = response.pageable.pageSize;
        this.pageState.pageCount = response.totalPages;
        this.pageState.page = response.pageable.pageNumber;
        this.proposalList = response.content;
      })
      .finally(() => this.loading = false);
  }

  private initSearchForm() {
    this.proposalEvaluationSearchForm = new FormGroup({
      evaluationStatus: new FormControl(
        this.propEvalSearchFilter?.evaluationStatus ?? null
      ),
      localityId: new FormControl(this.propEvalSearchFilter?.localityId ?? null),
      planItemAreaId: new FormControl(
        this.propEvalSearchFilter?.planItemAreaId ?? null
      ),
      planItemId: new FormControl(this.propEvalSearchFilter?.planItemId ?? null),
      organizationGuid: new FormControl(
        this.propEvalSearchFilter?.organizationGuid ?? null
      ),
      loaIncluded: new FormControl(this.propEvalSearchFilter?.loaIncluded ?? null),
      commentText: new FormControl(this.propEvalSearchFilter?.commentText ?? null),
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
        this.localityOptions.unshift({ label: this.translateService.instant("all"), value: null });
      });
  }

  private async getPlanItemOptions() {
    await this.proposalEvaluationService
      .getPlanItemOptions(this.conferenceSelect.id)
      .then((response) => {
        this.planItemOptions = response.map((planItem) => {
          return { label: planItem.name, value: planItem.id };
        });
        this.planItemOptions.unshift({ label: this.translateService.instant("all"), value: null });
      });
  }

  private async getPlanItemAreaOptions() {
    await this.proposalEvaluationService
      .getPlanItemAreaOptions(this.conferenceSelect.id)
      .then((response) => {
        this.planItemAreaOptions = response.map((planItemArea) => {
          return { label: planItemArea.name, value: planItemArea.id };
        });
        this.planItemAreaOptions.unshift({ label: this.translateService.instant("all"), value: null });
      });
  }

  private async populateSearchFilterOptions() {
    this.getEvaluationStatusOptions();
    this.getLoaIncludedOptions();
    await this.getLocalityOptions();
    await this.getPlanItemOptions();
    await this.getPlanItemAreaOptions();
  }

  private buildBreadcrumb() {
    this.breadcrumbService.setItems([
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
}
