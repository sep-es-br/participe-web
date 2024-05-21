import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "@environments/environment";

import {
  IEvaluationSection,
  IEvaluationSectionCreate,
} from "../interface/IEvaluationSection";
import { IEvaluatorOrganization, IEvaluatorSection, IEvaluatorServer } from "../interface/IEvaluatorData";

import Common from "../util/Common";

@Injectable({
  providedIn: "root",
})
export class EvaluationSectionsService {
  private _url = `${environment.apiEndpoint}/evaluators`;

  private headers: HttpHeaders = Common.buildHeaders();

  constructor(private _http: HttpClient) {}

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

  public getOrganizationsList(): Promise<Array<IEvaluatorOrganization>> {
    return this._http
      .get<Array<IEvaluatorOrganization>>(`${this._url}/organizations`, { headers: this.headers })
      .toPromise();
  }

  public getSectionsList(orgGuid: string): Promise<Array<IEvaluatorSection>> {
    return this._http
      .get<Array<IEvaluatorSection>>(`${this._url}/sections/${orgGuid}`, { headers: this.headers })
      .toPromise();
  }

  public getServersList(unitGuid: string): Promise<Array<IEvaluatorServer>> {
    return this._http
      .get<Array<IEvaluatorServer>>(`${this._url}/servers/${unitGuid}`, { headers: this.headers })
      .toPromise();
  }

  /*
    - Entender melhor os endpoints
    - Entender os queryParams da url
  */

  // private getOrganizationsList(): Promise<Array<IEvaluatorData>> {
  //   return this._http
  //     .get<Array<IEvaluatorData>>(this._urlApiOrganograma, {
  //       headers: this.headers,
  //     })
  //     .toPromise();
  // }

  // private getSectionsList(
  //   organizationGuid: string
  // ): Promise<Array<IEvaluatorData>> {
  //   return this._http
  //     .get<Array<IEvaluatorData>>(this._urlApiOrganograma, {
  //       headers: this.headers,
  //       params: { organizationGuid: organizationGuid },
  //     })
  //     .toPromise();
  // }
}
