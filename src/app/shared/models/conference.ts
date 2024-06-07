import {IPerson} from './../interface/IPerson';
import {Plan} from './plan';
import {File} from './file';
import {LocalityType} from './locality-type';
import {IHowItWorkStep} from '../interface/IHowItWorkStep';
import {IExternalLinks} from '../interface/IExternalLinks';
import {Meeting} from './Meeting';
import { customProperties } from './CustomProperties';

export class Conference {
  id: number;
  name: string;
  plan: Plan;
  description: string;
  beginDate: string;
  endDate: string;
  beginDateComplet?: Date;
  endDateComplet: Date;
  titleAuthentication: string;
  subtitleAuthentication: string;
  titleParticipation: string;
  subtitleParticipation: string;
  titleRegionalization: string;
  subtitleRegionalization: string;
  fileParticipation: File;
  fileAuthentication: File;
  fileFooter: File;
  locality: LocalityType;
  hasAttend: boolean;
  moderators: IPerson[];
  isActive: boolean;
  serverName: string;
  defaultServerConference: boolean;
  showStatistics: Boolean;
  showCalendar: Boolean;
  showStatisticsPanel: Boolean;
  showProposalsPanel: Boolean;
  showExternalLinks: Boolean;
  segmentation: boolean;
  targetedByItems: number[];
  displayMode: string;  // AUTOMATIC || MANUAL
  displayStatusConference: string; // PRE_OPENING || OPEN || POST_CLOSURE
  preOpeningText: string;
  postClosureText: string;
  howItWork: IHowItWorkStep[];
  externalLinksMenuLabel: string;
  externalLinks: IExternalLinks[];
  backgroundImages: File[];
  calendarImages: File[];
  meeting?: Meeting[];
  researchConfiguration: {
    beginDate: string;
    endDate: string;
    displayModeResearch: string; // AUTOMATIC || MANUAL
    researchDisplayStatus: string; // INACTIVE || ACTIVE
    researchLink: string;
    estimatedTimeResearch: string;
  };
  localityType?: LocalityType;
  customProperties?:customProperties;
  evaluationConfiguration:{
    beginDate?: string;
    endDate?: string;
    displayMode?: string;
    evaluationDisplayStatus?: string;
  }
}
