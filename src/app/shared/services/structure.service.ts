import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';

import Common from '@app/shared/util/Common';
import { Structure } from '../models/structure';
import { AuthService } from './auth.service';

@Injectable()
export class StructureService {
  private url = `${environment.apiEndpoint}/structures`;

  constructor(private http: HttpClient,
              private authSrv: AuthService) {}

  async listAll(query) {
    const url = this.url.concat(query ? `?query=${query}` : '');
    return this.http.get<Structure[]>(url, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }

  async save(structure, edit) {
    if (edit) {
      const url = `${this.url}/${structure.id}`;
      return this.http.put<Structure>(url, JSON.stringify(structure), { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
    } else {
      return this.http.post<Structure>(this.url, JSON.stringify(structure), { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
    }
  }

  async delete(id) {
    const url = `${this.url}/${id}`;
    return this.http.delete(url, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }
}
