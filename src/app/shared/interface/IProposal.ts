export interface IProposal {
    readonly id: number;
    evaluationStatus: boolean;
    localityName: string;
    planItemName: string;
    planItemAreaName: string;
    description: string;
    evaluatorOrgsNameList: Array<string>;
    evaluatorName?: string;
}

export interface IProposalEvaluation {
    readonly id: number;
    includedInNextYearLOA: boolean;
    reason?: string;
    budgetUnitId?: string;
    budgetUnitName?: string;
    budgetActionId?: string;
    budgetActionName?: string;
    budgetPlan?: string;
    representing: string;
    createdAt: string;
    updatedAt: string;
}

export interface IProposalEvaluationCreateForm extends Omit<IProposalEvaluation, 'id' | 'createdAt' | 'updatedAt'> {
    personId: number;
    proposalId: number;
}