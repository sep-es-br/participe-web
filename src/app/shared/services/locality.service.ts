import Common from '@app/shared/util/Common';
import { HttpClient } from '@angular/common/http';
import { IResultLocalitysByConference } from '../interface/IResultLocalitysByConference';
import { Injectable } from '@angular/core';
import { Locality } from '@app/shared/models/locality';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class LocalityService {
  private url = `${environment.apiEndpoint}/localities`;
  private headers = Common.buildHeaders();

  constructor(private http: HttpClient, private translateSrv: TranslateService) { }

  listAll(query) {
    return this.http.get<Locality[]>(`${this.url}?query=${query}`, { headers: this.headers }).toPromise();
  }

  listAllByNameType(query, type) {
    const url = `${this.url}?query=${query}`.concat(type ? `&type=${type}` : '');
    return this.http.get<Locality[]>(url, { headers: this.headers }).toPromise();
  }

  save(locality: Locality, edit: boolean) {
    if (edit) {
      return this.http.put<Locality>(`${this.url}/${locality.id}`, JSON.stringify(locality), { headers: this.headers }).toPromise();
    } else {
      return this.http.post<Locality>(this.url, JSON.stringify(locality), { headers: this.headers }).toPromise();
    }
  }

  delete(idLocality: number, idDomain: number) {
    return this.http.delete(`${this.url}/${idLocality}/domain/${idDomain}`, { headers: this.headers }).toPromise();
  }

  findByDomain(idDomain: number) {
    return this.http.get<Locality[]>(`${this.url}/domain/${idDomain}`, { headers: this.headers }).toPromise();
  }

  findByConference(idConference: number) {
    return this.http.get<IResultLocalitysByConference>(`${this.url}/conference/${idConference}`, { headers: this.headers }).toPromise();
  }

  getLocalitiesBasedOnConferenceCitizenAuth(idConference: number) {
    return this.http.get<IResultLocalitysByConference>(
      `${this.url}/complement/${idConference}`,
      { headers: this.headers }
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

