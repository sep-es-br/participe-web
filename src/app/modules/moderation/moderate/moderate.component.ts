import { ModerateUpdate } from '@app/shared/models/moderateUpdate';
import { ModerationTreeViewItem } from '@app/shared/models/moderationTreeViewItem';
import { Conference } from '@app/shared/models/conference';
import { ConferenceService } from '@app/shared/services/conference.service';
import { ModerationService } from '@app/shared/services/moderation.service';
import { ConfirmationService, MenuItem, MessageService, SelectItem, TreeNode } from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from '@app/core/breadcrumb/breadcrumb.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HelperUtils } from '@app/shared/util/HelpersUtil';
import { ModerationComments } from '@app/shared/models/moderationComments';
import { TranslateChangeService } from '@app/shared/services/translateChange.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { ProposalEvaluationService } from '@app/shared/services/proposal-evaluation.service';
import { ProposalEvaluationCreateFormModel } from '@app/shared/models/ProposalEvaluationModel';

@Component({
  selector: 'app-moderate',
  templateUrl: './moderate.component.html',
  styleUrls: [ './moderate.component.scss' ],
})
export class ModerateComponent implements OnInit {

  microregion: SelectItem[] = [];
  regionalization: boolean;
  labelMicroregion: string;
  optionsSave: MenuItem[] = [];
  loading: boolean;
  strategyArea: TreeNode[] = [];
  selectedStrategyArea: TreeNode;
  moving: boolean;
  commentId: number;
  conferenceId: number;
  conference: Conference = new Conference();
  comment: ModerationComments = {} as ModerationComments;
  language: string;
  isCommentEvaluated: boolean = false;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService,
    private translateChange: TranslateChangeService,
    private moderationSrv: ModerationService,
    private conferenceSrv: ConferenceService,
    private proposalEvaluationService: ProposalEvaluationService,
    private activeRoute: ActivatedRoute,
    private route: Router,
  ) {
  }

  async ngOnInit() {
    await this.prepareScreen();
    this.translateChange.getCurrentLang().subscribe(({ lang }) => {
      this.language = lang;
    });
  }

  async prepareScreen() {
    this.activeRoute.params.subscribe(async ({ id, conferenceId }) => {
      this.conferenceId = +conferenceId;
      this.commentId = +id;
      await this.loadComment();
      await this.loadConference();
      await this.loadRegionalizationConference();
      await this.checkIsCommentEvaluated(this.commentId);
      if(this.regionalization){
        await this.loadLocalitiesOptions();
      }
      this.buildBreadcrumb();
    });
  }

  async loadRegionalizationConference() {
    try {
      if (this.conferenceId) {
        const data = await this.conferenceSrv.getRegionalization(this.conferenceId);
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

  async loadComment() {
    try {
      this.comment = await this.moderationSrv.getModeration(this.commentId, this.conferenceId) as ModerationComments;
      if ( !this.comment.type) {
        this.comment.type = 'Proposal';
      }
    } catch (error) {
      console.error(error);
    }
  }

  async loadConference() {
    try {
      this.conference = await this.conferenceSrv.getById(this.conferenceId);
    } catch (error) {
      console.error(error);
    }
  }

  private async checkIsCommentEvaluated(commentId: number) {
    this.isCommentEvaluated = await this.proposalEvaluationService.checkIsCommentEvaluated(commentId);
  }

  mapTree(tree: ModerationTreeViewItem): TreeNode {
    const children = _.get(tree, 'children', []) as [];
    return ({
      label: `${tree.structureItem.name} - ${tree.name}`,
      data: tree.id,
      children: children.map(x => this.mapTree(x)),
      expandedIcon: 'pi pi-folder-open',
      collapsedIcon: 'pi pi-folder',
      key: tree.id.toString(),
      selectable: true,
      styleClass: _.get(this.selectedStrategyArea, 'data', 0) === tree.id ? 'selected-tree' : undefined,
    });
  }

  async loadTreeView() {
    try {
      const result = await this.moderationSrv.getTreeView(this.commentId);
      const items = _.get(result, 'items', []) as [];
      this.strategyArea = items.map(tree => this.mapTree(tree));
    } catch (error) {
      console.error(error);
    }
  }

  async moveComment() {
    this.moving = !this.moving;
    await this.loadTreeView();
  }

  async loadLocalitiesOptions() {
    try {
      const data = await this.moderationSrv.getLocalities(this.conferenceId);
      this.microregion = _.map(data.localities, ({ id, name }) => ({ value: id, label: name }));
      //this.microregion.unshift({ value: '', label: 'Todos' });
      this.labelMicroregion = data.regionalizable;
    } catch (error) {
      this.messageService.add({
        severity: 'error', summary: 'Erro',
        detail: this.translate.instant('moderation.error.fetch.regionalization'),
      });
    }
  }

  private buildBreadcrumb() {
    this.breadcrumbService.setItems([
      { label: 'administration.moderation' },
      { label: this.conference.name, routerLink: [ '/moderation/search' ] },
    ]);
    this.populateMenuSave();
  }

  private populateMenuSave() {
    this.optionsSave.push({
      label: this.translate.instant('moderation.moderate.save.pending'),
      icon: 'pi pi-trash', command: async () => this.save('Pending'),
    });
    this.optionsSave.push({
      label: this.translate.instant('moderation.moderate.save.archived'),
      icon: 'pi pi-briefcase', command: async () => this.save('Filed'),
    });
    this.optionsSave.push({
      label: this.translate.instant('moderation.moderate.save.inTrash'),
      icon: 'pi pi-trash', command: async () => this.save('Removed'),
    });
  }

  getIcon(icon?: string) {
    return HelperUtils.loadingIcon(icon, this.loading);
  }

  async save(status: string) {
    if(this.isCommentEvaluated && status != 'Published'){
      const translateStatus = this.translate.instant(status.toLowerCase());

      this.confirmationService.confirm({
        message: this.translate.instant("moderation.moderate.confirmDeleteCommentWithPropEval.body", {status: translateStatus}),
        key: "confirmDeleteCommentWithPropEval",
        acceptLabel: this.translate.instant("yes"),
        rejectLabel: this.translate.instant("no"),
        accept: async () => {
          await this._save(status, true);
        },
        reject: () => {},
      });
    } else {
      this._save(status, false)
    }
  }

  async _save(status: string, confirmDeletePropEval: boolean) {
    try {
      const sender: ModerateUpdate = new ModerateUpdate();
      const { commentId, type, planItemId, localityId, text, duplicated } = this.comment;
      sender.id = commentId;
      sender.type = type;
      sender.planItem = _.get(this.selectedStrategyArea, 'data', planItemId);
      sender.text = text;
      sender.status = status;
      sender.duplicated = duplicated;

      if(confirmDeletePropEval) {
        await this.proposalEvaluationService.deleteProposalEvaluation(commentId)
      }

      await this.moderationSrv.update(sender);

      const proposal = this.comment.type && this.comment.type === 'prop';
      let msg = null;
      switch (status) {
        case 'Pending':
          msg = proposal ? 'moderation.label.msg.pending_proposal' : 'moderation.label.msg.pending_comment';
          break;
        case 'Published':
          msg = proposal ? 'moderation.label.msg.publish_proposal' : 'moderation.label.msg.publish_comment';
          break;
        case 'Filed':
          msg = proposal ? 'moderation.label.msg.filed_proposal' : 'moderation.label.msg.filed_comment';
          break;
        case 'Removed':
          msg = proposal ? 'moderation.label.msg.removed_proposal' : 'moderation.label.msg.removed_comment';
          break;
      }
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('success'),
        detail: this.translate.instant(msg),
      });
      setTimeout(() => {
        this.route.navigate([ '/moderation/search' ]);
      }, 2000);

    } catch (error) {
      let msg = 'moderation.error.moderator';
      if (error && error.code === 400 && error.message !== 'moderation.error.moderator') {
        msg = 'moderation.error.update_comment';
      }
      this.messageService.add({
        severity: 'error', summary: this.translate.instant('success'),
        detail: this.translate.instant(msg),
      });
      setTimeout(() => {
        this.route.navigate([ '/moderation/search' ]);
      }, 5000);
    }
  }

  async end() {
    try {
      await this.moderationSrv.end({
        id: this.comment.commentId,
      } as any);
      await this.route.navigate([ '/moderation/search' ]);
    } catch (error) {
      console.error(error);
      await this.route.navigate([ '/moderation/search' ]);
    }
  }

  timesAgo(time: string): string {
    if ( !time) {
      return '';
    }
    try {
      moment.locale(this.language);
      return moment(time).fromNow();
    } catch (error) {
      return '';
    }
  }
}
