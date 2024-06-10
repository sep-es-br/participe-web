import { Component, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { ProposalEvaluationService } from "@app/shared/services/proposal-evaluation.service";

import { IProposal } from "@app/shared/interface/IProposal";
import { EvaluatorsService } from "@app/shared/services/evaluators.service";


@Component({
  selector: "app-proposal",
  standalone: false,
  templateUrl: "./proposal.component.html",
  styleUrl: "./proposal.component.scss",
})
export class ProposalComponent {
  @Input("proposalData") proposal: IProposal;
  
  public domainConfigNames: Object = {};

  public organizationsGuidNameMapObject: {[key: string]: string} = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evaluatorsService: EvaluatorsService
  ) {
    this.domainConfigNames = JSON.parse(
      sessionStorage.getItem("domainConfigNames")
    );

    this.organizationsGuidNameMapObject = this.evaluatorsService.organizationsGuidNameMapObject;
  }

  public getOrgName(orgGuid: string): string {
    return this.organizationsGuidNameMapObject[orgGuid].split("-")[1].trim();
  }

  public evaluateProposal(proposal: IProposal) {
    sessionStorage.setItem("proposalData", JSON.stringify(proposal));

    this.router.navigate([`${proposal.id}`], {
      relativeTo: this.route,
    });
  }
}