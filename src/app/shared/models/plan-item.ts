import { Locality } from './locality';
import { Plan } from './plan';
import { File } from './file';
import { StructureItem } from './structure-item';

export class PlanItem {
  id: number;
  name: string;
  description: string;
  plan: Plan;
  structureItem: StructureItem;
  parent: PlanItem;
  file: File;
  children: PlanItem[];
  localities: Locality[];
  localitiesIds: number[];
}
