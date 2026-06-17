import { List } from "lodash";
import {IOptionOrganization} from '@app/shared/interface/IOptionOrganization';

export interface IAttendee {
  personId: number;
  checkInId: number;
  name: string;
  email: string;
  telephone?: string;
  password?: string;
  locality?: string;
  localityId?: number;
  superLocalityId?: number;
  superLocality?: string;
  regionalizable?: string;
  checkedIn: boolean;
  checkedInDate?: string;
  preRegistered?: boolean;
  preRegisteredDate?: string;
  checkingIn?: boolean;
  authName?: List<string>;
  sub?: string;
  isAuthority?: boolean;
  isTeam?: boolean;
  isAnnounced?: boolean;
  toAnnounce?: boolean;
  organization?: IOptionOrganization;
  role?: string;
}

