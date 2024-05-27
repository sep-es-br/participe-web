import { IEvaluator, IEvaluatorCreateForm } from "../interface/IEvaluator";
import { IEvaluatorRole } from "../interface/IEvaluatorData";

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

  constructor(formValue: {
    organizationGuid: string;
    sectionsGuid: Array<string>;
    rolesGuid: Array<IEvaluatorRole>;
  }) {
    this.organizationGuid = formValue.organizationGuid;
    this.sectionsGuid = formValue.sectionsGuid;
    this.rolesGuid = this.treatRolesGuid(formValue.rolesGuid);
  }

  private treatRolesGuid(formRolesGuid: Array<IEvaluatorRole>): Array<string> {
    return formRolesGuid.map((role) => role.guid ? `${role.guid}:${role.lotacao}` : 'all')
  }
}
