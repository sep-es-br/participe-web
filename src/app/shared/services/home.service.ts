import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private headers: HttpHeaders;
  private loginUrl: string;

  constructor(private http: HttpClient) {
    this.loginUrl = `${environment.apiEndpoint}/home`;
    this.buildUrls();
  }

  private buildUrls() {

    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
  }

  show(token: string) {
    this.headers = this.headers.append('Authorization', `Bearer ${token}`);
    return this.http.get(this.loginUrl, { headers: this.headers }).toPromise();
  }
}
