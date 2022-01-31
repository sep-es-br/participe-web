import { LocalityType } from './locality-type';
import { ModerationTreeViewItem } from './moderationTreeViewItem';

export class ModerationTreeView {
  id: number;
  name: string;
  localitytype: LocalityType;
  items: ModerationTreeViewItem[];
}
