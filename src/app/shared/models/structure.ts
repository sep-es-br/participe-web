import { StructureItem } from './structure-item';

export class Structure {
  id: number;
  name: string;
  items: StructureItem[];
  level: number;
  hasLocalityWithItem: boolean;
  regionalization: boolean;
  hasPlan: boolean;
}
