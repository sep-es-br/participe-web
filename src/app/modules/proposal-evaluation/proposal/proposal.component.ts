import { Component, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { ProposalEvaluationService } from "@app/shared/services/proposal-evaluation.service";

import { IProposal } from "@app/shared/interface/IProposal";


@Component({
  selector: "app-proposal",
  standalone: false,
  templateUrl: "./proposal.component.html",
  styleUrl: "./proposal.component.scss",
})
export class ProposalComponent {
  @Input("proposalData") proposal: IProposal;
  
  public domainConfigNames: Object = {};
  public orgGuidNameMapObj: { [key: string]: string };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private proposalEvaluationService: ProposalEvaluationService
  ) {
    this.domainConfigNames = JSON.parse(
      sessionStorage.getItem("domainConfigNames")
    );

    this.orgGuidNameMapObj = this.proposalEvaluationService.orgGuidNameMapObj
  }

  public getOrgName(orgGuid: string): string {
    return this.orgGuidNameMapObj[orgGuid].split("-")[1].trim();
  }

  public evaluateProposal(proposal: IProposal) {
    sessionStorage.setItem("proposalData", JSON.stringify(proposal));

    this.router.navigate([`${proposal.id}`], {
      relativeTo: this.route,
    });
  }
}
