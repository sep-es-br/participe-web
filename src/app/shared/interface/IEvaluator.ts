export interface IEvaluator {
  readonly id: number;
  organizationGuid: string;
  sectionsGuid: Array<string>;
  rolesGuid: Array<string>;
}

export interface IEvaluatorCreateForm extends Omit<IEvaluator, 'id'> {}

export interface IEvaluatorSearchFilter {
  searchOrganization: string;
  searchSection: string;
  searchRole: string;
}

export interface IEvaluatorNamesRequest {
  organizationsGuidList: Array<string>;
  sectionsGuidList: Array<string>;
  rolesGuidList: Array<string>;
}

export interface IEvaluatorNamesResponse {
  sectionsGuidNameMap: {[key: string]: string};
  rolesGuidNameMap: {[key: string]: string};
}
