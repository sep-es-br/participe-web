
export interface IConference {
  id: number;
  name?: string;
  plan?: {
    id: number;
    name: string;
    structure: IStructure;
    domain: IDomain;
    localitytype: ILocalityType;
  };
  localityType?: ILocalityType;
  externalLinksMenuLabel: string;
  externalLinks: IExternalLinks[];
  displayStatusConference?: string;
}

export class IStructure {
  id: number;
  name: string;
  level: number;
  regionalization: boolean;
  hasPlan: boolean;
}

export class IDomain {
  id: number;
  name: string;
}

export class ILocalityType {
  id: number;
  name: string;
}

export interface IExternalLinks {
  id?: number;
  label: string;
  url: string;
}


