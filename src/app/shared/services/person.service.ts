import { IPerson } from '@app/shared/interface/IPerson';
import { Injectable, Injector, Inject } from '@angular/core';
import { BaseService } from '../base/base.service';
import Common from '../util/Common';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PersonService extends BaseService<any> {
  constructor(
    @Inject(Injector) injector: Injector
  ) {
    super('person', injector);
  }

  async postOperator(profile: string, person: IPerson): Promise<any> {
    return this.http.post(
      `${this.urlBase}/operator?profile=${profile}`, JSON.stringify(person),
      { headers: await Common.buildHeaders(this.authSrv) }
    ).toPromise();
  }

}


