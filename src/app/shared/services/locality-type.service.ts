import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';

import Common from '@app/shared/util/Common';
import { LocalityType } from '@app/shared/models/locality-type';

@Injectable()
export class LocalityTypeService {
  private url = `${environment.apiEndpoint}/locality-types`;
  private headers = Common.buildHeaders();

  constructor(private http: HttpClient) {}

  listAll() {
    return this.http.get<LocalityType[]>(this.url, { headers: this.headers }).toPromise();
  }
}
