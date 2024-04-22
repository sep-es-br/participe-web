import { Component, Input } from "@angular/core";
import { IProposal } from "@app/shared/interface/IProposal";

@Component({
  selector: "app-proposal",
  standalone: false,
  templateUrl: "./proposal.component.html",
  styleUrl: "./proposal.component.scss",
})
export class ProposalComponent {
  @Input("proposalData") proposal: IProposal;

  constructor() {}
}
