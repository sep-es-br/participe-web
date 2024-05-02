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
  // @Input("proposalData") proposal: IProposal;
  @Input("proposalData") proposal: any; // por enquanto

  constructor(private route: ActivatedRoute, private router: Router) {}

  evaluateProposal(proposalId: number){
    this.router.navigate([`${proposalId}`], {
      relativeTo: this.route,
    })
  }
}
