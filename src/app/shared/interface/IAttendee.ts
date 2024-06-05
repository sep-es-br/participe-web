import { List } from "lodash";

export interface IAttendee {
  personId: number;
  name: string;
  email: string;
  telephone?: string;
  password?: string;
  locality?: string;
  superLocalityId?: number;
  superLocality?: string;
  regionalizable?: string;
  checkedIn: boolean;
  checkedInDate?: string;
  preRegistered?: boolean;
  preRegisteredDate?: string;
  checkingIn?: boolean;
  authName?: List<string>;
}
