export interface IProposal {
    readonly id: number;
    evaluationStatus: boolean;
    localityName: string;
    planItemName: string;
    planItemAreaName: string;
    description: string;
    evaluatorsNamesList: Array<string>;
}

export interface IProposalEvaluation {
    readonly id: number;
    includedInNextYearLOA: boolean;
    reason?: string;
    budgetUnitId?: string;
    budgetUnitName?: string;
    budgetActionId?: string;
    budgetActionName?: string;
    budgetPlanId?: string;
    budgetPlanName?: string;
}

export interface IProposalEvaluationCreateForm extends Omit<IProposalEvaluation, 'id'> {
    personId: number;
    proposalId: number;
}