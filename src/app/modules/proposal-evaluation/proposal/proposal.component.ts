import { AfterViewInit, Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { EvaluatorsService } from "@app/shared/services/evaluators.service";

import { IProposal } from "@app/shared/interface/IProposal";
import { ProposalEvaluationService } from "@app/shared/services/proposal-evaluation.service";
import { TranslateService } from "@ngx-translate/core";
import { ModalData } from "@app/shared/interface/IModalData";
import { ModalService } from "@app/core/modal/modal.service";

@Component({
  selector: "app-proposal",
  standalone: false,
  templateUrl: "./proposal.component.html",
  styleUrl: "./proposal.component.scss",
})
export class ProposalComponent implements OnInit {
  @Input("proposalData") proposal: IProposal;
  @Input("domainConfigNamesObj") domainConfigNamesObj: Object;

  public domainConfigNames: Object = {};

  public isEvaluationOpen: boolean = false;

  public isEvaluatorOrgGuid: boolean = false;

  public modalData: ModalData;

  public evaluatorOrgGuid: string;
  public hasEvaluatorOrgGuid: boolean;
  public orgHasPreference: boolean;
  public optionsData: Array<string>;
  public orgNamedropDownSelect: string;
  public selectedOrg: any;
  public proposalModal: IProposal;

  public organizationsGuidNameMapObject: { [key: string]: string } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService,
    private modalService: ModalService,
    private evaluatorsService: EvaluatorsService,
    private proposalEvaluationService: ProposalEvaluationService
  ) {
    this.isEvaluationOpen = JSON.parse(
      sessionStorage.getItem("isEvaluationOpen")
    );

    if (sessionStorage.getItem("evaluatorOrgGuid")) {
      this.isEvaluatorOrgGuid = true;
    } else {
      this.isEvaluatorOrgGuid = false;
    }

    this.modalData = new ModalData(
      translateService.instant("proposal_evaluation.modalTitle"),
      {
        confirm: translateService.instant("proposal_evaluation.modalConfirm"),
        cancel: translateService.instant("proposal_evaluation.modalCancel"),
      },
      true
    );
    if(sessionStorage.getItem("noPreference")){
      const guids = String(sessionStorage.getItem("noPreference"))
      sessionStorage.setItem("evaluatorOrgGuid", guids);
      sessionStorage.removeItem("noPreference")
    }

    this.evaluatorOrgGuid = String(sessionStorage.getItem("evaluatorOrgGuid"));

    if (sessionStorage.getItem("evaluatorOrgGuid")) {
      this.hasEvaluatorOrgGuid = true;
    }

    this.organizationsGuidNameMapObject =
      this.evaluatorsService.organizationsGuidNameMapObject;
  }

  public async ngOnInit() {
    if (
      this.proposalEvaluationService.getBudgetUnitList().length == 0 ||
      this.proposalEvaluationService.getReasonOptions().length == 0
    ) {
      await this.proposalEvaluationService.populateBudgetOptions();
    }

  }

  public modalOpen(proposal: IProposal) {
    this.orgHasPreference = true;
    this.optionsData = this.getOrgNameModal();
    this.modalService.open(proposal.commentId.toString());
  }

  public getOrgNameModal(): string[] {
    const guid = this.evaluatorOrgGuid.split(",");
    const organizationsList = this.evaluatorsService.organizationsList;

    const listGuidsPerson: Set<string> = new Set(guid);

    const guidNameList = organizationsList.filter((item) =>
      listGuidsPerson.has(item.guid)
    );

    const lista1JSON = JSON.stringify(guidNameList);

    sessionStorage.setItem("modalGuidNameList", lista1JSON);
    let guids;
    try {
      guids = guid.map((guid) =>
        this.organizationsGuidNameMapObject[guid].trim()
      );
      this.orgNamedropDownSelect = this.selectedOrg = guids[0];
    } catch (error) {
      this.router.navigate(["proposal-evaluation"]);
    }

    return guids;
  }

  public onDropdownChange(event: any): void {
    this.orgNamedropDownSelect = event.value;
  }

  public cancel(){
    sessionStorage.removeItem("modalGuidNameList");
  }

  public confirmedModal() {
    const modalGuidNameList = JSON.parse(
      sessionStorage.getItem("modalGuidNameList")
    );
    const orgname = this.orgNamedropDownSelect;

    const guidName = modalGuidNameList.find((item) => item.name === orgname);

    if (this.orgHasPreference == false) {
      sessionStorage.setItem("noPreference", this.evaluatorOrgGuid);
    }

    sessionStorage.setItem("evaluatorOrgGuid", guidName.guid);
    this.evaluatorOrgGuid = guidName.guid;
    sessionStorage.removeItem("modalGuidNameList")
    this.evaluateProposal(this.proposalModal);
  }

  public getOrgName(orgGuid: string): string {
    if (Object.entries(this.organizationsGuidNameMapObject).length == 0) {
      this.organizationsGuidNameMapObject =
        this.evaluatorsService.organizationsGuidNameMapObject;
    }

    let orgname = this.organizationsGuidNameMapObject[orgGuid];
    if (orgname !== undefined) return orgname.split("-")[1].trim();
  }

  public evaluateProposal(proposal: IProposal) {
    sessionStorage.setItem("proposalData", JSON.stringify(proposal));

    this.router.navigate([`${proposal.commentId}`], {
      relativeTo: this.route,
    });
  }

  public createOrEditProposal(proposal: IProposal, guid?: string) {
    if(guid){
      sessionStorage.setItem("viewEvaluation", guid);
    }
    this.proposalModal = proposal;
    if (this.evaluatorOrgGuid.split(",").length > 1) {
      this.modalOpen(proposal);
    } else {
      this.evaluateProposal(proposal);
    }
  }
}
