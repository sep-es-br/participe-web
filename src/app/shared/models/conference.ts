import { Plan } from './plan';

export class Conference {
  id: number;
  name: string;
  plan: Plan;
  description: string;
  beginDate: Date;
  endDate: Date;
}
