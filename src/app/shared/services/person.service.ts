import { IPerson } from '@app/shared/interface/IPerson';
import { Injectable, Injector, Inject } from '@angular/core';
import { BaseService } from '../base/base.service';
import Common from '../util/Common';

type PapeisBySubType = {
  role: string,
  organization: string,
  organizationSh
};

export type PersonsListItems = {
  sub: string,
  name: string,
  email: string,
  role: string,
  lotacao: string
};

@Injectable({ providedIn: 'root' })
export class PersonService extends BaseService<any> {

  public allNames: PersonsListItems[] = [];

  constructor(
    @Inject(Injector) injector: Injector
  ) {
    super('person', injector);
  }

  postOperator(profile: string, person: IPerson): Promise<any> {
    return this.http.post(
      `${this.urlBase}/operator?profile=${profile}`, person,
      { headers: Common.buildHeaders() }
    ).toPromise();
  }

  getACRole(idPerson: number, idConference: number): Promise<any> {
    return this.http.get<any>(`${this.urlBase}/${idPerson}/ACRole/${idConference}`,{ headers: Common.buildHeaders() }).toPromise();
  }

  findPapeisBySub(sub: string): Promise<PapeisBySubType[]> {
    return this.http.get<PapeisBySubType[]>(`${this.urlBase}/${sub}/papeisBySub`).toPromise();
  }

  findPersonBySub(sub: string) {
    return this.http.get<IPerson>(`${this.urlBase}/bySub/${sub}`).toPromise();
  }

  findPersonsOrganization(guid: string): Promise<PersonsListItems[]> {
    if (!guid) return Promise.resolve([]);
    return this.http.get<PersonsListItems[]>(`${this.urlBase}/personsByOrganization/${guid}`).toPromise();
  }

}


