import { Component, OnInit } from "@angular/core";
import { ActionBarService } from "@app/core/actionbar/app.actionbar.actions.service";
import { BreadcrumbService } from "@app/core/breadcrumb/breadcrumb.service";
import { Conference } from "@app/shared/models/conference";
import { ConferenceService } from "@app/shared/services/conference.service";

@Component({
  selector: "app-proposal-evaluation",
  standalone: false,
  templateUrl: "./proposal-evaluation.component.html",
  styleUrl: "./proposal-evaluation.component.scss",
})
export class ProposalEvaluationComponent implements OnInit {
  conferences: Conference[];
  conferenceSelect: Conference = new Conference();
  showSelectConference: boolean = false;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private actionBarService: ActionBarService,
    private conferenceService: ConferenceService
  ) {}

  async ngOnInit() {
    await this.loadConferences();
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

  selectOtherConference(conference: Conference) {
    this.conferenceSelect = conference;
    sessionStorage.setItem("selectedConference", JSON.stringify(conference));
    this.buildBreadcrumb();
    this.showSelectConference = false;
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
