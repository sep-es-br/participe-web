import { IProposalEvaluation, IProposalEvaluationCreateForm } from "../interface/IProposal";

export class ProposalEvaluationModel implements IProposalEvaluation {
    private readonly _id: number;
    public includedInNextYearLOA: boolean;
    public reason?: string;
    public budgetUnitId?: string;
    public budgetUnitName?: string;
    public budgetActionId?: string;
    public budgetActionName?: string;
    public budgetPlanId?: string;
    public budgetPlanName?: string;

    constructor(proposalEvaluation: IProposalEvaluation) {
        this._id = proposalEvaluation.id;
        this.includedInNextYearLOA = proposalEvaluation.includedInNextYearLOA;
        this.reason = proposalEvaluation.reason;
        this.budgetUnitId = proposalEvaluation.budgetUnitId;
        this.budgetUnitName = proposalEvaluation.budgetUnitName;
        this.budgetActionId = proposalEvaluation.budgetActionId;
        this.budgetActionName = proposalEvaluation.budgetActionName;
        this.budgetPlanId = proposalEvaluation.budgetPlanId;
        this.budgetPlanName = proposalEvaluation.budgetPlanName;
    }

    public get id(): number {
        return this._id
    }
}

export class ProposalEvaluationCreateFormModel implements IProposalEvaluationCreateForm {
    public personId: number;
    public proposalId: number;
    public includedInNextYearLOA: boolean;
    public reason?: string;
    public budgetUnitId?: string;
    public budgetUnitName?: string;
    public budgetActionId?: string;
    public budgetActionName?: string;
    public budgetPlanId?: string;
    public budgetPlanName?: string;

    constructor(formValue: any){
        this.includedInNextYearLOA = formValue.includedInNextYearLOA;
        this.reason = formValue.reason;
        // this.budgetUnitId = formValue.budgetUnitId
        // this.budgetUnitName = formValue.budgetUnitName
        // this.budgetActionId = formValue.budgetActionId
        // this.budgetActionName = formValue.budgetActionName
        // this.budgetPlanId = formValue.budgetPlanId
        // this.budgetPlanName = formValue.budgetPlanName
    }
    
}