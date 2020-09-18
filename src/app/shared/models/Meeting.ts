import { Conference } from '@app/shared/models/conference';
import { IPerson } from './../interface/IPerson';
import { Locality } from './locality';

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
}
