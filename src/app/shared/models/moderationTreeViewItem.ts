import { ModerationTreeViewStructureItem } from './moderationTreeViewStructureItem';

export class ModerationTreeViewItem {
  id: number;
  name: string;
  structureItem: ModerationTreeViewStructureItem;
  children: ModerationTreeViewItem[];
}
