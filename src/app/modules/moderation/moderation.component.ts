import {ActionBarService} from '@app/core/actionbar/app.actionbar.actions.service';
import {Conference} from '@app/shared/models/conference';
import {ModerationComments} from '@app/shared/models/moderationComments';
import {ModerationFilter} from '@app/shared/models/moderationFilter';
import {ModerationService} from '@app/shared/services/moderation.service';
import {HelperUtils} from '@app/shared/util/HelpersUtil';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {BreadcrumbService} from '@app/core/breadcrumb/breadcrumb.service';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';
import {TranslateService} from '@ngx-translate/core';
import {calendar} from '@app/shared/constants';
import {TranslateChangeService} from '@app/shared/services/translateChange.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import {Router} from '@angular/router';
import {AuthService} from '@app/shared/services/auth.service';
import {ConferenceService} from '@app/shared/services/conference.service';
import { TypeofExpr } from '@angular/compiler';

@Component({
  selector: 'app-moderation',
  templateUrl: './moderation.component.html',
  styleUrls: ['./moderation.component.scss'],
})
export class ModerationComponent implements OnInit, OnDestroy {

  search: boolean;
  regionalization: boolean;
  loading: boolean;
  statusOptions: SelectItem[] = [];
  fromOptions: SelectItem[] = [];
  typeOptions: SelectItem[] = [];
  calendarTranslate: any = calendar;
  microregion: SelectItem[] = [];
  planItem: SelectItem[] = [];
  labelMicroregion: string;
  labelPlanItem: string;
  language: string;
  showSelectConference: boolean = false;
  conferencesActives: Conference[] = [];
  conferenceSelect: Conference = new Conference();
  filter: ModerationFilter = new ModerationFilter();
  conferenceComments: ModerationComments[] = [];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private translate: TranslateService,
    private translateChange: TranslateChangeService,
    private moderationSrv: ModerationService,
    private conferenceSvr: ConferenceService,
    private actionBarSrv: ActionBarService,
    private route: Router,
    private userAuth: AuthService,
  ) {
  }

  ngOnDestroy(): void {
    this.actionBarSrv.setItems([]);
  }

  async ngOnInit() {
    await this.translateChange.getCurrentLang().subscribe(({lang}) => {
      this.language = lang;
      this.calendarTranslate = calendar[lang];
      this.populateOptions();
    });

    await this.loadConferencesActives();
    await this.loadRegionalizationConference();
    await this.prepareScreen();
  }

  async loadRegionalizationConference() {
    try {
      if (this.conferenceSelect.id) {
        const data = await this.conferenceSvr.getRegionalization(this.conferenceSelect.id);
        this.regionalization = data.regionalization;
      }
    } catch (error) {
      console.error(error);
      this.messageService.add({
        severity: 'error', summary: 'Erro',
        detail: this.translate.instant('moderation.error.fetch.regionalization'),
      });
    }
  }

  populateOptions() {
    const allLabel = this.translate.instant('all');

    this.fromOptions = this.moderationSrv.FromOptions.map(from => (
      {value: from, label: this.translate.instant(`moderation.label.${from.toLowerCase()}`)}
    ));
    this.fromOptions.unshift({value: null, label: allLabel});

    this.statusOptions = this.moderationSrv.StatusOptions.map(status => ({
      value: status,
      label: this.translate.instant(status.toLowerCase())
    }));
    this.statusOptions.unshift({value: "All", label: allLabel});

  }

  async prepareScreen() {

    var strSavedFilter: string;
    var strSearchState: string;

    if((strSavedFilter = sessionStorage.getItem("moderationFilter")) !== null){
      this.filter = JSON.parse(strSavedFilter);
    }
    else{
      this.filter = {
        planItemId: null,
        localityId: null,
        status: "Pending",
        from: null,
        text: "",
        initialDate: null,
        endDate: null
      }
    }

    this.search = (sessionStorage.getItem("searchState") === "show");

    await this.loadComments();
    await this.loadLocalitiesOptions();
    await this.loadPlanItems();

    this.configureActionBar();

    this.buildBreadcrumb();

    setTimeout(() => {
      this.populateOptions();
    }, 1000);

  }

  configureActionBar() {
    this.actionBarSrv.setItems([
      {position: 'RIGHT', label: `${this.conferenceComments.length} Textos`, icon: 'comment.svg'},
      {
        position: 'LEFT', handle: () => {
          this.showSelectConference = !this.showSelectConference;
        }, icon: 'change.svg',
      },
    ]);
  }

  async loadConferencesActives() {
    try {
      const data = await this.moderationSrv.getConferencesActive(false);
      this.conferencesActives = data;
      if (sessionStorage.getItem("selectedConference") === null) {
        if (data.length > 0) {
          if (data.filter(conf => conf.isActive).length === 0) {
            this.conferenceSelect = data[0];
          } else {
            this.conferenceSelect = data.filter(conf => conf.isActive)[0];
          }
        }
      }
      else {
        this.conferenceSelect = JSON.parse(sessionStorage.getItem('selectedConference'));
      }
    } catch (error) {
      console.error(error);
      this.messageService.add({
        severity: 'error', summary: 'Erro',
        detail: this.translate.instant('moderation.error.fetch.conferences'),
      });
    }
  }

  async loadComments() {
    if (this.conferenceSelect.id == null) {
      return null;
    }

    sessionStorage.setItem("moderationFilter", JSON.stringify(this.filter));

    try {
      this.conferenceComments = await this.moderationSrv.getCommentsForModeration(this.conferenceSelect.id, this.filter);
    } catch (error) {
      if (this.conferenceSelect.id != null) {
        this.messageService.add({
          severity: 'error', summary: 'Erro',
          detail: this.translate.instant('moderation.error.fetch.comments'),
        });
      } else {
        this.messageService.add({
          severity: 'error', summary: 'Erro',
          detail: this.translate.instant('moderation.error.fetch.conferences'),
        });
      }
    }
  }

  timesAgo(time: string): string {
    if (!time) {
      return '';
    }
    try {
      moment.locale(this.language);
      return moment(time).fromNow();
    } catch (error) {
      return '';
    }
  }

  async loadLocalitiesOptions() {
    try {
      if (this.conferenceSelect.id != null) {
        const data = await this.moderationSrv.getLocalities(this.conferenceSelect.id);
        this.microregion = _.map(data.localities, ({id, name}) => ({value: id, label: name}));
        this.microregion.unshift({value: null, label: 'Todos'});
        this.labelMicroregion = data.regionalizable;
      }
    } catch (error) {
      this.messageService.add({
        severity: 'error', summary: 'Erro',
        detail: this.translate.instant('moderation.error.fetch.regionalization'),
      });
    }
  }

  async loadPlanItems() {
    try {
      if (this.conferenceSelect.id != null) {
        const data = await this.moderationSrv.getPlanItem(this.conferenceSelect.id);
        this.planItem = _.map(_.get(data, 'planItems', []),
          ({planItemId, planItemName}) => ({value: planItemId, label: planItemName}));
        this.planItem.unshift({value: null, label: 'Todos'});
        this.labelPlanItem = _.get(data, 'structureItemName');
      }
    } catch (error) {
      this.messageService.add({
        severity: 'error', summary: 'Erro',
        detail: this.translate.instant('moderation.error.fetch.planItems'),
      });
    }
  }

  getIcon(icon?: string) {
    return HelperUtils.loadingIcon(icon, this.loading);
  }

  changeDate(field: string, event) {
    this.filter[field] = moment(event).format('DD/MM/yyyy');
  }

//  selectLocality(locality: SelectItem) {
//    this.filter.localityIds = [locality.value];
//  }

//  selectPlanItem(planItem: SelectItem) {
//    this.filter.planItemId = [planItem.value];
//  }

  async changeSmallFilter(status: string) {
    this.filter.status = status;
    await this.loadComments();
    setTimeout(() => {
      this.configureActionBar();
    }, 1000);
  }

  async searchHandle() {
    await this.loadComments();

    this.configureActionBar();
  }

  async selectOtherConference(conference: Conference) {
    this.conferenceSelect = conference;
    sessionStorage.setItem('selectedConference', JSON.stringify(conference));
    await this.prepareScreen();
    this.showSelectConference = false;
  }

  async publish(comment: ModerationComments) {
    await this.confirmationService.confirm({
      message: this.translate.instant('moderation.label.confirm_publish', {
        text: comment.text,
        citizenName: comment.citizenName
      }),
      key: 'confirm_publish',
      acceptLabel: this.translate.instant('yes'),
      rejectLabel: this.translate.instant('no'),
      accept: async () => {
        await this._publish(comment);
      },
      reject: () => {
        console.error('reject');
      },
    });
  }

  async selectCommentType(item: ModerationComments) {
    try {
      await this.moderationSrv.update({
        type: item.type,
        id: item.commentId,
      } as any);
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant('moderation.label.saved_success'),
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error', summary: this.translate.instant('error'),
        detail: this.translate.instant('moderation.error.update_comment'),
      });
    }
  }

  async moderate(comment: ModerationComments) {
    if (comment.moderatorId && !comment.moderated) {
      const person = this.userAuth.getUserInfo;
      if (person.id === comment.moderatorId) {
        await this.begin(comment);
      } else {
        await this.alterModerator(comment);
      }
    } else {
      await this.begin(comment);
    }
  }

  async begin(comment: ModerationComments) {

    comment.disableModerate = true;

    try {
      await this.moderationSrv.begin({
        id: comment.commentId,
      } as any);
      await this.route.navigate(['/moderation/moderate', comment.commentId, this.conferenceSelect.id]);
    } catch (error) {
      console.error(error);
      let msg = 'moderation.error.begin';
      if (error && error.code === 400) {
        msg = error.message;
      }
      this.messageService.add({
        severity: 'error', summary: this.translate.instant('error'),
        detail: this.translate.instant(msg),
      });
    }
  }

  async alterModerator(comment: ModerationComments) {
    const proposal = comment.type && comment.type === 'proposal';
    const msg = proposal ? 'moderation.label.confirm_alter_moderator_proposal' : 'moderation.label.confirm_alter_moderator_comment';
    await this.confirmationService.confirm({
      message: this.translate.instant(msg),
      key: 'confirm_alter_moderator',
      acceptLabel: this.translate.instant('yes'),
      rejectLabel: this.translate.instant('no'),
      accept: async () => {
        await this.begin(comment);
      },
      reject: () => {
        console.error('reject');
      },
    });
  }

  async toggleSearch() {
    this.search = !this.search;
    sessionStorage.setItem("searchState", this.search ? "show" : "hide" );
  }

  private buildBreadcrumb() {
    this.breadcrumbService.setItems([
      {label: 'administration.moderation'},
      {label: this.conferenceSelect.name, routerLink: ['/moderation/search']},
    ]);
  }

  private async _publish(comment: ModerationComments) {
    const proposal = comment.type && comment.type === 'proposal';
    const msg = proposal ? 'moderation.label.msg.publish_proposal' : 'moderation.label.msg.publish_comment';
    try {
      await this.moderationSrv.update({status: 'Published', id: comment.commentId});
      await this.prepareScreen();
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant(msg),
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error', summary: 'Erro',
        detail: this.translate.instant('moderation.error.publish_comment'),
      });
    }
  }


}
