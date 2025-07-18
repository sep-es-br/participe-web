import {
  IBudgetAction,
  IBudgetPlan,
  IBudgetUnit,
  IProposalEvaluation,
  IProposalEvaluationCreateForm,
} from "../interface/IProposal";

export class ProposalEvaluationModel implements IProposalEvaluation {
  private readonly _id: number;
  public approved: boolean;
  public reason?: string;
  public reasonDetail?: string;
  public budgetUnitId?: string;
  public budgetUnitName?: string;
  public budgetActionId?: string;
  public budgetActionName?: string;
  public budgetPlan?: IBudgetPlan[];
  public evaluatorName: string;
  public representing: string;
  public haveCost: boolean;
  public costType: string;
  public newRequest: boolean;

  constructor(proposalEvaluation: IProposalEvaluation) {
    this._id = proposalEvaluation.id;
    this.approved = proposalEvaluation.approved;
    if (proposalEvaluation.approved) {
      this.budgetUnitId = proposalEvaluation.budgetUnitId;
      this.budgetUnitName = proposalEvaluation.budgetUnitName;
      this.budgetActionId = proposalEvaluation.budgetActionId;
      this.budgetActionName = proposalEvaluation.budgetActionName;
      this.budgetPlan = proposalEvaluation.budgetPlan;
      this.haveCost = proposalEvaluation.haveCost;
      this.costType = proposalEvaluation.costType;
      this.newRequest = proposalEvaluation.newRequest;
    } else {
      this.reason = proposalEvaluation.reason; 
    }
    this.reasonDetail = proposalEvaluation.reasonDetail;
    this.representing = proposalEvaluation.representing;
    this.evaluatorName = proposalEvaluation.evaluatorName;
  }

  public get id(): number {
    return this._id;
  }

  public get budgetUnitControlValue(): Array<IBudgetUnit> | null {
    if (!this.budgetUnitId || !this.budgetUnitName) {
      return null;
    }

    const budgetUnitIdList = this.budgetUnitId.split(";");
    const budgetUnitNameList = this.budgetUnitName.split(";");

    let budgetUnitControlValueArray: Array<IBudgetUnit> = [];

    for (let i = 0; i < budgetUnitIdList.length; i++) {
      const budgetUnit: IBudgetUnit = {
        budgetUnitId: budgetUnitIdList[i],
        budgetUnitName: budgetUnitNameList[i],
      };
      budgetUnitControlValueArray.push(budgetUnit);
    }

    return budgetUnitControlValueArray;
  }

  public get budgetActionControlValue(): Array<IBudgetAction> | null {
    if (!this.budgetActionId || !this.budgetActionName) {
      return null;
    }

    const budgetActionIdList = this.budgetActionId.split(";");
    const budgetActionNameList = this.budgetActionName.split(";");

    let budgetActionControlValueArray: Array<IBudgetAction> = [];

    for (let i = 0; i < budgetActionIdList.length; i++) {
      const budgetAction: IBudgetAction = {
        budgetActionId: budgetActionIdList[i],
        budgetActionName: budgetActionNameList[i],
      };
      budgetActionControlValueArray.push(budgetAction);
    }

    return budgetActionControlValueArray;
  }
}

export class ProposalEvaluationCreateFormModel
  implements IProposalEvaluationCreateForm
{
  public personId: number;
  public proposalId: number;
  public approved: boolean;
  public reason?: string;
  public reasonDetail?: string;
  public budgetUnitId?: string;
  public budgetUnitName?: string;
  public budgetActionId?: string;
  public budgetActionName?: string;
  public budgetPlan?: IBudgetPlan[];
  public representing: string;
  public haveCost : boolean;
  public costType: string;
  public newRequest : boolean;

  constructor(
    formValue: any,
    personId: number,
    proposalId: number,
    representing: string,
    public representingOrgTag: string,
    public representingOrgName: string,
    public evaluatorName: string
  ) {
    this.approved = formValue.approved;
    if (formValue.approved) {
      this.budgetUnitId = this.getBudgetUnitId(formValue.budgetUnit);
      this.budgetUnitName = this.getBudgetUnitName(formValue.budgetUnit);
      this.budgetActionId = this.getBudgetActionId(formValue.budgetAction);
      this.budgetActionName = this.getBudgetActionName(formValue.budgetAction);
      this.budgetPlan = formValue.budgetPlan;
      this.haveCost = !!formValue.costType;
      this.costType = formValue.costType;
      this.newRequest = formValue.newRequest;
    } else {
      this.reason = formValue.reason;
    }
    this.reasonDetail = formValue.reasonDetail;
    this.personId = personId;
    this.proposalId = proposalId;
    this.representing = representing;
  }

  private getBudgetUnitId(value: Array<IBudgetUnit>): string {
    return value.map((item) => item.budgetUnitId).join(";");
  }

  private getBudgetUnitName(value: Array<IBudgetUnit>): string {
    return value.map((item) => item.budgetUnitName).join(";");
  }

  private getBudgetActionId(value: Array<IBudgetAction>): string {
    return value?.map((item) => item.budgetActionId).join(";");
  }

  private getBudgetActionName(value: Array<IBudgetAction>): string {
    return value?.map((item) => item.budgetActionName).join(";");
  }
}
