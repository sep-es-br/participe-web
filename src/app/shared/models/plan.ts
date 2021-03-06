import { Domain } from './domain';
import { PlanItem } from './plan-item';
import { Structure } from './structure';
import { LocalityType } from './locality-type';


export class Plan {
  id: number;
  name: string;
  structure: Structure;
  domain: Domain;
  localitytype: LocalityType;
  items: PlanItem[];
}
