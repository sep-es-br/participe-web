import { ModerationLocalityItem } from './moderationLocalityItem';

export class ModerationLocatliy {
  regionalizable: string;
  localities: ModerationLocalityItem[];

  constructor() {
    this.localities = new Array<ModerationLocalityItem>();

  }
}

