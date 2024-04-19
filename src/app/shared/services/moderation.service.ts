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
import { PaginatorState } from 'primeng/paginator';
import { IResultPaginated } from '../interface/IResultPaginated';

@Injectable({providedIn: 'root'})
export class ModerationService {



  constructor(private http: HttpClient) {
  }

  get StatusOptions(): string[] {
    return ['Pending', 'Filed', 'Removed', 'Published'];
  }

  get FromOptions(): string[] {
    return ['Presential', 'Remote'];
  }

  getModeration(moderationId: number, conferenceId: number) {
    return this.http.get<ModerationComments>(
      `${environment.apiEndpoint}/moderation/${moderationId}?conferenceId=${conferenceId}`,
      {headers: Common.buildHeaders()}
    ).toPromise();
  }

  getCommentsForModeration(conferenceId: number, filter: ModerationFilter, pageOpts: PaginatorState) {
    const localityId = filter.localityId;
    const planItensId = filter.planItemId;
    //filter.localityIds = undefined;
    //filter.planItemIds = undefined;

    const pageNumber = pageOpts.page;
    const rowsPerPage = pageOpts.rows;

    const query = {
      conferenceId,
      ...filter
    };
    const url = `${environment.apiEndpoint}/moderation${qs.stringify(query, {addQueryPrefix: true})}`
      .concat(localityId ? `&localityIds=${localityId.toString()}` : '')
      .concat(planItensId ? `&planItemIds=${planItensId.toString()}` : '')
      .concat(`&pageNumber=${pageNumber.toString()}`)
      .concat(`&rowsPerPage=${rowsPerPage.toString()}`);
    return this.http.get<IResultPaginated<ModerationComments>>(url, {headers: Common.buildHeaders()}).toPromise();
  }

  getLocalities(conferenceId: number) {
    return this.http.get<ModerationLocatliy>(`${environment.apiEndpoint}/moderation/localities/conference/${conferenceId}`,
      {headers: Common.buildHeaders()}).toPromise();
  }

  getPlanItem(conferenceId: number) {
    return this.http.get<ModerationPlanItem>(`${environment.apiEndpoint}/moderation/plan-items/conference/${conferenceId}`,
      {headers: Common.buildHeaders()}).toPromise();
  }

  getConferencesActive(isActive: boolean) {
    return this.http.get<Conference[]>(`${environment.apiEndpoint}/moderation/conferences?activeConferences=${isActive}`,
      {headers: Common.buildHeaders()}
    ).toPromise();
  }

  update(comment: ModerateUpdate): Promise<ModerationComments> {
    return this.http.put<ModerationComments>(`${environment.apiEndpoint}/moderation/${comment.id}`,
      comment,
      {headers: Common.buildHeaders()}
    ).toPromise();
  }

  begin(comment: ModerateUpdate): Promise<ModerationComments> {
    return this.http.put<ModerationComments>(`${environment.apiEndpoint}/moderation/begin/${comment.id}`,
      comment,
      {headers: Common.buildHeaders()}
    ).toPromise();
  }

  end(comment: ModerateUpdate): Promise<ModerationComments> {
    return this.http.put<ModerationComments>(`${environment.apiEndpoint}/moderation/end/${comment.id}`,
      comment,
      {headers: Common.buildHeaders()}
    ).toPromise();
  }

  getTreeView(commentId: number) {
    return this.http.get<ModerationTreeView>(
      `${environment.apiEndpoint}/moderation/treeView/${commentId}`,
      {headers: Common.buildHeaders()}
    ).toPromise();
  }

}
