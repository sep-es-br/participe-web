import Common from '@app/shared/util/Common';
import { HttpClient } from '@angular/common/http';
import { IResultLocalitysByConference } from '../interface/IResultLocalitysByConference';
import { Injectable } from '@angular/core';
import { Locality } from '@app/shared/models/locality';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './auth.service';

@Injectable()
export class LocalityService {
  private url = `${environment.apiEndpoint}/localities`;

  constructor(private http: HttpClient, private translateSrv: TranslateService,
              private authSrv: AuthService) { }

  async listAll(query) {
    return this.http.get<Locality[]>(`${this.url}?query=${query}`, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }

  async listAllByNameType(query, type) {
    const url = `${this.url}?query=${query}`.concat(type ? `&type=${type}` : '');
    return this.http.get<Locality[]>(url, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }

  async save(locality: Locality, edit: boolean) {
    if (edit) {
      return this.http.put<Locality>(`${this.url}/${locality.id}`, JSON.stringify(locality), { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
    } else {
      return this.http.post<Locality>(this.url, JSON.stringify(locality), { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
    }
  }

  async delete(idLocality: number, idDomain: number) {
    return this.http.delete(`${this.url}/${idLocality}/domain/${idDomain}`, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }

  async findByDomain(idDomain: number) {
    return this.http.get<Locality[]>(`${this.url}/domain/${idDomain}`, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }

  async findByConference(idConference: number) {
    return this.http.get<IResultLocalitysByConference>(`${this.url}/conference/${idConference}`, { headers: await Common.buildHeaders(this.authSrv) }).toPromise();
  }

  async getLocalitiesBasedOnConferenceCitizenAuth(idConference: number) {
    return this.http.get<IResultLocalitysByConference>(
      `${this.url}/complement/${idConference}`,
      { headers: await Common.buildHeaders(this.authSrv) }
    ).toPromise();
  }

  getTranslatedLabelLocality(label: string) {
    label = (label || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    switch (label) {
      case 'microrregiao':
        return this.translateSrv.instant('moderation.filters.microregion');
      case 'municipio':
        return this.translateSrv.instant('attendance.county');
      case 'estado':
        return this.translateSrv.instant('state');
      default:
        return this.translateSrv.instant('locality');
    }
  }
}

