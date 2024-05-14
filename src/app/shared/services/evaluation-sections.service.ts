import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "@environments/environment";

import {
  IEvaluationSection,
  IEvaluationSectionCreate,
} from "../interface/IEvaluationSection";
import { IOrganogramaData } from "../interface/IOrganogramaData";

import Common from "../util/Common";

@Injectable({
  providedIn: "root",
})
export class EvaluationSectionsService {
  private _url = `${environment.apiEndpoint}/evaluation-sections`;
  private _urlApiOrganograma = "";
  private _urlApiAcessoCidadao = "";

  private headers: HttpHeaders = Common.buildHeaders();

  private organizationsMockList: Array<IOrganogramaData> = [
    { guid: "OrgTesteA", name: "Organização de Teste 1" },
    { guid: "OrgTesteB", name: "Organização de Teste 2" },
    { guid: "OrgTesteC", name: "Organização de Teste 3" },
  ];

  private sectionsMockList: Array<IOrganogramaData> = [
    { guid: "SectionTesteA", name: "Setor de Teste 1" },
    { guid: "SectionTesteB", name: "Setor de Teste 2" },
    { guid: "SectionTesteC", name: "Setor de Teste 3" },
  ];

  private serversMockList: Array<IOrganogramaData> = [
    {
      guid: "propidByAuthDoRelacionamentoIS_EVALUATED_BY",
      name: "Artur Uhlig de Faria",
    },
    { guid: "guid1", name: "Bruno Matos Marques Barbosa" },
    { guid: "guid2", name: "Luiz Guilherme Zortea Machado" },
    { guid: "guid3", name: "Wagner Bertolino da Cruz" },
    { guid: "guid4", name: "Diego Gutemberg Gaede" },
  ];

  constructor(private _http: HttpClient) {}

  public getOrganizationsMockList() {
    return this.organizationsMockList;
  }

  public getSectionsMockList() {
    return this.sectionsMockList;
  }

  public getServersMockList() {
    return this.serversMockList;
  }

  public getEvaluationSectionsList(): Promise<Array<IEvaluationSection>> {
    return this._http
      .get<Array<IEvaluationSection>>(this._url, {
        headers: this.headers,
      })
      .toPromise();
  }

  public postEvaluationSection(
    body: IEvaluationSectionCreate
  ): Promise<IEvaluationSection> {
    return this._http
      .post<IEvaluationSection>(this._url, body, {
        headers: this.headers,
      })
      .toPromise();
  }

  public putEvaluationSection(
    id: number,
    body: IEvaluationSectionCreate
  ): Promise<IEvaluationSection> {
    return this._http
      .put<IEvaluationSection>(`${this._url}/${id}`, body, {
        headers: this.headers,
      })
      .toPromise();
  }

  public deleteEvaluationSection(id: number): Promise<string> {
    return this._http
      .delete(`${this._url}/${id}`, {
        headers: this.headers,
        responseType: "text",
      })
      .toPromise();
  }

  /*
    - Entender melhor os endpoints
    - Entender os queryParams da url
  */

  // private getOrganizationsList(): Promise<Array<IOrganogramaData>> {
  //   return this._http
  //     .get<Array<IOrganogramaData>>(this._urlApiOrganograma, {
  //       headers: this.headers,
  //     })
  //     .toPromise();
  // }

  // private getSectionsList(
  //   organizationGuid: string
  // ): Promise<Array<IOrganogramaData>> {
  //   return this._http
  //     .get<Array<IOrganogramaData>>(this._urlApiOrganograma, {
  //       headers: this.headers,
  //       params: { organizationGuid: organizationGuid },
  //     })
  //     .toPromise();
  // }
}
