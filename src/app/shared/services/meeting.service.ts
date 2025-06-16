import { Inject, Injectable, Injector } from '@angular/core';
import { BaseService } from '../base/base.service';
import { Meeting } from '../models/Meeting';
import { MeetingFilterModel } from './../models/MeetingFilterModel';
import { PrepareHttpQuery } from './../util/Query.utils';
import { IResultPaginated } from '../interface/IResultPaginated';
import { IAttendee } from '../interface/IAttendee';
import { IQueryOptions } from '../interface/IQueryOptions';
import Common from '../util/Common';
import { IPerson } from '../interface/IPerson';
import { IResultPlanItemByConference } from '../interface/IResultPlanItemByConference';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IAttendeeAuthority } from '../interface/IAttendeeAuthority';
import { IHttpResult } from '../interface/IHttpResult';
import { ICheckedInAt } from '../interface/CheckedInAt.interface';

@Injectable()
export class MeetingService extends BaseService<Meeting> {

  constructor(
    @Inject(Injector) injector: Injector
  ) {
    super('meetings', injector);
  }

  getMeetingById(meetingId: number) {
    return this.http.get<Meeting>(`${this.urlBase}/?meetingId=${meetingId}`, { headers: Common.buildHeaders() }).toPromise();
  }

  getSearch(conferenceId: number, filter?: MeetingFilterModel, options?: IQueryOptions) {
    return this.http.get<IResultPaginated<Meeting>>(`${this.urlBase}/${conferenceId}${PrepareHttpQuery({ ...options, search: filter })}`,
      { headers: Common.buildHeaders() }).toPromise();
  }

  getAllMeetingByConferenceId(conferenceId: number) {
    return this.http.get<Meeting[]>(`${this.urlBase}/${conferenceId}`, { headers: Common.buildHeaders() }).toPromise();
  }

  getAllMeetingByConferenceCombo(conferenceId: number) {
    return this.http.get<IResultPaginated<Meeting>>(`${this.urlBase}/${conferenceId}`, { headers: Common.buildHeaders() }).toPromise();
  }

  getReceptionistByEmail(email: string) {
    return this.http.get<IPerson>(`${this.urlBase}/receptionistByEmail?email=${email}`, { headers: Common.buildHeaders() }).toPromise();
  }

  getPlanItemsTargetedByConference(conferenceId: number) {
    return this.http.get<IResultPlanItemByConference[]>(`${this.urlBase}/${conferenceId}/targeted-by/plan-items`,
    { headers: Common.buildHeaders() }).toPromise();
  }


  getListAuthority(idMeeting: number, query: IQueryOptions): Promise<IAttendeeAuthority[]> {
    return this.http.get<IAttendeeAuthority[]>(
      `${this.urlBase}/${idMeeting}/authorities${PrepareHttpQuery(query)}`,
      { headers: Common.buildHeaders() }
    ).toPromise();
  }


  getListPerson(idMeeting: number, query: IQueryOptions): Promise<IResultPaginated<IAttendee>> {
    return this.http.get<IResultPaginated<IAttendee>>(
      `${this.urlBase}/${idMeeting}/persons${PrepareHttpQuery(query)}`,
      { headers: Common.buildHeaders() }
    ).toPromise();
  }

  getListAttendees(idMeeting: number, query: IQueryOptions): Promise<IResultPaginated<IAttendee>> {
    return this.http.get<IResultPaginated<IAttendee>>(
      `${this.urlBase}/${idMeeting}/participants${PrepareHttpQuery(query)}`,
      { headers: Common.buildHeaders() }
    ).toPromise();
  }

  postCheckIn(payload: {
    meetingId: number;
    personId: number;
    timeZone: string;
    isAuthority?: boolean;
    organization?: any;
    role?: any;
  }): Promise<ICheckedInAt> {
    return this.http.post<ICheckedInAt>(
      `${this.urlBase}/checkIn`,
      payload,
      { headers: Common.buildHeaders() }
    ).toPromise();
  }

  editCheckIn(payload: {
    meetingId: number;
    personId: number;
    timeZone: string;
    isAuthority?: boolean;
    organization?: any;
    role?: any;
    toAnnounce?: boolean,
    announced?: boolean
  }): Promise<any> {
    return this.http.put(
      `${this.urlBase}/checkIn`,
      payload,
      { headers: Common.buildHeaders() }
    ).toPromise();
  }

  deleteCheckIn(meetingId: number, personId: number): Promise<any> {
    return this.http.delete(
      `${this.urlBase}/${meetingId}/remove-participation/${personId}`,
      { headers: Common.buildHeaders() }
    ).toPromise();
  }

  getTotalParticipantsInMeeting(idMeeting: number, query: IQueryOptions): Promise<{checkedIn: number, preRegistered: number}> {
    return this.http.get<{checkedIn: number, preRegistered: number}>(`${this.urlBase}/${idMeeting}/total${PrepareHttpQuery(query)}`, {headers: Common.buildHeaders()}).toPromise();
  }

  generateLinkPreRegistration(idMeeting: number): Promise<any> {
    return this.http.get<string>(`${this.urlBase}/${idMeeting}/generate-link-pre-registration`).toPromise();
  }

  generateQRCodeAutoCheckIn(idMeeting:number): Promise<any> {
    return new Promise<string>((resolve, reject) => {
      this.http.get(`${this.urlBase}/${idMeeting}/generate-qr-code-check-in`, { responseType: 'blob' })
        .subscribe(blob => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(blob);
        }, error => {
          reject(error);
        });
    });
  }
}
