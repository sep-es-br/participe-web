import { Locality } from '@app/shared/models/locality';

export interface IResultLocalitysByConference {
  regionalizable: string;
  title: string;
  subtitle: string;
  nameType?: string;
  localities: Locality[];
}
