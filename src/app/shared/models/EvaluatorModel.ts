import { IEvaluator, IEvaluatorCreateForm } from "../interface/IEvaluator";
import { IEvaluatorOrganization, IEvaluatorRole, IEvaluatorSection } from "../interface/IEvaluatorData";

export class EvaluatorModel implements IEvaluator {
  private readonly _id: number;
  public organizationGuid: string;
  public sectionsGuid: Array<string>;
  public rolesGuid: Array<string>;

  constructor(evaluatorData: IEvaluator) {
    this._id = evaluatorData.id;
    this.organizationGuid = evaluatorData.organizationGuid;
    this.sectionsGuid = evaluatorData.sectionsGuid;
    this.rolesGuid = evaluatorData.rolesGuid;
  }

  public get id(): number {
    return this._id;
  }
}

export class EvaluatorCreateFormModel implements IEvaluatorCreateForm {
  public organizationGuid: string;
  public sectionsGuid: Array<string>;
  public rolesGuid: Array<string>;

  public organization: IEvaluatorOrganization;
  public sections: Array<IEvaluatorSection>;
  public roles: Array<IEvaluatorRole>;

  constructor(formValue: {
    organization: IEvaluatorOrganization;
    sections: Array<IEvaluatorSection>;
    roles: Array<IEvaluatorRole>;
  }) {
    this.organization = formValue.organization;
    this.sections = formValue.sections;

    this.roles = formValue.roles.length === 0 
      ? [{ guid: null, name: "Todos", lotacao: null }] 
      : formValue.roles;
  }
}
