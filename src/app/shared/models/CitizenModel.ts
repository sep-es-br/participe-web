import { CitizenAuthenticationModel } from './CitizenAuthenticationModel';

export class CitizenModel {
  id: number;
  name: string;
  email: string;
  autentication: CitizenAuthenticationModel[];
  cpf?: string;
  locality?: string;
  localityId?: number;
  localityName?: string;
  typeAuthentication: string;
  telephone?: string;
  receiveInformational: boolean;
  numberOfAcesses?: number;
  password?: string;
  active?: boolean;
  // view
  count: number;
}


