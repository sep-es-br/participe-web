import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';

import Common from '@app/shared/util/Common';
import { StructureItem } from '@app/shared/models/structure-item';
import { AuthService } from './auth.service';

@Injectable()
export class StructureItemService {
  private url = `${environment.apiEndpoint}/structure-items`;

  constructor(private http: HttpClient,
              private authSrv: AuthService) {}

  async listAll(query) {
    return this.http.get<StructureItem[]>(`${this.url}?query=${query}`, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }

  async find(id) {
    return this.http.get<StructureItem>(`${this.url}/${id}`, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }

  async save(structureItem, edit) {
    if (edit) {
      const editUrl = `${this.url}/${structureItem.id}`;
      return this.http.put<StructureItem>(editUrl, JSON.stringify(structureItem), { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
    } else {
      return this.http.post<StructureItem>(this.url, JSON.stringify(structureItem), { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
    }
  }

  async delete(id) {
    const url = `${this.url}/${id}`;
    return this.http.delete(url, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }

  async listStructureItems(idStructure: number) {
    return this.http.get<StructureItem[]>
      (`${this.url}/list?id=${idStructure && idStructure.toString()}`, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }
}
