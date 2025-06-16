import { Meeting } from "../models/Meeting";
import { IPerson } from "./IPerson";

export interface ICheckedInAt {
    person: IPerson;
    meeting: Meeting;
    time: string;
    isAuthority: boolean;
    toAnnounce: boolean;
    isAnnounced: boolean;
    organization: string;
    role: string;
}