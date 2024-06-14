

import { Injectable, Inject, Injector } from '@angular/core';
import { BaseService } from '../base/base.service';


@Injectable({ providedIn: 'root' })
export class ParticipationService extends BaseService<any> {
  constructor(
    @Inject(Injector) injector: Injector
  ) {
    super('participation', injector);
  }

  getHeader(conferenceId: number): Promise<{[key: string]: string}> {
    return this.http.get<{[key: string]: string}>(
      `${this.urlBase}/web-header/${conferenceId}`
    ).toPromise();
  }

}
