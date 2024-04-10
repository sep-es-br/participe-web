import { IAuthenticationProvider } from './../interface/IAuthenticationProvider';

import { environment } from '@environments/environment';
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

  providers: IAuthenticationProvider[] = [
    { tag: 'participe', icon: 'assets/layout/images/icons/participe.svg', label: 'Participe' },
    { tag: 'acessocidadao', icon: 'assets/layout/images/icons/acessocidadao.svg', label: 'Acesso Cidadão' },
    { tag: 'google', icon: 'assets/layout/images/icons/google.svg', label: 'Google' },
    { tag: 'facebook', icon: 'assets/layout/images/icons/facebook.svg', label: 'Facebook' },
    { tag: 'twitter', icon: 'assets/layout/images/icons/twitter.svg', label: 'Twitter' }
  ];

  constructor(
    public http: HttpClient,
    public jwtHelperService: JwtHelperService,
    public router: Router,
    @Inject(DOCUMENT) private document: Document
  ) { }

  private static getUrlForSocialAuth(origin: string) {
    return `${environment.apiEndpoint}/oauth2/authorization/${origin}?front_callback_url=${AuthService.getFrontFallbackUrl()}`;
  }

  signInAcessoCidadao() {
    localStorage.setItem('LogoutURL', environment.logoutURIAcessoCidadao);
    this.document.location.href = AuthService.getUrlForSocialAuth('idsvr');
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
    window.location.href = localStorage.getItem('LogoutURL');
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

  private static getFrontFallbackUrl(): string {
    const { protocol, host } = window.location;
    let url = `${protocol}//${host}`;

    if (environment.redirectAdmin) {
      url = url + '/admin';
    }

    return url;
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

  getAuthenticationIcon(authProvider: string): string {
    return this.providers.find(p => p.tag === authProvider.toLowerCase()).icon;
  }

}
