import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';

import Common from '@app/shared/util/Common';
import { StructureItem } from '@app/shared/models/structure-item';

@Injectable()
export class StructureItemService {
  private url = `${environment.apiEndpoint}/structure-items`;
  private headers = Common.buildHeaders();

  constructor(private http: HttpClient) {}

  listAll(query) {
    return this.http.get<StructureItem[]>(`${this.url}?query=${query}`, { headers: this.headers }).toPromise();
  }

  find(id) {
    return this.http.get<StructureItem>(`${this.url}/${id}`, { headers: this.headers }).toPromise();
  }

  save(structureItem, edit) {
    if (edit) {
      const editUrl = `${this.url}/${structureItem.id}`;
      return this.http.put<StructureItem>(editUrl, JSON.stringify(structureItem), { headers: this.headers }).toPromise();
    } else {
      return this.http.post<StructureItem>(this.url, JSON.stringify(structureItem), { headers: this.headers }).toPromise();
    }
  }

  delete(id) {
    let url = `${this.url}/${id}`;
    return this.http.delete(url, { headers: this.headers }).toPromise();
  }
}
