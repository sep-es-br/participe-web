import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';

import Common from '@app/shared/util/Common';
import { StructureItem } from '@app/shared/models/structure-item';

@Injectable()
export class StructureItemService {
  private url = `${environment.apiEndpoint}/structure-items`;


  constructor(private http: HttpClient) {}

  listAll(query) {
    return this.http.get<StructureItem[]>(`${this.url}?query=${query}`, { headers: Common.buildHeaders() }).toPromise();
  }

  find(id) {
    return this.http.get<StructureItem>(`${this.url}/${id}`, { headers: Common.buildHeaders() }).toPromise();
  }

  save(structureItem, edit) {
    if (edit) {
      const editUrl = `${this.url}/${structureItem.id}`;
      return this.http.put<StructureItem>(editUrl, JSON.stringify(structureItem), { headers: Common.buildHeaders() }).toPromise();
    } else {
      return this.http.post<StructureItem>(this.url, JSON.stringify(structureItem), { headers: Common.buildHeaders() }).toPromise();
    }
  }

  delete(id) {
    const url = `${this.url}/${id}`;
    return this.http.delete(url, { headers: Common.buildHeaders() }).toPromise();
  }

  listStructureItems(idStructure: number) {
    return this.http.get<StructureItem[]>
      (`${this.url}/list?id=${idStructure && idStructure.toString()}`, { headers: Common.buildHeaders() }).toPromise();
  }
}
