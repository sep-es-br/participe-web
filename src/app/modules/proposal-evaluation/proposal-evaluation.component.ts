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

  proposalList: IProposal[] = [];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private actionBarService: ActionBarService,
    private conferenceService: ConferenceService,
    private proposalEvaluationService: ProposalEvaluationService
  ) {
    const propEvalFilter = sessionStorage.getItem("propEvalFilter");

    this.filter = propEvalFilter
      ? JSON.parse(propEvalFilter)
      : new ProposalEvaluationFilter();
  }

  async ngOnInit() {
    await this.loadConferences();
    this.populateSearchFilterOptions();
    this.loadProposals();
  }

  async loadConferences() {
    await this.conferenceService
      .listAll()
      .then((data) => {
        this.conferences = data;
        this.conferenceSelect = this.conferences[0];
      })
      .then(() => {
        this.buildBreadcrumb();
        this.configureActionBar();
      });
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

    // await this.proposalEvaluationService
    //   .getProposalListForEvaluation()
    //   .then((data) => console.log(data));
  }

  selectOtherConference(conference: Conference) {
    this.conferenceSelect = conference;
    sessionStorage.setItem("selectedConference", JSON.stringify(conference));
    this.buildBreadcrumb();
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
    console.log(this.filter)
    sessionStorage.setItem("propEvalFilter", JSON.stringify(this.filter));
  }

  private buildBreadcrumb() {
    this.breadcrumbService.setItems([
      { label: "proposal_evaluation" },
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
