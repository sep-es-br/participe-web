import { PlanItem } from './planItem';

export class ModerationPlanItem {
  conferenceId: number;
  conferenceDescription: string;
  structureItemId: number;
  structureItemName: string;
  structureItemChildrenId: number;
  structureItemChildrenName: string;
  structureRegionalization: boolean;
  planItems: PlanItem[];

  constructor() {
    this.planItems = new Array<PlanItem>();
  }
}
