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
      if (await this.HaveMeetingsForReceptionist()) {
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

  private async HaveMeetingsForReceptionist() {

    const allConfs = await this.conferenceService.getConferencesWithPresentialMeetings();

    return ((allConfs.length > 0) && (this.IsAMeetingRunning(allConfs)));
  }


  IsAMeetingRunning(confs: IConferenceWithMeetings[]): boolean {
    const meetingFound =
      confs.find((conf) => (
        conf.meeting.find((meet) => (this.IsRunningToday(meet)))
      ));
    return (meetingFound !== undefined) ? true : false;
  }

  ToIntlDateFormat(date: string): string {
    const parts = date.split('/');
    return (parts.length === 3) ? parts[1] + '/' + parts[0] + '/' + parts[2] : date;
  }

  IsRunningNow(meeting: Meeting): boolean {
    const now = new Date();
    return ((new Date(this.ToIntlDateFormat(meeting.beginDate.toString())) < now)
         && (new Date(this.ToIntlDateFormat(meeting.endDate.toString())) > now))
  }

  IsRunningToday(meeting: Meeting): boolean {
    const now = new Date();
    let day = new Date(this.ToIntlDateFormat(meeting.beginDate.toString()));
    let startTime = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      0, 0, 0, 0);

    day = new Date(this.ToIntlDateFormat(meeting.endDate.toString()));
    let endTime = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      23, 59, 59, 999);

    return (startTime < now)
         && (endTime > now)
  }



}
