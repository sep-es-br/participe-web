import { Conference } from '@app/shared/models/conference';
import { IChannel } from '../interface/IChannel';
import { IResultPlanItemByConference } from '../interface/IResultPlanItemByConference';
import { IPerson } from './../interface/IPerson';
import { Locality } from './locality';

export enum typeMeetingEnum {
  PRESENCIAL = 'PRESENCIAL',
  VIRTUAL = 'VIRTUAL',
  PRESENCIAL_VIRTUAL = 'PRESENCIAL_VIRTUAL'
}

export class Meeting {
    id: number;
    name: string;
    address: string;
    place: string;
    localityPlace: Locality;
    localityCovers: Locality[] | number[];
    conference: Conference | number;
    description: string;
    beginDate: Date | string;
    endDate: Date | string;
    receptionists: IPerson[] | number[];
    participants: IPerson[];
    type: string = String.apply(typeMeetingEnum); // PRESENCIAL || VIRTUAL || PRESENCIAL_VIRTUAL
    segmentations: IResultPlanItemByConference[] | number[];
    channels?: IChannel[];
    typeMeetingEnum?: string;
    showChannels?: string;
}
