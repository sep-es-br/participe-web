import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';

import Common from '@app/shared/util/Common';
import { Plan } from '../models/plan';
import { PlanItem } from '../models/plan-item';

@Injectable()
export class PlanItemService {
  private url = `${environment.apiEndpoint}/plan-items`;
  private headers = Common.buildHeaders();

  constructor(private http: HttpClient) {}

  listAll(query) {
    const url = this.url.concat(query ? `?query=${query}` : '');
    return this.http.get<Plan[]>(url, { headers: this.headers }).toPromise();
  }

  show(id) {
    const url = `${this.url}/${id}`;
    return this.http.get<PlanItem>(url, { headers: this.headers }).toPromise();
  }

  save(planItem, edit) {
    if (edit) {
      const url = `${this.url}/${planItem.id}`;
      return this.http.put<Plan>(url, JSON.stringify(planItem), { headers: this.headers }).toPromise();
    } else {
      return this.http.post<Plan>(this.url, JSON.stringify(planItem), { headers: this.headers }).toPromise();
    }
  }

  delete(id) {
    const url = `${this.url}/${id}`;
    return this.http.delete(url, { headers: this.headers }).toPromise();
  }

}
