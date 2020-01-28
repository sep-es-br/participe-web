import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';

import Common from '@app/shared/util/Common';
import { Domain } from '../models/domain';

@Injectable()
export class DomainService {
  private url = `${environment.apiEndpoint}/domains`;
  private headers = Common.buildHeaders();

  constructor(private http: HttpClient) {}

  listAll(query) {
    const url = this.url.concat(query ? `?query=${query}` : '');
    return this.http.get<Domain[]>(url, { headers: this.headers }).toPromise();
  }

  save(domain, edit) {
    if (edit) {
      const url = `${this.url}/${domain.id}`;
      return this.http.put<Domain>(url, JSON.stringify(domain), { headers: this.headers }).toPromise();
    } else {
      return this.http.post<Domain>(this.url, JSON.stringify(domain), { headers: this.headers }).toPromise();
    }
  }

  delete(id) {
    let url = `${this.url}/${id}`;
    return this.http.delete(url, { headers: this.headers }).toPromise();
  }
}
