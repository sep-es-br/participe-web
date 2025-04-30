export interface IProposal {
  readonly commentId: number;
  evaluationStatus: boolean;
  localityName: string;
  planItemName: string;
  planItemAreaName: string;
  description: string;
  evaluatorOrgsNameAndLoaIncludedList?: Array<IEvaluatorOrgsNameAndLoaIncludedList>;
  evaluatorName?: string;
}

export interface IEvaluatorOrgsNameAndLoaIncludedList{
  evaluatorOrgsName: string
  loaIncluded: boolean
}

export interface IProposalEvaluation {
  readonly id: number;
  includedInNextYearLOA: boolean;
  reason?: string;
  reasonDetail?: string;
  budgetUnitId?: string;
  budgetUnitName?: string;
  budgetActionId?: string;
  budgetActionName?: string;
  budgetPlan?: string;
  representing: string;
}

export interface IProposalEvaluationCreateForm
  extends Omit<IProposalEvaluation, "id" | "createdAt" | "updatedAt"> {
  personId: number;
  proposalId: number;
}

export interface IProposalEvaluationSearchFilter {
  evaluationStatus: boolean;
  localityId: number;
  planItemAreaId: number;
  planItemId: number;
  organizationGuid: string;
  loaIncluded: boolean;
  commentText: string;
}

export interface IBudgetUnit {
  budgetUnitId: string;
  budgetUnitName: string;
}

export interface IBudgetAction {
  budgetActionId: string;
  budgetActionName: string;
}

export interface IBudgetOptions {
  budgetUnitId: string;
  budgetUnitName: string;
  budgetActions: Array<IBudgetAction>;
}
