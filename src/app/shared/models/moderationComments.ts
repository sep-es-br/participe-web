import { CommentStructure } from './CommentStructure';

export interface ModerationComments {
  commentId: number;
  status: string;
  text: string;
  time: string;
  type: string;
  localityName: string;
  localityId: number;
  planItemId: number;
  planItemName: string;
  citizenName: string;
  moderated: boolean;
  moderatorName: string;
  commentStructure: CommentStructure[];
  from: string;
  moderateTime: string;
  moderatorId: number;
  disableModerate: boolean;
  structureItemId: number;
  structureItemName: string;
  structureRegionalization: boolean;
  areaEstrategicaId: number;
  nameAreaEstrategica: string;
  conferenceId: number;
}

