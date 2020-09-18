import Common from '@app/shared/util/Common';
import { Conference } from '../models/conference';
import { HttpClient } from '@angular/common/http';
import { IConferenceWithMeetings } from '../interface/IConferenceWithMeetings';
import { ILocalityConferente } from './../interface/ILocalityConference';
import { IPerson } from './../interface/IPerson';
import { Injectable } from '@angular/core';
import { PrepareHttpQuery } from '../util/Query.utils';
import { environment } from '@environments/environment';

@Injectable()
export class ConferenceService {
  private url = `${environment.apiEndpoint}/conferences`;
  private headers = Common.buildHeaders();

  constructor(private http: HttpClient) { }

  getById(id: number) {
    return this.http.get<Conference>(`${this.url}/${id}`, { headers: this.headers }).toPromise();
  }

  listAll() {
    return this.http.get<Conference[]>(this.url, { headers: this.headers }).toPromise();
  }

  show(id) {
    const url = this.url.concat(`/${id}`);
    return this.http.get<IPerson>(url, { headers: this.headers }).toPromise();
  }

  search(name, plan, year, month) {
    const url = this.url.concat('?name=').concat(name ? name : '').concat(plan ? `&plan=${plan}` : '')
      .concat(year ? `&year=${year}` : '').concat(month ? `&month=${month}` : '');
    return this.http.get<Conference[]>(url, { headers: this.headers }).toPromise();
  }

  save(conference, edit) {
    if (edit) {
      const url = `${this.url}/${conference.id}`;
      return this.http.put<Conference>(url, JSON.stringify(conference), { headers: this.headers }).toPromise();
    } else {
      return this.http.post<Conference>(this.url, JSON.stringify(conference), { headers: this.headers }).toPromise();
    }
  }

  delete(id) {
    const url = `${this.url}/${id}`;
    return this.http.delete(url, { headers: this.headers }).toPromise();
  }

  validate(name, id) {
    const url = this.url.concat('/validate?name=').concat(name ? name : '').concat(id ? `&id=${id}` : '');
    return this.http.get<boolean>(url, { headers: this.headers }).toPromise();
  }

  searchModerators(name, email) {
    const url = this.url.concat('/moderators').concat('?name=').concat(name ? name : '').concat(email ? `&email=${email}` : '');
    return this.http.get<IPerson[]>(url, { headers: this.headers }).toPromise();
  }

  searchReceptionists(name: string, email: string) {
    return this.http.get<IPerson[]>(`${this.url}/receptionists${PrepareHttpQuery({ search: { name, email } })}`,
      { headers: this.headers }).toPromise();
  }

  comments(id) {
    const url = this.url.concat(`/${id}/comments`);
    return this.http.get<number>(url, { headers: this.headers }).toPromise();

  }

  highlights(id) {
    const url = this.url.concat(`/${id}/highlights`);
    return this.http.get<number>(url, { headers: this.headers }).toPromise();

  }

  selfdeclarations(id) {
    const url = this.url.concat(`/${id}/selfdeclarations`);
    return this.http.get<number>(url, { headers: this.headers }).toPromise();

  }

  getLocalitiesByConferenceId(conferenceId: number, localityName?: string) {
    return this.http.get<ILocalityConferente>(
      `${environment.apiEndpoint}/citizen/localities/${conferenceId}?name=${localityName || ''}`
      , { headers: this.headers }).toPromise();
  }

  getConferencesWithMeetings(date?: string) {
    return this.http.get<IConferenceWithMeetings[]>(
      `${this.url}/with-meetings${PrepareHttpQuery({ search: { date } })}`,
      { headers: this.headers }
    ).toPromise();
  }
}
