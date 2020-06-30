import { IPerson } from './../interface/IPerson';
import { Plan } from './plan';
import { File } from './file';
import { LocalityType } from './locality-type';

export class Conference {
  id: number;
  name: string;
  plan: Plan;
  description: string;
  beginDate: Date;
  endDate: Date;
  titleAuthentication: string;
  subtitleAuthentication: string;
  titleParticipation: string;
  subtitleParticipation: string;
  titleRegionalization: string;
  subtitleRegionalization: string;
  fileParticipation: File;
  fileAuthentication: File;
  locality: LocalityType;
  hasAttend: Boolean;
  moderators: IPerson[];
}
