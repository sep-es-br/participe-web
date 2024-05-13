export interface IEvaluationSection {
  readonly id: number;
  organizationGuid: string;
  sectionsGuid: string;
  serversGuid: string;
}

export interface IEvaluationSectionCreate extends Omit<IEvaluationSection, 'id'> {};
