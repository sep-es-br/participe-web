import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "@environments/environment";

import Common from "../util/Common";

import { EvaluatorCreateFormModel } from "../models/EvaluatorModel";
import { IEvaluator, IEvaluatorNames } from "../interface/IEvaluator";
import {
  IEvaluatorOrganization,
  IEvaluatorSection,
  IEvaluatorRole,
} from "../interface/IEvaluatorData";
import { IPagination } from "../interface/IPagination";
import { IResultPaginated } from "../interface/IResultPaginated";

@Injectable({
  providedIn: "root",
})
export class EvaluatorsService {
  private _url = `${environment.apiEndpoint}/evaluators`;

  private headers: HttpHeaders = Common.buildHeaders();

  private _rolesGuidNullValue: IEvaluatorRole = {
    guid: null,
    name: "Todos",
    lotacao: null,
  };

  constructor(private _http: HttpClient) {}

  public getEvaluatorsList(pageable: IPagination): Promise<IResultPaginated<IEvaluator>> {
    const params = {
      page: pageable.pageNumber,
      size: pageable.pageSize
    }

    return this._http
      .get<IResultPaginated<IEvaluator>>(this._url, {
        headers: this.headers,
        params: params
      })
      .toPromise();
  }

  public postEvaluator(body: EvaluatorCreateFormModel): Promise<IEvaluator> {
    return this._http
      .post<IEvaluator>(this._url, body, {
        headers: this.headers,
      })
      .toPromise();
  }

  public putEvaluator(
    id: number,
    body: EvaluatorCreateFormModel
  ): Promise<IEvaluator> {
    return this._http
      .put<IEvaluator>(`${this._url}/${id}`, body, {
        headers: this.headers,
      })
      .toPromise();
  }

  public deleteEvaluator(id: number): Promise<string> {
    return this._http
      .delete(`${this._url}/${id}`, {
        headers: this.headers,
        responseType: "text",
      })
      .toPromise();
  }

  public getOrganizationsList(): Promise<Array<IEvaluatorOrganization>> {
    return this._http
      .get<Array<IEvaluatorOrganization>>(`${this._url}/organizations`, {
        headers: this.headers,
      })
      .toPromise();
  }

  public getSectionsList(orgGuid: string): Promise<Array<IEvaluatorSection>> {
    return this._http
      .get<Array<IEvaluatorSection>>(`${this._url}/sections/${orgGuid}`, {
        headers: this.headers,
      })
      .toPromise();
  }

  public getRolesList(unitGuid: string): Promise<Array<IEvaluatorRole>> {
    return this._http
      .get<Array<IEvaluatorRole>>(`${this._url}/roles/${unitGuid}`, {
        headers: this.headers,
      })
      .toPromise();
  }

  public getNamesFromGuidLists(
    body: IEvaluatorNames
  ): Promise<{ [key: string]: string }> {
    return this._http
      .post<{ [key: string]: string }>(`${this._url}/names`, body, {
        headers: this.headers,
      })
      .toPromise();
  }

  public get rolesGuidNullValue(): IEvaluatorRole {
    return this._rolesGuidNullValue;
  }
}
