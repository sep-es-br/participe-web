import {
  IProposalEvaluation,
  IProposalEvaluationCreateForm,
} from "../interface/IProposal";

export class ProposalEvaluationModel implements IProposalEvaluation {
  private readonly _id: number;
  public includedInNextYearLOA: boolean;
  public reason?: string;
  public budgetUnitId?: string;
  public budgetUnitName?: string;
  public budgetActionId?: string;
  public budgetActionName?: string;
  public budgetPlan?: string;
  public representing: string;
  public createdAt: string;
  public updatedAt: string;

  constructor(proposalEvaluation: IProposalEvaluation) {
    this._id = proposalEvaluation.id;
    this.includedInNextYearLOA = proposalEvaluation.includedInNextYearLOA;
    if (proposalEvaluation.includedInNextYearLOA) {
      this.budgetUnitId = proposalEvaluation.budgetUnitId;
      this.budgetUnitName = proposalEvaluation.budgetUnitName;
      this.budgetActionId = proposalEvaluation.budgetActionId;
      this.budgetActionName = proposalEvaluation.budgetActionName;
      this.budgetPlan = proposalEvaluation.budgetPlan;
    } else {
      this.reason = proposalEvaluation.reason;
    }

    this.representing = proposalEvaluation.representing;
    this.createdAt = proposalEvaluation.createdAt;
    this.updatedAt = proposalEvaluation.updatedAt;
  }

  public get id(): number {
    return this._id;
  }

  public get budgetUnitControlValue(): string | null {
    if (!this.budgetUnitId || !this.budgetUnitName) {
      return null;
    }

    return this.budgetUnitId + " - " + this.budgetUnitName;
  }

  public get budgetActionControlValue(): Array<string> | null {
    if (!this.budgetActionId || !this.budgetActionName) {
      return null;
    }

    const budgetActionIdList = this.budgetActionId.split(";");
    const budgetActionNameList = this.budgetActionName.split(";");

    let budgetActionControlValueArray = [];

    for (let i = 0; i < budgetActionIdList.length; i++) {
      const value = budgetActionIdList[i] + " - " + budgetActionNameList[i];
      budgetActionControlValueArray.push(value);
    }

    return budgetActionControlValueArray;
  }
}

export class ProposalEvaluationCreateFormModel
  implements IProposalEvaluationCreateForm
{
  public personId: number;
  public proposalId: number;
  public includedInNextYearLOA: boolean;
  public reason?: string;
  public budgetUnitId?: string;
  public budgetUnitName?: string;
  public budgetActionId?: string;
  public budgetActionName?: string;
  public budgetPlan?: string;
  public representing: string;

  constructor(formValue: any) {
    this.includedInNextYearLOA = formValue.includedInNextYearLOA;
    if (formValue.includedInNextYearLOA) {
      this.budgetUnitId = this.getBudgetUnitId(formValue.budgetUnit);
      this.budgetUnitName = this.getBudgetUnitName(formValue.budgetUnit);
      this.budgetActionId = this.getBudgetActionId(formValue.budgetAction);
      this.budgetActionName = this.getBudgetActionName(formValue.budgetAction);
      this.budgetPlan = formValue.budgetPlan;
    } else {
      this.reason = formValue.reason;
    }
    this.representing = formValue.representing;
  }

  private getBudgetUnitId(value: string): string | null {
    const budgetUnitId = value != null ? value.split("-")[0] : null;
    return budgetUnitId;
  }

  private getBudgetUnitName(value: string): string | null {
    const budgetUnitName = value != null ? value.split("-")[1] : null;
    return budgetUnitName;
  }

  private getBudgetActionId(value: Array<string>): string | null {
    const budgetActionId =
      value != null
        ? value.map((entry) => entry.split("-")[0]).join(";")
        : null;
    return budgetActionId;
  }

  private getBudgetActionName(value: Array<string>): string | null {
    const budgetActionName =
      value != null
        ? value.map((entry) => entry.split("-")[1]).join(";")
        : null;
    return budgetActionName;
  }
}
