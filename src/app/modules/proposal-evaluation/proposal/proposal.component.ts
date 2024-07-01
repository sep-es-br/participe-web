import { AfterViewInit, Component, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { EvaluatorsService } from "@app/shared/services/evaluators.service";

import { IProposal } from "@app/shared/interface/IProposal";


@Component({
  selector: "app-proposal",
  standalone: false,
  templateUrl: "./proposal.component.html",
  styleUrl: "./proposal.component.scss",
})
export class ProposalComponent{
  @Input("proposalData") proposal: IProposal;
  @Input("domainConfigNamesObj") domainConfigNamesObj: Object;
  
  public domainConfigNames: Object = {};

  public isEvaluationOpen: boolean = false;

  public isEvaluatorOrgGuid: boolean = false;

  public organizationsGuidNameMapObject: {[key: string]: string} = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evaluatorsService: EvaluatorsService,
  ) {
    this.isEvaluationOpen = JSON.parse(sessionStorage.getItem('isEvaluationOpen'));

    if(sessionStorage.getItem("evaluatorOrgGuid")){
      this.isEvaluatorOrgGuid = true;
    }else{
      this.isEvaluatorOrgGuid = false;
    }

    this.organizationsGuidNameMapObject = this.evaluatorsService.organizationsGuidNameMapObject;
  }


  public getOrgName(orgGuid: string): string {
    if(Object.entries(this.organizationsGuidNameMapObject).length == 0){
      this.organizationsGuidNameMapObject = this.evaluatorsService.organizationsGuidNameMapObject
    }

    let orgname = this.organizationsGuidNameMapObject[orgGuid];
    if (orgname !== undefined)
    return orgname.split("-")[1].trim();
  }

  public evaluateProposal(proposal: IProposal) {
    sessionStorage.setItem("proposalData", JSON.stringify(proposal));

    this.router.navigate([`${proposal.commentId}`], {
      relativeTo: this.route,
    });
  }
}
