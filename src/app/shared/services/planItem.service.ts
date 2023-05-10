import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';

import Common from '@app/shared/util/Common';
import { Plan } from '../models/plan';
import { PlanItem } from '../models/plan-item';

@Injectable()
export class PlanItemService {
  private url = `${environment.apiEndpoint}/plan-items`;


  constructor(private http: HttpClient) {}

  listAll(query) {
    const url = this.url.concat(query ? `?query=${query}` : '');
    return this.http.get<Plan[]>(url, { headers: Common.buildHeaders() }).toPromise();
  }

  show(id) {
    const url = `${this.url}/${id}`;
    return this.http.get<PlanItem>(url, { headers: Common.buildHeaders() }).toPromise();
  }

  save(planItem, edit) {
    if (edit) {
      const url = `${this.url}/${planItem.id}`;
      return this.http.put<Plan>(url, JSON.stringify(planItem), { headers: Common.buildHeaders() }).toPromise();
    } else {
      return this.http.post<Plan>(this.url, JSON.stringify(planItem), { headers: Common.buildHeaders() }).toPromise();
    }
  }

  delete(id) {
    const url = `${this.url}/${id}`;
    return this.http.delete(url, { headers: Common.buildHeaders() }).toPromise();
  }

}
