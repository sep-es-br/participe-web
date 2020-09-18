import { ActionBarService } from './../../core/actionbar/app.actionbar.actions.service';
import { Conference } from './../../shared/models/conference';
import { ModerationComments } from './../../shared/models/moderationComments';
import { ModerationFilter } from './../../shared/models/moderationFilter';
import { ModerationService } from './../../shared/services/moderation.service';
import { HelperUtils } from './../../shared/util/HelpersUtil';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreadcrumbService } from '../../core/breadcrumb/breadcrumb.service';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { calendar } from '../../shared/constants';
import { TranslateChangeService } from '../../shared/services/translateChange.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { AuthService } from '@app/shared/services/auth.service';
@Component({
  selector: 'app-moderation',
  templateUrl: './moderation.component.html',
  styleUrls: ['./moderation.component.scss']
})
export class ModerationComponent implements OnInit, OnDestroy {

  search: boolean;
  loading: boolean;
  status: SelectItem[] = [];
  typeOfParticipation: SelectItem[] = [];
  calendarTranslate: any;
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
    private actionBarSrv: ActionBarService,
    private route: Router,
    private userAuth: AuthService
  ) { }

  ngOnDestroy(): void {
    this.actionBarSrv.setItems([]);
  }

  async ngOnInit() {
    await this.loadConferencesActives();
    await this.prepareScreen();
    this.translateChange.getCurrentLang().subscribe(({ lang }) => {
      this.language = lang;
      this.calendarTranslate = calendar[lang];
      this.populateOptions();
    });
  }

  populateOptions() {
    const allLabel = this.translate.instant('all');

    this.typeOfParticipation = this.moderationSrv.TypeParticipation.map(type => (
      { value: type, label: this.translate.instant(`moderation.label.${type.toLowerCase()}`) }
    ));
    this.typeOfParticipation.unshift({ value: '', label: allLabel });

    this.status = this.moderationSrv.StatusTypes.map(status => ({ value: status, label: this.translate.instant(status.toLowerCase()) }));
    this.status.unshift({ value: allLabel, label: allLabel });


    this.filter.type = '';
  }

  async prepareScreen() {
    this.filter.status = 'Pending';

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
      { position: 'RIGHT', label: `${this.conferenceComments.length} Textos`, icon: 'comment.svg' },
      {
        position: 'LEFT', handle: () => {
          this.showSelectConference = !this.showSelectConference;
        }, icon: 'change.svg'
      }
    ]);
  }

  async loadConferencesActives() {
    try {
      const data = await this.moderationSrv.getConferencesActive();
      this.conferencesActives = data;
      if (data.length > 0) {
        this.conferenceSelect = data[0];
      }
    } catch (error) {
      console.error(error);
      this.messageService.add({
        severity: 'error', summary: 'Erro',
        detail: this.translate.instant('moderation.error.fetch.comments')
      });
    }
  }

  async loadComments() {
    try {
      const data = await this.moderationSrv.getCommentsForModeration(this.conferenceSelect.id, this.filter);
      this.conferenceComments = data;
    } catch (error) {
      this.messageService.add({
        severity: 'error', summary: 'Erro',
        detail: this.translate.instant('moderation.error.fetch.comments')
      });
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
      const data = await this.moderationSrv.getLocalities(this.conferenceSelect.id);
      this.microregion = _.map(data.localities, ({ id, name }) => ({ value: id, label: name }));
      this.microregion.unshift({ value: '', label: 'Todos' });
      this.labelMicroregion = data.regionalizable;
    } catch (error) {
      this.messageService.add({
        severity: 'error', summary: 'Erro',
        detail: this.translate.instant('moderation.error.fetch.regionalization')
      });
    }
  }

  async loadPlanItems() {
    try {
      const data = await this.moderationSrv.getPlanItem(this.conferenceSelect.id);
      this.planItem = _.map(_.get(data, 'planItems', []),
        ({ planItemId, planItemName }) => ({ value: planItemId, label: planItemName }));
      this.planItem.unshift({ value: '', label: 'Todos' });
      this.labelPlanItem = _.get(data, 'structureItemName');
    } catch (error) {
      this.messageService.add({
        severity: 'error', summary: 'Erro',
        detail: this.translate.instant('moderation.error.fetch.planItems')
      });
    }
  }

  private buildBreadcrumb() {
    this.breadcrumbService.setItems([
      { label: 'administration.moderation' },
      { label: this.conferenceSelect.name, routerLink: ['/moderation/search'] }
    ]);
  }

  getIcon(icon?: string) {
    return HelperUtils.loadingIcon(icon, this.loading);
  }

  changeDate(field: string, event) {
    this.filter[field] = moment(event).format('DD/MM/yyyy');
  }

  selectLocality(locality: SelectItem) {
    this.filter.localityIds = [locality.value];
  }

  selectPlanItem(planItem: SelectItem) {
    this.filter.planItemIds = [planItem.value];
  }

  changeSmallFilter(status: string) {
    this.filter.status = status;
    this.loadComments();
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
    this.prepareScreen();
    this.showSelectConference = false;
  }

  private async _publish(comment: ModerationComments) {
    const proposal = comment.classification && comment.classification === 'proposal';
    const msg = proposal ? 'moderation.label.msg.publish_proposal' : 'moderation.label.msg.publish_comment';
    try {
      await this.moderationSrv.update({ status: 'Published', id: comment.commentId });
      await this.prepareScreen();
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant(msg)
       });
    } catch (error) {
      this.messageService.add({
        severity: 'error', summary: 'Erro',
        detail: this.translate.instant('moderation.error.publish_comment')
      });
    }
  }

  publish(comment: ModerationComments) {
    this.confirmationService.confirm({
      message: this.translate.instant('moderation.label.confirm_publish', { text: comment.text, citizenName: comment.citizenName }),
      key: 'confirm_publish',
      acceptLabel: this.translate.instant('yes'),
      rejectLabel: this.translate.instant('no'),
      accept: () => {
        this._publish(comment);
      },
      reject: () => {
        console.log('reject');
      }
    });
  }

  async selectClassificationComment(item: ModerationComments) {
    try {
      await this.moderationSrv.update({
        classification: item.classification,
        id: item.commentId
      } as any);
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant('moderation.label.saved_success')
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error', summary: this.translate.instant('error'),
        detail: this.translate.instant('moderation.error.update_comment')
      });
    }
  }

  async moderate(comment: ModerationComments) {
    if (comment.moderatorId && !comment.moderated) {
      const person = this.userAuth.getUserInfo;
      if (person.id == comment.moderatorId) {
        this.begin(comment);
      } else {
        this.alterModerator(comment);
      }
    } else {
      this.begin(comment);
    }
  }

  async begin(comment: ModerationComments) {
    console.log(comment);
    try {
      await this.moderationSrv.begin({
        id: comment.commentId
      } as any);
      this.route.navigate(['/moderation/moderate', comment.commentId, this.conferenceSelect.id]);
    } catch (error) {
      console.log(error);
      let msg = 'moderation.error.begin';
      if (error && error.code == 400) {
        msg = error.message;
      }
      this.messageService.add({
        severity: 'error', summary: this.translate.instant('error'),
        detail: this.translate.instant(msg)
      });
    }
  }

  alterModerator(comment: ModerationComments) {
    const proposal = comment.classification && comment.classification === 'proposal';
    const msg = proposal ? 'moderation.label.confirm_alter_moderator_proposal' : 'moderation.label.confirm_alter_moderator_comment';
    this.confirmationService.confirm({
      message: this.translate.instant(msg),
      key: 'confirm_alter_moderator',
      acceptLabel: this.translate.instant('yes'),
      rejectLabel: this.translate.instant('no'),
      accept: () => {
        this.begin(comment);
      },
      reject: () => {
        console.log('reject');
      }
    });
  }


}
