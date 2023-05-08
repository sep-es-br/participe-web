import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';

import Common from '@app/shared/util/Common';
import { Plan } from '../models/plan';
import { AuthService } from './auth.service';

@Injectable()
export class PlanService {
  private url = `${environment.apiEndpoint}/plans`;
  private urlApiImagem = `${environment.apiEndpoint}/files`;

  constructor(private http: HttpClient, private authSrv: AuthService) {}

  async listAll(query) {
    const url = this.url.concat(query ? `?query=${query}` : '');
    return this.http.get<Plan[]>(url, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }

  async save(domain, edit) {
    if (edit) {
      const url = `${this.url}/${domain.id}`;
      return this.http.put<Plan>(url, JSON.stringify(domain), { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
    } else {
      return this.http.post<Plan>(this.url, JSON.stringify(domain), { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
    }
  }

  async delete(id) {
    const url = `${this.url}/${id}`;
    return this.http.delete(url, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }

  async deleteLogo(id) {
    const url = this.urlApiImagem + '/' + id;
    return this.http.delete(url, { headers: await Common.buildHeaders(this.authSrv) });
  }
}
