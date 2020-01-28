import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';

import Common from '@app/shared/util/Common';
import { Locality } from '@app/shared/models/locality';

@Injectable()
export class LocalityService {
  private url = `${environment.apiEndpoint}/localities`;
  private headers = Common.buildHeaders();

  constructor(private http: HttpClient) {}

  listAll(query) {
    return this.http.get<Locality[]>(`${this.url}?query=${query}`, { headers: this.headers }).toPromise();
  }

  save(locality, edit) {
    if (edit) {
      const editUrl = `${this.url}/${locality.id}`;
      return this.http.put<Locality>(editUrl, JSON.stringify(locality), { headers: this.headers }).toPromise();
    } else {
      return this.http.post<Locality>(this.url, JSON.stringify(locality), { headers: this.headers }).toPromise();
    }
  }

  delete(idLocality, idDomain) {
    let url = `${this.url}/${idLocality}/domain/${idDomain}`;
    return this.http.delete(url, { headers: this.headers }).toPromise();
  }

  findByDomain(idDomain) {
    let url = `${this.url}/domain/${idDomain}`;
    return this.http.get<Locality[]>(url, { headers: this.headers }).toPromise();
  }
}
