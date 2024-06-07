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

  postCheckIn(meetingId: number, personId: number, timeZone: string): Promise<any> {
    return this.http.post(
      `${this.urlBase}/checkIn`,
      {
        meetingId,
        personId,
        timeZone
      },
      { headers: Common.buildHeaders() }
    ).toPromise();
  }

  deleteCheckIn(meetingId: number, personId: number): Promise<any> {
    return this.http.delete(
      `${this.urlBase}/${meetingId}/remove-participation/${personId}`,
      { headers: Common.buildHeaders() }
    ).toPromise();
  }

  getTotalAttendeesByMeeting(idMeeting: number): Promise<number> {
    return this.http.get<number>(`${this.urlBase}/${idMeeting}/participants/total`).toPromise();
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
