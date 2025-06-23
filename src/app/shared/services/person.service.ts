import { IPerson } from '@app/shared/interface/IPerson';
import { Injectable, Injector, Inject } from '@angular/core';
import { BaseService } from '../base/base.service';
import Common from '../util/Common';

type PapeisBySubType = {
  role: string,
  organization: string,
  organizationSh
}

@Injectable({ providedIn: 'root' })
export class PersonService extends BaseService<any> {
  constructor(
    @Inject(Injector) injector: Injector
  ) {
    super('person', injector);
  }

  postOperator(profile: string, person: IPerson): Promise<any> {
    return this.http.post(
      `${this.urlBase}/operator?profile=${profile}`, JSON.stringify(person),
      { headers: Common.buildHeaders() }
    ).toPromise();
  }

  getACRole(idPerson: number, idConference: number): Promise<any> {
    return this.http.get<any>(`${this.urlBase}/${idPerson}/ACRole/${idConference}`,{ headers: Common.buildHeaders() }).toPromise();
  }

  findPapeisBySub(sub: string): Promise<PapeisBySubType[]> {
    return this.http.get<PapeisBySubType[]>(`${this.urlBase}/${sub}/papeisBySub`).toPromise();
  }

}


