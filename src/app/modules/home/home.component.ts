import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { BreadcrumbService } from '@app/core/breadcrumb/breadcrumb.service';
import { AuthService } from '../../shared/services/auth.service';
import { ISocialLoginResult } from '../../shared/interface/ISocialLoginResult';

@Component({
  selector: 'tt-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private breadcrumbService: BreadcrumbService,
    private authSrv: AuthService,
    private router: Router
  ) {
    this.breadcrumbService.setItems([
      { label: 'dashboard' },
      { label: 'home', routerLink: ['/home'] }
    ]);
  }

  ngOnInit() {
    this.processSocialLogin();
  }

  private processSocialLogin() {
    try {
      const returnSocial = location.hash.split('=');
      const isLoginProcess = Array.isArray(returnSocial) && returnSocial.length === 2;
      if (isLoginProcess) {
        console.log(atob(returnSocial[1]));
        const userInfo = JSON.parse(atob(returnSocial[1])) as ISocialLoginResult;
        this.authSrv.saveToken(userInfo);
        this.authSrv.saveUserInfo(userInfo.person);
        this.router.navigate(['/home']);
      }
      if (!this.authSrv.isAuthenticated() && !isLoginProcess) {
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.log('Social login error: ', error);
    }
  }
}
