import { Meeting } from '@app/shared/models/Meeting';
import { Subscription } from 'rxjs';
import { ConferenceService } from '@app/shared/services/conference.service';
import {Component, OnInit} from '@angular/core';
import {BreadcrumbService} from '@app/core/breadcrumb/breadcrumb.service';
import {IconDefinition} from '@fortawesome/fontawesome-svg-core';
import {faEdit, faUserPlus} from '@fortawesome/free-solid-svg-icons';
import {AuthService} from '@app/shared/services/auth.service';
import { ActionBarService, ActionButtonItem } from '@app/core/actionbar/app.actionbar.actions.service';
import { IConferenceWithMeetings } from '@app/shared/interface/IConferenceWithMeetings';
import { DateProfileGenerator } from '@fullcalendar/core';


@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {

  actionsButtonLeft: ActionButtonItem[] = [];

  actions: Array<{ name: string, url: string, icon: IconDefinition }>;
  confs: IConferenceWithMeetings[];
  constructor(private breadcrumbSrv: BreadcrumbService,
              private userAuth: AuthService,
              private conferenceService: ConferenceService) {
    this.breadcrumbSrv.setItems([
      {label: 'attendance.label'}
    ]);
  }

  ngOnInit() {
    const {roles} = this.userAuth.getUserInfo;
    this.actions = [];
    if (roles.includes('Recepcionist') || roles.includes('Administrator')) {
      this.conferenceService.getConferencesWithPresentialMeetings().then((confs) => {
        // We have any conference with presential meetings?
        if (confs.length > 0) {
          // Only administrators can edit
          if (roles.includes('Administrator')) {
            this.actions.push({name: 'attendance.registerAttendance', url: 'register', icon: faUserPlus});
            this.actions.push({name: 'attendance.edit', url: 'edit', icon: faEdit});
          } else if (roles.includes('Recepcionist') && this.IsAMeetingRunning(confs)) {
          // Administrators and receptionists can register only during the meetings
            this.actions.push({name: 'attendance.registerAttendance', url: 'register', icon: faUserPlus});
          }
        }
      });
    }
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
