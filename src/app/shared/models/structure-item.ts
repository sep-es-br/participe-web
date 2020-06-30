import { Structure } from './structure';

export class StructureItem {
  id: number;
  name: string;
  logo: boolean;
  locality: boolean;
  votes: boolean;
  comments: boolean;
  title: string;
  subtitle: string;
  link: string;
  structure: Structure;
  parent: StructureItem;
  children: StructureItem[];
}
