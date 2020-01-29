import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import { Login } from '@app/shared/dto/login';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private headers: HttpHeaders;
  private loginUrl: string;

  constructor(private http: HttpClient) {
    this.buildUrls();
  }

  private buildUrls() {
    this.loginUrl = `${environment.apiEndpoint}/login`;
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
  }

  login(login: Login) {
    return this.http.post<Login>(`${this.loginUrl}`, JSON.stringify(login), { headers: this.headers }).toPromise();
  }

  salvarToken(token: string) {
    return window.sessionStorage.setItem('token', token);
  }

  buscarToken() {
    return window.sessionStorage.getItem('token');
  }
}
