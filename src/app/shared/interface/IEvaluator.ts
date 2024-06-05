export interface IEvaluator {
  readonly id: number;
  organizationGuid: string;
  sectionsGuid: Array<string>;
  rolesGuid: Array<string>;
}

export interface IEvaluatorCreateForm extends Omit<IEvaluator, 'id'> {}

export interface IEvaluatorNames {
  organizationsGuidList: Array<string>;
  sectionsGuidList: Array<string>;
  rolesGuidList: Array<string>;
}
