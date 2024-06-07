interface IEvaluatorData {
    guid: string;
    name: string;
}

export interface IEvaluatorOrganization extends IEvaluatorData {}

export interface IEvaluatorSection extends IEvaluatorData {}

export interface IEvaluatorRole extends IEvaluatorData {
    lotacao: string;
}