import { Component, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { EvaluatorsService } from "@app/shared/services/evaluators.service";

import { IProposal } from "@app/shared/interface/IProposal";


@Component({
  selector: "app-proposal",
  standalone: false,
  templateUrl: "./proposal.component.html",
  styleUrl: "./proposal.component.scss",
})
export class ProposalComponent {
  @Input("proposalData") proposal: IProposal;
  @Input("domainConfigNamesObj") domainConfigNamesObj: Object;
  
  public domainConfigNames: Object = {};

  public isEvaluationOpen: boolean = false;

  public organizationsGuidNameMapObject: {[key: string]: string} = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evaluatorsService: EvaluatorsService,
  ) {
    this.isEvaluationOpen = JSON.parse(sessionStorage.getItem('isEvaluationOpen'));

    this.organizationsGuidNameMapObject = this.evaluatorsService.organizationsGuidNameMapObject;
  }

  public getOrgName(orgGuid: string): string {
    return this.organizationsGuidNameMapObject[orgGuid].split("-")[1].trim();
  }

  public evaluateProposal(proposal: IProposal) {
    sessionStorage.setItem("proposalData", JSON.stringify(proposal));

    this.router.navigate([`${proposal.commentId}`], {
      relativeTo: this.route,
    });
  }
}
