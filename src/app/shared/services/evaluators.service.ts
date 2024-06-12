import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "@environments/environment";

import { SelectItem } from "primeng/api";

import { TranslateService } from "@ngx-translate/core";

import Common from "../util/Common";

import { EvaluatorCreateFormModel } from "../models/EvaluatorModel";
import { IEvaluator, IEvaluatorNamesRequest, IEvaluatorNamesResponse } from "../interface/IEvaluator";
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
    name: this.translateService.instant("all"),
    lotacao: null,
  };

  private _organizationsList: Array<IEvaluatorOrganization> = [];

  public get organizationsList(): Array<IEvaluatorOrganization> {
    return this._organizationsList;
  }

  private set organizationsList(value: Array<IEvaluatorOrganization>) {
    this._organizationsList = value;
  }

  private _organizationsListSelectItem: Array<SelectItem> = [];

  public get organizationsListSelectItem(): Array<SelectItem> {
    return this._organizationsListSelectItem;
  }

  private set organizationsListSelectItem(value: Array<SelectItem>) {
    this._organizationsListSelectItem = value;
  }

  private _organizationsGuidNameMapObject: { [key: string]: string } = {};

  public get organizationsGuidNameMapObject(): { [key: string]: string } {
    return this._organizationsGuidNameMapObject;
  }

  private set organizationsGuidNameMapObject(value: { [key: string]: string }) {
    this._organizationsGuidNameMapObject = value;
  }

  constructor(private _http: HttpClient, private translateService: TranslateService) {
    if(Object.entries(this.organizationsGuidNameMapObject).length == 0){
      this.prepareOrganizationData();
    }
  }

  public getEvaluatorsList(
    pageable: IPagination
  ): Promise<IResultPaginated<IEvaluator>> {
    const params = {
      page: pageable.pageNumber,
      size: pageable.pageSize,
    };

    return this._http
      .get<IResultPaginated<IEvaluator>>(this._url, {
        headers: this.headers,
        params: params,
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

  private getOrganizationsList(): Promise<Array<IEvaluatorOrganization>> {
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
    body: IEvaluatorNamesRequest
  ): Promise<IEvaluatorNamesResponse> {
    return this._http
      .post<IEvaluatorNamesResponse>(`${this._url}/names`, body, {
        headers: this.headers,
      })
      .toPromise();
  }

  public get rolesGuidNullValue(): IEvaluatorRole {
    return this._rolesGuidNullValue;
  }

  private populateOrganizationsList(
    value: Array<IEvaluatorOrganization>
  ): void {
    this.organizationsList = value;
  }

  private populateOrganizationsGuidNameMapObject(
    value: Array<IEvaluatorOrganization>
  ): void {
    let tempObject = {};

    value.forEach((item) => {
      tempObject[item.guid] = item.name;
    });

    this.organizationsGuidNameMapObject = tempObject;
  }

  private populateOrganizationsSelectItemArray(
    value: Array<IEvaluatorOrganization>
  ): void {
    this.organizationsListSelectItem = value.map((item) => {
      return { label: item.name, value: item.guid };
    });
  }

  private async prepareOrganizationData(): Promise<void> {
    await this.getOrganizationsList().then((response) => {
      this.populateOrganizationsList(response);
      this.populateOrganizationsGuidNameMapObject(response);
      this.populateOrganizationsSelectItemArray(response);
    });
  }
}
