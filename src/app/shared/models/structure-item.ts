import { Structure } from './structure';

export class StructureItem {
  id: number;
  name: string;
  logo: boolean;
  locality: boolean;
  votes: boolean;
  comments: boolean;
  structure: Structure;
  parent: StructureItem;
  children: StructureItem[];
}
