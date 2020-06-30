
import { environment } from '../../../environments/environment';
import { DOCUMENT } from '@angular/common';
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import * as jwtDecode from 'jwt-decode';
import { StoreKeys } from '../constants';
import { IPerson } from '../interface/IPerson';
import { ISocialLoginResult } from './../interface/ISocialLoginResult';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(
    public http: HttpClient,
    public jwtHelperService: JwtHelperService,
    public router: Router,
    @Inject(DOCUMENT) private document: Document
  ) { }

  private getUrlForSocialAuth(origin: string) {
    return `${environment.apiEndpoint}/oauth2/authorization/${origin}?front_callback_url=${this.getFrontFallbackUrl()}`;
  }

  signInAcessoCidadao() {
    this.document.location.href = this.getUrlForSocialAuth('idsvr');
  }

  async refresh() {
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        const data = await this.http.get<ISocialLoginResult>(
          `${environment.apiEndpoint}/signin/refresh?refreshToken=${refreshToken}`
        ).toPromise();
        this.saveToken(data);
      }
      return true;
    } catch (err) {
    }
    this.clearTokens();
    return false;
  }

  async signOut() {
    this.clearTokens();
    this.router.navigate(['/login']);
  }

  saveToken(data: ISocialLoginResult) {
    localStorage.setItem(StoreKeys.ACCESS_TOKEN, data.token);
    localStorage.setItem(StoreKeys.REFRESH_TOKE, data.refreshToken);
  }

  saveUserInfo(data: IPerson) {
    localStorage.setItem(StoreKeys.USER_INFO, JSON.stringify(data));
  }

  clearTokens() {
    localStorage.removeItem(StoreKeys.ACCESS_TOKEN);
    localStorage.removeItem(StoreKeys.REFRESH_TOKE);
  }

  getAccessToken() {
    return localStorage.getItem(StoreKeys.ACCESS_TOKEN);
  }

  getRefreshToken() {
    return localStorage.getItem(StoreKeys.REFRESH_TOKE);
  }

  getTokenPayload() {
    return jwtDecode(this.getAccessToken());
  }

  private getFrontFallbackUrl(): string {
    const { protocol, host } = window.location;
    return `${protocol}//${host}`;
  }

  get getUserInfo(): IPerson {
    try {
      return JSON.parse(localStorage.getItem(StoreKeys.USER_INFO)) as IPerson;
    } catch (error) {
      return {} as IPerson;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const accessToken = this.getAccessToken();
    if (accessToken) {
      const notExpired = !this.jwtHelperService.isTokenExpired(accessToken);

      if (notExpired) {
        return true;
      }

      if (await this.refresh()) {
        return true;
      }
    }
    return false;
  }
}
