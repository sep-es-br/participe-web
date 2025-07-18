export interface IProposal {
  readonly commentId: number;
  evaluationStatus: boolean;
  localityName: string;
  microrregionName: string;
  planItemName: string;
  planItemAreaName: string;
  description: string;
  evaluatorOrgsNameAndApprovedList?: Array<IEvaluatorOrgsNameAndApprovedList>;
  evaluatorName?: string;
}

export interface IEvaluatorOrgsNameAndApprovedList{
  evaluatorOrgsName: string
  approved: boolean
}

export interface IProposalEvaluation {
  readonly id: number;
  approved: boolean;
  reason?: string;
  reasonDetail?: string;
  budgetUnitId?: string;
  budgetUnitName?: string;
  budgetActionId?: string;
  budgetActionName?: string;
  budgetPlan?: IBudgetPlan[];
  representing: string;
  evaluatorName: string;
  haveCost: boolean;
  costType: string;
  newRequest: boolean;
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
  approved: boolean;
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

export interface IBudgetPlan {
  budgetPlanId: string;
  budgetPlanName: string;
}

export interface IBudgetOptions {
  budgetUnitId: string;
  budgetUnitName: string;
  budgetActions: Array<IBudgetAction>;
}
