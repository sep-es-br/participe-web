import { Injectable, Inject, Injector } from '@angular/core';
import { BaseService } from '../base/base.service';
import Common from '../util/Common';
// import { IPreRegistration } from '../interfaces/IPreRegistration';

interface IItem {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class PreRegistrationService extends BaseService<any> {

  constructor(
    @Inject(Injector) injector: Injector
  ) {
    super('pre-registration', injector);
  }

  checkIn(preRegistrationId: number,meetingId: number){
    const sender = {
        preRegistrationId: preRegistrationId,
        meetingId: meetingId
    };
    return this.http.post<any>(`${this.urlBase}/check-in`,sender,{ headers: Common.buildHeaders() }).toPromise();
  }

}
