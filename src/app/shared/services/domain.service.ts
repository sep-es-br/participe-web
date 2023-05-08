import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';

import Common from '@app/shared/util/Common';
import { Domain } from '../models/domain';
import { AuthService } from './auth.service';

@Injectable()
export class DomainService {
  private url = `${environment.apiEndpoint}/domains`;

  constructor(private http: HttpClient, private authSrv: AuthService) { }

  async listAll(query) {
    const url = this.url.concat(query ? `?query=${query}` : '');
    return this.http.get<Domain[]>(url, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }

  async save(domain, edit) {
    if (edit) {
      const url = `${this.url}/${domain.id}`;
      return this.http.put<Domain>(url, JSON.stringify(domain), { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
    } else {
      return this.http.post<Domain>(this.url, JSON.stringify(domain), { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
    }
  }

  async delete(id) {
    const url = `${this.url}/${id}`;
    return this.http.delete(url, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }

}
