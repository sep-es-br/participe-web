import { CitizenSelfDeclarationSenderModel } from './CitizenSelfDeclarationSenderModel';

export class CitizenSenderModel {
  name: string;
  telephone?: string;
  receiveInformational?: boolean;
  typeAuthentication: string;
  cpf: string;
  contactEmail: string;
  confirmEmail: string;
  confirmPassword: string;
  password: string;
  resetPassword?: boolean;
  active?: boolean;
  selfDeclaration: CitizenSelfDeclarationSenderModel;
  sub?: string;
  isAuthority?: boolean;
  organization?: string;
  role?: string;
}

