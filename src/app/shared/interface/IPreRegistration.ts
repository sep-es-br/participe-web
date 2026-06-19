import { IPerson } from './IPerson';
import { IMeetingDetail } from './IMeetingDetail';
import {IOptionOrganization} from './IOptionOrganization';

export interface  IPreRegistration {
  id?: number;
  person: IPerson;
  meeting: Partial<IMeetingDetail>;
  preRegistation: string;
  qrcode;

  organization: IOptionOrganization;
  role: string;
  localityId: number;
  email: string;
  authoritySub: string;

  isAuthority: boolean;
}


