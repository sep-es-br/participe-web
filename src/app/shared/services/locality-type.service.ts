import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';

import Common from '@app/shared/util/Common';
import { LocalityType } from '@app/shared/models/locality-type';
import { AuthService } from './auth.service';

@Injectable()
export class LocalityTypeService {
  private url = `${environment.apiEndpoint}/locality-types`;

  constructor(private http: HttpClient,
    private authSrv: AuthService) {}

  async listAll() {
    return this.http.get<LocalityType[]>(this.url, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }
}
