import { Meeting } from '@app/shared/models/Meeting';
import { IQueryOptions } from './../../shared/interface/IQueryOptions';
import { MeetingService } from '@app/shared/services/meeting.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { BreadcrumbService } from '@app/core/breadcrumb/breadcrumb.service';
import { AuthService } from '@app/shared/services/auth.service';
import { ISocialLoginResult } from '@app/shared/interface/ISocialLoginResult';
import { IPerson } from '@app/shared/interface/IPerson';
import { ConferenceService } from '@app/shared/services/conference.service';
import { IConferenceWithMeetings } from '@app/shared/interface/IConferenceWithMeetings';

@Component({
  selector: 'tt-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private breadcrumbService: BreadcrumbService,
    private authSrv: AuthService,
    private conferenceService: ConferenceService,
    private router: Router ) {
  }

  async ngOnInit() {
    await this.processSocialLogin();
  }

  private async processSocialLogin() {
    try {
      const returnSocial = location.hash.split('=');
      const isLoginProcess = Array.isArray(returnSocial) && returnSocial.length === 2;
      let userInfo: ISocialLoginResult;
      let user: IPerson;
      if (isLoginProcess) {
        userInfo = await JSON.parse(decodeURIComponent(escape(atob(returnSocial[1])))) as ISocialLoginResult;
        this.authSrv.saveToken(userInfo);
        this.authSrv.saveUserInfo(userInfo.person);
        user = userInfo.person;
      } else {
        user = this.authSrv.getUserInfo;
      }

      if (!await this.authSrv.isAuthenticated() && !isLoginProcess) {
        await this.router.navigate(['/login']);
      }

      await this.SetStartPage(user);
    } catch (error) {
      console.log('Social login error: ', error);
    }
  }

  private async SetStartPage(user: IPerson) {
    if (user.roles.find(r => (r === 'Administrator' || r === 'Moderator'))) {
      this.breadcrumbService.setItems([
        { label: 'control-panel' },
        { label: 'home', routerLink: ['/home'] }
      ]);
      this.router.navigate(['/control-panel-dashboard']);
    } else if (user.roles.find(r => (r === 'Recepcionist'))) {
      if (await this.HaveMeetingsForReceptionist(user)) {
        this.breadcrumbService.setItems([
          { label: 'attendance', routerLink: ['/attendance'] }
        ]);
        this.router.navigate(['/attendance']);
      } else {
        alert('Acesso negado. Suas permissões são insuficientes para acessar este recurso.');
        this.authSrv.signOut();
      }
    } else {
      alert('Acesso negado. Suas permissões são insuficientes para acessar este recurso.');
      this.authSrv.signOut();
    }
  }

  private async HaveMeetingsForReceptionist(user: IPerson) {
    const { protocol, host } = window.location;
    const now = new Date();
    const dateString = now.toLocaleDateString('pt-BR', {timeZone: 'UTC'})
    + ' '
    + ('0' + now.getHours().toString()).slice(-2)
    + ':'
    + ('0' + now.getMinutes().toString()).slice(-2)
    + ':'
    + ('0' + now.getSeconds().toString()).slice(-2) ;

    const allConfs = await this.conferenceService.getConferencesWithPresentialMeetings(dateString);

    return (allConfs.length > 0);
  }

}
