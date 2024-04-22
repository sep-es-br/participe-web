import { Component, OnInit } from "@angular/core";
import { ActionBarService } from "@app/core/actionbar/app.actionbar.actions.service";
import { BreadcrumbService } from "@app/core/breadcrumb/breadcrumb.service";
import { IProposal } from "@app/shared/interface/IProposal";
import { Conference } from "@app/shared/models/conference";
import { ConferenceService } from "@app/shared/services/conference.service";
import { HelperUtils } from "@app/shared/util/HelpersUtil";

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
  search: boolean = false;
  showSelectConference: boolean = false;
  proposalList: IProposal[] = [];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private actionBarService: ActionBarService,
    private conferenceService: ConferenceService
  ) {
    this.proposalList = [
      {
        status: "Avaliado",
        microrregion: "Caparaó",
        descriptionText:
          "Elaborar e implementar um plano abrangente de educação e formação profissional direcionado a indivíduos detidos, visando proporcionar-lhes oportunidades significativas para adquirir novas habilidades, competências e conhecimentos que os habilitem a reintegrar-se de forma eficaz e construtiva na comunidade após o período de encarceramento.",
        themeArea: "02. Segurança Pública e Justiça",
        budgetCategory: "Segurança e Cidadania",
        entities: [
          "SECULT",
          "SEAMA",
          "SEDU",
          "PGE",
          "PGE",
          "PGE",
          "PGE",
          "PGE",
          "PGE",
          "PGE",
          "PGE",
          "PGE",
          "PGE",
          "PGE",
          "PGE",
          "PGE",
          "PGE",
          "PGE",
          "PGE",
          "PGE",
          "PGE",
        ],
      },
      {
        status: "Não Avaliado",
        microrregion: "Central Serrana",
        descriptionText:
          "Propor a inserção de um currículo dedicado à Robótica nos programas educacionais do Estado do Espírito Santo, tanto teórico quanto prático, incluindo laboratórios específicos para a aprendizagem e experimentação nesse campo. Esta iniciativa não apenas ampliaria o leque de disciplinas oferecidas, mas também prepararia os estudantes para as demandas crescentes do mercado de trabalho em áreas relacionadas à tecnologia e inovação.",
        themeArea: "01. Educação, Cultura, Esporte e Lazer",
        budgetCategory: "Educação",
        entities: [
          "SECULT",
          "SEAMA",
          "SEDU",
          // "PGE",
          // "PGE",
          // "PGE",
          // "PGE",
          // "PGE",
          // "PGE",
        ],
      },
    ];
  }

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

  toggleSearch() {
    this.search = !this.search;
    sessionStorage.setItem("searchState", this.search ? "show" : "hide");
  }

  getIcon(icon?: string) {
    return HelperUtils.loadingIcon(icon, this.loading);
  }

  searchHandle() {}

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
