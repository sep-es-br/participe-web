import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';

import Common from '@app/shared/util/Common';
import { Conference } from '../models/conference';

@Injectable()
export class ConferenceService {
  private url = `${environment.apiEndpoint}/conferences`;
  private headers = Common.buildHeaders();

  constructor(private http: HttpClient) {}

  listAll() {
    return this.http.get<Conference[]>(this.url, { headers: this.headers }).toPromise();
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
    let url = `${this.url}/${id}`;
    return this.http.delete(url, { headers: this.headers }).toPromise();
  }

  validate(name, id) {
    const url = this.url.concat('/validate?name=').concat(name ? name : '').concat(id ? `&id=${id}` : '');
    return this.http.get<boolean>(url, { headers: this.headers }).toPromise();
  }
}
