import { ModerateUpdate } from './../models/moderateUpdate';
import { ModerationTreeView } from './../models/moderationTreeView';
import { Conference } from './../models/conference';
import { ModerationPlanItem } from './../models/moderationPlanItem';
import { ModerationLocatliy } from './../models/moderationLocality';
import { ModerationFilter } from './../models/moderationFilter';
import { ModerationComments } from './../models/moderationComments';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import Common from '../util/Common';
import * as qs from 'qs';

@Injectable({ providedIn: 'root' })
export class ModerationService {

  private headers = Common.buildHeaders();

  constructor(private http: HttpClient) { }


  getModeration(moderationId: number, conferenceId: number) {
    return this.http.get<ModerationComments>(
      `${environment.apiEndpoint}/moderation/${moderationId}?conferenceId=${conferenceId}`,
      { headers: this.headers }
    ).toPromise();
  }

  getCommentsForModeration(conferenceId: number, filter: ModerationFilter) {
    let localityIds = filter.localityIds;
    let planItensIds = filter.planItemIds;
    filter.localityIds = undefined;
    filter.planItemIds = undefined;
    const query = {
      conferenceId,
      ...filter
    };
    let url = `${environment.apiEndpoint}/moderation${qs.stringify(query, { addQueryPrefix: true })}`
      .concat(localityIds ? `&localityIds=${localityIds.toString()}` : '')
      .concat(planItensIds ? `&planItemIds=${planItensIds.toString()}` : '');
    return this.http.get<ModerationComments[]>(url, { headers: this.headers }).toPromise();
  }

  getLocalities(conferenceId: number) {
    return this.http.get<ModerationLocatliy>(`${environment.apiEndpoint}/moderation/localities/conference/${conferenceId}`,
      { headers: this.headers }).toPromise();
  }

  getPlanItem(conferenceId: number) {
    return this.http.get<ModerationPlanItem>(`${environment.apiEndpoint}/moderation/plan-items/conference/${conferenceId}`,
      { headers: this.headers }).toPromise();
  }

  getConferencesActive() {
    return this.http.get<Conference[]>(`${environment.apiEndpoint}/moderation/conferences`,
      { headers: this.headers }
    ).toPromise();
  }

  get StatusTypes(): string[] {
    return ['Pending', 'Filed', 'Removed', 'Published'];
  }

  get TypeParticipation(): string[] {
    return ['Presential', 'Remote'];
  }

  update(comment: ModerateUpdate): Promise<ModerationComments> {
    return this.http.put<ModerationComments>(`${environment.apiEndpoint}/moderation/${comment.id}`,
      comment,
      { headers: this.headers }
    ).toPromise();
  }

  begin(comment: ModerateUpdate): Promise<ModerationComments> {
    return this.http.put<ModerationComments>(`${environment.apiEndpoint}/moderation/begin/${comment.id}`,
      comment,
      { headers: this.headers }
    ).toPromise();
  }

  end(comment: ModerateUpdate): Promise<ModerationComments> {
    return this.http.put<ModerationComments>(`${environment.apiEndpoint}/moderation/end/${comment.id}`,
      comment,
      { headers: this.headers }
    ).toPromise();
  }

  getTreeView(commentId: number) {
    return this.http.get<ModerationTreeView>(
      `${environment.apiEndpoint}/moderation/treeView/${commentId}`,
      { headers: this.headers }
    ).toPromise();
  }

}
