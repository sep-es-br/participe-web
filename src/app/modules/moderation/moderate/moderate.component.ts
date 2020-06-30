import { ModerateUpdate } from './../../../shared/models/moderateUpdate';
import { ModerationTreeViewItem } from './../../../shared/models/moderationTreeViewItem';
import { Conference } from '@app/shared/models/conference';
import { ConferenceService } from '@app/shared/services/conference.service';
import { ModerationService } from './../../../shared/services/moderation.service';
import { SelectItem, MessageService, MenuItem, TreeNode } from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from '../../../core/breadcrumb/breadcrumb.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HelperUtils } from '../../../shared/util/HelpersUtil';
import { ModerationComments } from '../../../shared/models/moderationComments';
import { TranslateChangeService } from '../../../shared/services/translateChange.service';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-moderate',
  templateUrl: './moderate.component.html',
  styleUrls: ['./moderate.component.scss']
})
export class ModerateComponent implements OnInit {

  microregion: SelectItem[] = [];
  labelMicroregion: string;
  optionsSave: MenuItem[] = [];
  loading: boolean;
  strategyArea: TreeNode[] = [];
  selectedStratgyArea: TreeNode;
  moving: boolean;
  commentId: number;
  conferenceId: number;
  conference: Conference = new Conference();
  comment: ModerationComments = {} as ModerationComments;
  language: string;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private messageService: MessageService,
    private translate: TranslateService,
    private translateChange: TranslateChangeService,
    private moderationSrv: ModerationService,
    private confereceSrv: ConferenceService,
    private activeRoute: ActivatedRoute,
    private route: Router
  ) { }

  ngOnInit() {
    this.prepareScreen();
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
      await this.loadLocalitiesOptions();
      this.buildBreadcrumb();
    });
  }

  async loadComment() {
    try {
      this.comment = await this.moderationSrv.getModeration(this.commentId, this.conferenceId);
      if (!this.comment.classification) {
        this.comment.classification = 'proposal';
      }
    } catch (error) {
      console.error(error);
    }
  }

  async loadConference() {
    try {
      this.conference = await this.confereceSrv.getById(this.conferenceId);
    } catch (error) {
      console.error(error);
    }
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
      selectable: tree.structureItem.comments,
      styleClass: _.get(this.selectedStratgyArea, 'data', 0) === tree.id ? 'selected-tree' : undefined
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

  moveComment() {
    this.moving = !this.moving;
    this.loadTreeView();
  }

  timesAgo(comment: ModerationComments): string {
    try {
      moment.locale(this.language);
      return moment(comment.time).fromNow();
    } catch (error) {
      return '';
    }
  }

  async loadLocalitiesOptions() {
    try {
      const data = await this.moderationSrv.getLocalities(this.conferenceId);
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


  private buildBreadcrumb() {
    this.breadcrumbService.setItems([
      { label: 'administration.moderation' },
      { label: this.conference.name, routerLink: ['/moderation/search'] }
    ]);
    this.populateMenuSave();
  }

  private populateMenuSave() {
    this.optionsSave.push({
      label: this.translate.instant('moderation.moderate.save.pending'),
      icon: 'pi pi-trash', command: async () => this.save('Pending')
    });
    this.optionsSave.push({
      label: this.translate.instant('moderation.moderate.save.archived'),
      icon: 'pi pi-briefcase', command: async () => this.save('Filed')
    });
    this.optionsSave.push({
      label: this.translate.instant('moderation.moderate.save.inTrash'),
      icon: 'pi pi-trash', command: async () => this.save('Removed')
    });
  }

  getIcon(icon?: string) {
    return HelperUtils.loadingIcon(icon, this.loading);
  }

  async save(status: string) {
    try {
      const sender: ModerateUpdate = new ModerateUpdate();
      const { commentId, classification, planItemId, localityId, text } = this.comment;
      sender.id = commentId;
      sender.classification = classification;
      sender.planItem = _.get(this.selectedStratgyArea, 'data', planItemId);
      sender.locality = localityId;
      sender.text = text;
      sender.status = status;

      await this.moderationSrv.update(sender);

      let proposal = this.comment.classification && this.comment.classification === 'proposal';
      let msg = null;
      switch(status) {
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
       detail: this.translate.instant(msg)
      });
      setTimeout(()=>{ this.route.navigate(['/moderation/search'])}, 2000)

    } catch (error) {
      this.messageService.add({
        severity: 'error', summary: this.translate.instant('success'),
        detail: this.translate.instant('moderation.error.update_comment')
      });
    }
  }

}
