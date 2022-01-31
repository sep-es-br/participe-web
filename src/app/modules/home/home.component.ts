import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { BreadcrumbService } from '@app/core/breadcrumb/breadcrumb.service';
import { AuthService } from '@app/shared/services/auth.service';
import { ISocialLoginResult } from '@app/shared/interface/ISocialLoginResult';

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
      { label: 'control-panel' },
      { label: 'home', routerLink: ['/home'] }
    ]);
  }

  async ngOnInit() {
    await this.processSocialLogin();
  }

  private async processSocialLogin() {
    try {
      const returnSocial = location.hash.split('=');
      const isLoginProcess = Array.isArray(returnSocial) && returnSocial.length === 2;
      if (isLoginProcess) {
        const userInfo = JSON.parse(decodeURIComponent(escape(atob(returnSocial[1])))) as ISocialLoginResult;
        this.authSrv.saveToken(userInfo);
        this.authSrv.saveUserInfo(userInfo.person);
        await this.router.navigate(['/control-panel-dashboard']);
      }
      if (!await this.authSrv.isAuthenticated() && !isLoginProcess) {
        await this.router.navigate(['/login']);
      }
      await this.router.navigate(['/control-panel-dashboard']);
    } catch (error) {
      console.log('Social login error: ', error);
    }
  }
}
