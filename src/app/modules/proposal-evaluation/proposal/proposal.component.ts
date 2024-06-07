import { Component, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
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

  constructor(private route: ActivatedRoute, private router: Router) {
    this.domainConfigNames = JSON.parse(sessionStorage.getItem("domainConfigNames"))
  }

  evaluateProposal(proposal: IProposal){
    sessionStorage.setItem("proposalData", JSON.stringify(proposal));

    this.router.navigate([`${proposal.id}`], {
      relativeTo: this.route,
    })
  }
}