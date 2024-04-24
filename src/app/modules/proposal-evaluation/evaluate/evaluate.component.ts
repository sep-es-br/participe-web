import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { IProposal } from "@app/shared/interface/IProposal";

import { ProposalEvaluationService } from "@app/shared/services/proposal-evaluation.service";

@Component({
  selector: "app-evaluate",
  standalone: false,
  templateUrl: "./evaluate.component.html",
  styleUrl: "./evaluate.component.scss",
})
export class EvaluateComponent implements OnInit {
  proposalId: number;
  proposal: IProposal;
  proposalEvaluationForm: FormGroup;

  budgetUnitOptions: Array<string>;
  budgetActionOptions: Array<string>;
  budgetPlanOptions: Array<string>;
  reasonOptions: Array<string>;

  constructor(
    private route: ActivatedRoute,
    private proposalEvaluationService: ProposalEvaluationService
  ) {
    this.proposalId = Number(this.route.snapshot.params["proposalId"]);
  }

  ngOnInit(): void {
    this.proposal = this.proposalEvaluationService
      .getProposalListForEvaluation()
      .find((proposal) => proposal.id == this.proposalId);
    // console.log(this.proposal);

    this.populateOptionsLists();

    !!this.proposal
      ? this.initProposalForm(this.proposal)
      : this.initProposalForm();

    // console.log(this.proposalEvaluationForm);
  }

  populateOptionsLists() {
    this.budgetUnitOptions =
      this.proposalEvaluationService.populateBudgetUnitOptions();
    this.budgetActionOptions =
      this.proposalEvaluationService.populateBudgetActionOptions();
    this.budgetPlanOptions =
      this.proposalEvaluationService.populateBudgetPlanOptions();
    this.reasonOptions = this.proposalEvaluationService.populateReasonOptions();
  }

  initProposalForm(proposal?: IProposal) {
    this.proposalEvaluationForm = new FormGroup({
      status: new FormControl(proposal?.status ?? "teste"),
      microrregion: new FormControl(proposal?.microrregion ?? "teste"),
      descriptionText: new FormControl(proposal?.descriptionText ?? "teste"),
      themeArea: new FormControl(proposal?.themeArea ?? "teste"),
      budgetCategory: new FormControl(proposal?.budgetCategory ?? "teste"),
      entities: new FormControl(proposal?.entities ?? []),
      loaIncluded: new FormControl(null),
      budgetUnit: new FormControl(null),
      budgetAction: new FormControl(null),
      budgetPlan: new FormControl(null),
      reason: new FormControl(null),
    });
  }

  public get formStatus(): string {
    return this.proposalEvaluationForm.get("status").value;
  }

  public get formMicrorregion(): string {
    return this.proposalEvaluationForm.get("microrregion").value;
  }

  public get formDescriptionText(): string {
    return this.proposalEvaluationForm.get("descriptionText").value;
  }

  public get formThemeArea(): string {
    return this.proposalEvaluationForm.get("themeArea").value;
  }

  public get formBudgetCategory(): string {
    return this.proposalEvaluationForm.get("budgetCategory").value;
  }

  public get formEntities(): Array<string> {
    return this.proposalEvaluationForm.get("entities").value;
  }

  public get formLoaIncluded(): boolean {
    return this.proposalEvaluationForm.get("loaIncluded").value;
  }
}

// status: string;
//     microrregion: string;
//     descriptionText: string;
//     themeArea: string;
//     budgetCategory: string;
//     entities: string[];
