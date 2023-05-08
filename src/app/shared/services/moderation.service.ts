import {ModerateUpdate} from './../models/moderateUpdate';
import {ModerationTreeView} from './../models/moderationTreeView';
import {Conference} from './../models/conference';
import {ModerationPlanItem} from './../models/moderationPlanItem';
import {ModerationLocatliy} from './../models/moderationLocality';
import {ModerationFilter} from './../models/moderationFilter';
import {ModerationComments} from './../models/moderationComments';
import {Injectable} from '@angular/core';
import {environment} from '@environments/environment';
import {HttpClient} from '@angular/common/http';
import Common from '../util/Common';
import * as qs from 'qs';
import { AuthService } from './auth.service';

@Injectable({providedIn: 'root'})
export class ModerationService {

  constructor(private http: HttpClient, private authSrv: AuthService) {
  }

  get StatusOptions(): string[] {
    return ['Pending', 'Filed', 'Removed', 'Published'];
  }

  get FromOptions(): string[] {
    return ['Presential', 'Remote'];
  }

  async getModeration(moderationId: number, conferenceId: number) {
    return this.http.get<ModerationComments>(
      `${environment.apiEndpoint}/moderation/${moderationId}?conferenceId=${conferenceId}`,
      {headers: await Common.buildHeaders(this.authSrv)}
    ).toPromise();
  }

  async getCommentsForModeration(conferenceId: number, filter: ModerationFilter) {
    const localityId = filter.localityId;
    const planItensId = filter.planItemId;
    //filter.localityIds = undefined;
    //filter.planItemIds = undefined;
    const query = {
      conferenceId,
      ...filter
    };
    const url = `${environment.apiEndpoint}/moderation${qs.stringify(query, {addQueryPrefix: true})}`
      .concat(localityId ? `&localityIds=${localityId.toString()}` : '')
      .concat(planItensId ? `&planItemIds=${planItensId.toString()}` : '');
    return this.http.get<ModerationComments[]>(url, {headers: await Common.buildHeaders(this.authSrv)}).toPromise();
  }

  async getLocalities(conferenceId: number) {
    return this.http.get<ModerationLocatliy>(`${environment.apiEndpoint}/moderation/localities/conference/${conferenceId}`,
      {headers: await Common.buildHeaders(this.authSrv)}).toPromise();
  }

  async getPlanItem(conferenceId: number) {
    return this.http.get<ModerationPlanItem>(`${environment.apiEndpoint}/moderation/plan-items/conference/${conferenceId}`,
      {headers: await Common.buildHeaders(this.authSrv)}).toPromise();
  }

  async getConferencesActive(isActive: boolean) {
    return this.http.get<Conference[]>(`${environment.apiEndpoint}/moderation/conferences?activeConferences=${isActive}`,
      {headers: await Common.buildHeaders(this.authSrv)}
    ).toPromise();
  }

  async update(comment: ModerateUpdate): Promise<ModerationComments> {
    return this.http.put<ModerationComments>(`${environment.apiEndpoint}/moderation/${comment.id}`,
      comment,
      {headers: await Common.buildHeaders(this.authSrv)}
    ).toPromise();
  }

  async begin(comment: ModerateUpdate): Promise<ModerationComments> {
    return this.http.put<ModerationComments>(`${environment.apiEndpoint}/moderation/begin/${comment.id}`,
      comment,
      {headers: await Common.buildHeaders(this.authSrv)}
    ).toPromise();
  }

  async end(comment: ModerateUpdate): Promise<ModerationComments> {
    return this.http.put<ModerationComments>(`${environment.apiEndpoint}/moderation/end/${comment.id}`,
      comment,
      {headers: await Common.buildHeaders(this.authSrv)}
    ).toPromise();
  }

  async getTreeView(commentId: number) {
    return this.http.get<ModerationTreeView>(
      `${environment.apiEndpoint}/moderation/treeView/${commentId}`,
      {headers: await Common.buildHeaders(this.authSrv)}
    ).toPromise();
  }

}
