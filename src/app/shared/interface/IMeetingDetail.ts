import { IChannel } from './IChannel';
import { IConference } from './IConference';
import { ILocality } from './ILocality';

export interface IMeetingDetail {
    id: number;
    name: string;
    address?: string;
    place?: string;
    localityPlace?: ILocality;
    localityCovers?: ILocality[];
    conference: IConference;
    description: string;
    beginDate: string;
    endDate: string;

    typeMeetingEnum: string; // PRESENCIAL || VIRTUAL || PRESENCIAL_VIRTUAL
    channels?: IChannel[];
    linkGoogleMaps?: string;
    linkWaze?: string;
    hasNextMeeting?: boolean;
    hasPreviousMeeting?: boolean;
}
