import { Domain } from './domain';
import { PlanItem } from './plan-item';
import { Structure } from './structure';

export class Plan {
  id: number;
  name: string;
  structure: Structure;
  domain: Domain;
  items: PlanItem[];
}
