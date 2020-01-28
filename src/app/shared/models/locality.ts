import { LocalityType } from './locality-type';

export class Locality {
  id: number;
  name: string;
  type: LocalityType;
  parent: Locality;
  children: Locality[];
}
