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
import { AuthService } from './auth.service';

@Injectable()
export class MeetingService extends BaseService<Meeting> {
  authSrv: AuthService;
  constructor(
    @Inject(Injector) injector: Injector
  ) {
    super('meetings', injector);
    this.authSrv = injector.get(AuthService);
  }

  async getMeetingById(meetingId: number) {
    return this.http.get<Meeting>(`${this.urlBase}/?meetingId=${meetingId}`, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }

  async getSearch(conferenceId: number, filter?: MeetingFilterModel, options?: IQueryOptions) {
    return this.http.get<IResultPaginated<Meeting>>(`${this.urlBase}/${conferenceId}${PrepareHttpQuery({ ...options, search: filter })}`,
      { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }

  async getAllMeetingByConferenceId(conferenceId: number) {
    return this.http.get<Meeting[]>(`${this.urlBase}/${conferenceId}`, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }

  async getAllMeetingByConferenceCombo(conferenceId: number) {
    return this.http.get<IResultPaginated<Meeting>>(`${this.urlBase}/${conferenceId}`, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }

  async getReceptionistByEmail(email: string) {
    return this.http.get<IPerson>(`${this.urlBase}/receptionistByEmail?email=${email}`, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }

  async getPlanItemsTargetedByConference(conferenceId: number) {
    return this.http.get<IResultPlanItemByConference[]>(`${this.urlBase}/${conferenceId}/targeted-by/plan-items`,
    { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }


  async getListPerson(idMeeting: number, query: IQueryOptions): Promise<IResultPaginated<IAttendee>> {
    return this.http.get<IResultPaginated<IAttendee>>(
      `${this.urlBase}/${idMeeting}/persons${PrepareHttpQuery(query)}`,
      { headers: await Common.buildHeaders(this.authSrv) }
    ).toPromise();
  }

  async getListAttendees(idMeeting: number, query: IQueryOptions): Promise<IResultPaginated<IAttendee>> {
    return this.http.get<IResultPaginated<IAttendee>>(
      `${this.urlBase}/${idMeeting}/participants${PrepareHttpQuery(query)}`,
      { headers: await Common.buildHeaders(this.authSrv) }
    ).toPromise();
  }

  async postCheckIn(meetingId: number, personId: number, timeZone: string): Promise<any> {
    return this.http.post(
      `${this.urlBase}/checkIn`,
      {
        meetingId,
        personId,
        timeZone
      },
      { headers: await Common.buildHeaders(this.authSrv) }
    ).toPromise();
  }

  async deleteCheckIn(meetingId: number, personId: number): Promise<any> {
    return this.http.delete(
      `${this.urlBase}/${meetingId}/remove-participation/${personId}`,
      { headers: await Common.buildHeaders(this.authSrv) }
    ).toPromise();
  }

  getTotalAttendeesByMeeting(idMeeting: number): Promise<number> {
    return this.http.get<number>(`${this.urlBase}/${idMeeting}/participants/total`).toPromise();
  }
}
