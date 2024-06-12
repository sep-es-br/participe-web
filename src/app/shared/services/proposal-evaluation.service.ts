import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { environment } from "@environments/environment";

import { SelectItem } from "primeng/api";

import Common from "../util/Common";
import * as qs from 'qs';

import { IResultPaginated } from "../interface/IResultPaginated";
import { IBudgetAction, IBudgetOptions, IBudgetUnit, IProposal, IProposalEvaluation } from "../interface/IProposal";
import { ILocalityConferenceItem } from "../interface/ILocalityConferenceItem";
import { IResultPlanItemByConference } from "../interface/IResultPlanItemByConference";

import { ProposalEvaluationCreateFormModel } from "../models/ProposalEvaluationModel";


@Injectable({
  providedIn: "root",
})
export class ProposalEvaluationService {
  private evaluationStatusOptions: SelectItem[] = [
    { label: "Todos", value: null},
    { label: "Avaliado", value: true },
    { label: "Não Avaliado", value: false },
  ];
  
  private loaIncludedOptions: SelectItem[] = [
    { label: "Todos", value: null},
    { label: "Sim", value: true },
    { label: "Não", value: false },
  ];

  private reasonOptions: Array<string> = [
    "Entrega já realizada",
    "Conclusão prevista no ano vigente",
    "Restrições legais",
    "Restrições ambientais",
    "Restrições técnicas",
    "Restrições orçamentárias",
    "Não é competência estadual",
    "Não foi considerada prioridade estratégica para a microrregião",
    "Demanda não específica",
  ];

  private _domainConfigurationNamesMapObject: Object = {};

  public get domainConfigNamesObj(): Object {
    return this._domainConfigurationNamesMapObject;
  }

  public set domainConfigNamesObj(value: Object) {
    this._domainConfigurationNamesMapObject = value;
  }

  private _budgetOptions: Array<IBudgetOptions> = []

  public get budgetOptions(): Array<IBudgetOptions> {
    return this._budgetOptions;
  }

  private set budgetOptions(value: Array<IBudgetOptions>) {
    this._budgetOptions = value;
  }

  private _url = `${environment.apiEndpoint}/proposal-evaluation`;
  private _optionsUrl = `${this._url}/options`

  private headers = Common.buildHeaders();

  constructor(private _http: HttpClient) {
    if(this.budgetOptions.length == 0){
      this.populateBudgetOptions();
    }
  }

  public getEvaluationStatusOptions(): Array<SelectItem> {
    return this.evaluationStatusOptions;
  }

  public getLoaIncludedOptions(): Array<SelectItem> {
    return this.loaIncludedOptions;
  }

  public getLocalityOptions(conferenceId: number): Promise<Array<ILocalityConferenceItem>> {
    return this._http.get<Array<ILocalityConferenceItem>>(`${this._optionsUrl}/locality?conferenceId=${conferenceId}`, {headers: this.headers}).toPromise();
  }

  public getPlanItemAreaOptions(conferenceId: number): Promise<Array<IResultPlanItemByConference>> {
    return this._http.get<Array<IResultPlanItemByConference>>(`${this._optionsUrl}/planItemArea?conferenceId=${conferenceId}`, {headers: this.headers}).toPromise();
  }

  public getPlanItemOptions(conferenceId: number): Promise<Array<IResultPlanItemByConference>> {
    return this._http.get<Array<IResultPlanItemByConference>>(`${this._optionsUrl}/planItem?conferenceId=${conferenceId}`, {headers: this.headers}).toPromise();
  }

  public getReasonOptions(): Array<string> {
    return this.reasonOptions;
  }

  public getBudgetUnitList(): Array<IBudgetUnit> {
    return this.budgetOptions.map((item) => {return { budgetUnitId: item.budgetUnitId, budgetUnitName: item.budgetUnitName}}).sort((a,b) => Number(a.budgetUnitId) - Number(b.budgetUnitId));
  }

  public getBudgetActionListByBudgetUnitId(budgetUnitId: string): Array<IBudgetAction> {
    return this.budgetOptions.find((item) => item.budgetUnitId == budgetUnitId).budgetActions.sort((a,b) => Number(a.budgetActionId) - Number(b.budgetActionId));
  }

  public getDomainConfiguration(conferenceId: number): Promise<any> {
    return this._http.get<any>(`${this._optionsUrl}/configuration?conferenceId=${conferenceId}`, {headers: this.headers}).toPromise();
  }

  public checkIsPersonEvaluator(personId: number): Promise<string> {
    return this._http.get(`${this._url}/is-evaluator/${personId}`, {headers: this.headers, responseType: 'text'}).toPromise();
  }

  public listProposalEvaluationsByConference(
    conferenceId: number,
    pageNumber: number,
    pageSize: number,
    searchFilter?: any
  ): Promise<IResultPaginated<IProposal>> {
    const params = {
      conferenceId: conferenceId,
      page: pageNumber,
      size: pageSize,
    };

    const urlWithFilters = this._url + "?" + qs.stringify(searchFilter)

    return this._http
      .get<IResultPaginated<IProposal>>(urlWithFilters, {
        headers: this.headers,
        params: params,
      })
      .toPromise();
  }

  public getProposalEvaluationData(proposalId: number): Promise<IProposalEvaluation>{
    return this._http.get<IProposalEvaluation>(`${this._url}/${proposalId}`, {headers: this.headers}).toPromise();
  }

  public postProposalEvaluation(body: ProposalEvaluationCreateFormModel): Promise<IProposalEvaluation> {
    return this._http.post<IProposalEvaluation>(this._url, body, {headers: this.headers}).toPromise();
  }

  public putProposalEvaluation(id: number, body: ProposalEvaluationCreateFormModel): Promise<IProposalEvaluation> {
    return this._http.put<IProposalEvaluation>(`${this._url}/${id}`, body, {headers: this.headers}).toPromise();
  }

  public deleteProposalEvaluation(id: number): Promise<string> {
    return this._http.delete(`${this._url}/${id}`, {headers: this.headers, responseType: 'text'}).toPromise();
  }

  private fetchBudgetOptions(): Promise<Array<IBudgetOptions>> {
    return this._http.get<Array<IBudgetOptions>>(`${this._optionsUrl}/budgetOptions`, {headers: this.headers}).toPromise();
  }

  private async populateBudgetOptions(): Promise<void> {
    await this.fetchBudgetOptions().then(
      (response) => this.budgetOptions = response
    );
  }

}
