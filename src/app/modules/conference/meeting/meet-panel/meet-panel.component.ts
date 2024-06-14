import { transition } from '@angular/animations';
import { ConferenceService } from './../../../../shared/services/conference.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meeting } from '@app/shared/models/Meeting';
import { Conference } from '@app/shared/models/conference';
import { Locality } from '@app/shared/models/locality';
import { ControlPanelDashboardService } from '@app/shared/services/control-panel-dashboard.service';
import { MeetingService } from '@app/shared/services/meeting.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-meet-panel',
  templateUrl: './meet-panel.component.html',
  styleUrls: ['./meet-panel.component.scss']
})
export class MeetPanelComponent implements OnInit {

  constructor(
    private meetingSrv: MeetingService,
    private conferenceSrv: ConferenceService,
    private activeRoute: ActivatedRoute,
    private dashboardSrv: ControlPanelDashboardService
    ) {
  }

  subs: Subscription[] = [];
  meeting: Meeting;
  refreshTime: number = environment.meetingPanelRefreshTimeMs;
  conference: Conference;
  meetingSubtitle: String = "";
  timer: any;

  confParticipants: number = 0;
  confComments: number = 0;
  confHighlights: number = 0;
  confLocalities: number = 0;

  meetingParticipants: number = 0;
  meetingComments: number = 0;
  meetingHighlights: number = 0;
  meetingLocalities: number = 0;

  // Transitions
  transitionTimeMs: number = 300;
  transitionShadow: number = 3;
  transitionColor: String = '#00a198';
  meetNumberColor: String = '#153961';
  noShadow: number = 0;

  mpColor: String = this.meetNumberColor;
  mpShadow: number = this.noShadow;
  mcColor: String = this.meetNumberColor;
  mcShadow: number = this.noShadow;
  mhColor: String = this.meetNumberColor;
  mhShadow: number = this.noShadow;
  mlColor: String = this.meetNumberColor;
  mlShadow: number = this.noShadow;


  ngOnInit() {
    this.subs.push(this.activeRoute.params.pipe(take(1)).subscribe(async ({id, idm}) => {
      this.meeting = await this.meetingSrv.getMeetingById(+idm);
      this.meetingSubtitle = this.composeSubtitle();
      this.conference = await this.conferenceSrv.getById(+id);
      this.timer = window.setInterval(this.loadValues, this.refreshTime, this);
    }));
  }

  composeSubtitle(): String {
    if (this.meeting.localityCovers.length == 0) {
      return "";
    }
    let subtitle = (this.meeting.localityCovers.length > 1) ? "Microrregiões " : "Microrregião ";
    for (let i = 0; i < this.meeting.localityCovers.length; i++) {
      let locality = this.meeting.localityCovers[i] as Locality;
      subtitle += locality.name;
      subtitle += (i < this.meeting.localityCovers.length-2) ? ", "
                : (i < this.meeting.localityCovers.length-1) ? " e "
                : "";
    }
    return subtitle;
  }


  loadValues(_this) {
    _this.loadConfNumbers();
    _this.loadMeetingNumbers();
  }

  loadConfNumbers() {
    this.dashboardSrv.getDashboardData(
      this.conference.id,
      'PARTICIPANTS',
      null, null, null, null, null, null, null,
      true)
        .then((returnData) => {
          this.confParticipants = returnData.participants;
          this.confComments = returnData.proposals;
          this.confHighlights = returnData.highlights;
          this.confLocalities = returnData.counties;
        })
        .catch((error) => {
          console.log("Promise rejected with " + JSON.stringify(error));
        });
  }

  loadMeetingNumbers() {
    this.dashboardSrv.getDashboardData(
      this.conference.id,
      'PARTICIPANTS',
      'PRESENTIAL',
      [this.meeting.id],
      null, null, null, null, null,
      true)
        .then((returnData) => {
          this.updateParticipants(returnData.participants);
          this.updateComments(returnData.proposals);
          this.updateHighlights(returnData.highlights);
          this.updateLocalities(returnData.counties);
        })
        .catch((error) => {
          console.log("Promise rejected with " + JSON.stringify(error));
        });
  }

  updateParticipants(newValue: any) {
    if (this.meetingParticipants == newValue) {
      return;
    }
    this.mpColor = this.transitionColor;
    this.mpShadow = this.transitionShadow;
    this.meetingParticipants = newValue;
    setTimeout(() => {
      this.mpColor = this.meetNumberColor;
      this.mpShadow = this.noShadow;
    }, this.transitionTimeMs, this);
  }

  updateComments(newValue: any) {
    if (this.meetingComments == newValue) {
      return;
    }
    this.mcColor = this.transitionColor;
    this.mcShadow = this.transitionShadow;
    this.meetingComments = newValue;
    setTimeout(() => {
      this.mcColor = this.meetNumberColor;
      this.mcShadow = this.noShadow;
    }, this.transitionTimeMs, this);
  }

  updateHighlights(newValue: any) {
    if (this.meetingHighlights == newValue) {
      return;
    }
    this.mhColor = this.transitionColor;
    this.mhShadow = this.transitionShadow;
    this.meetingHighlights = newValue;
    setTimeout(() => {
      this.mhColor = this.meetNumberColor;
      this.mhShadow = this.noShadow;
    }, this.transitionTimeMs, this);
  }

  updateLocalities(newValue: any) {
    if (this.meetingLocalities == newValue) {
      return;
    }
    this.mlColor = this.transitionColor;
    this.mlShadow = this.transitionShadow;
    this.meetingLocalities = newValue;
    setTimeout(() => {
      this.mlColor = this.meetNumberColor;
      this.mlShadow = this.noShadow;
    }, this.transitionTimeMs, this);
  }


  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.subs.forEach((s) => {s.unsubscribe()});
  }

}
