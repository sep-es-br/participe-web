import { Meeting } from '../models/Meeting';

export interface IConferenceWithMeetings {
  id: number;
  name: string;
  description: string;
  meeting: Meeting[];
  beginDate: string;
  endDate: string;
}
