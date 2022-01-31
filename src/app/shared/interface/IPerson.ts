export interface IPerson {
  id?: number;
  name: string;
  contactEmail: string;
  cpf?: string;
  telephone?: string;
  defaultRole?: string;
  roles: string[];
}
