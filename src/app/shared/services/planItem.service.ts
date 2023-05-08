import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';

import Common from '@app/shared/util/Common';
import { Plan } from '../models/plan';
import { PlanItem } from '../models/plan-item';
import { AuthService } from './auth.service';

@Injectable()
export class PlanItemService {
  private url = `${environment.apiEndpoint}/plan-items`;

  constructor(private http: HttpClient, private authSrv: AuthService) {}

  async listAll(query) {
    const url = this.url.concat(query ? `?query=${query}` : '');
    return this.http.get<Plan[]>(url, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }

  async show(id) {
    const url = `${this.url}/${id}`;
    return this.http.get<PlanItem>(url, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }

  async save(planItem, edit) {
    if (edit) {
      const url = `${this.url}/${planItem.id}`;
      return this.http.put<Plan>(url, JSON.stringify(planItem), { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
    } else {
      return this.http.post<Plan>(this.url, JSON.stringify(planItem), { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
    }
  }

  async delete(id) {
    const url = `${this.url}/${id}`;
    return this.http.delete(url, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }

}
