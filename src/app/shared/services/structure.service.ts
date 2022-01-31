import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';

import Common from '@app/shared/util/Common';
import { Structure } from '../models/structure';

@Injectable()
export class StructureService {
  private url = `${environment.apiEndpoint}/structures`;
  private headers = Common.buildHeaders();

  constructor(private http: HttpClient) {}

  listAll(query) {
    const url = this.url.concat(query ? `?query=${query}` : '');
    return this.http.get<Structure[]>(url, { headers: this.headers }).toPromise();
  }

  save(structure, edit) {
    if (edit) {
      const url = `${this.url}/${structure.id}`;
      return this.http.put<Structure>(url, JSON.stringify(structure), { headers: this.headers }).toPromise();
    } else {
      return this.http.post<Structure>(this.url, JSON.stringify(structure), { headers: this.headers }).toPromise();
    }
  }

  delete(id) {
    const url = `${this.url}/${id}`;
    return this.http.delete(url, { headers: this.headers }).toPromise();
  }
}
