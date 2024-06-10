import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { environment } from "@environments/environment";

import { SelectItem } from "primeng/api";

import Common from "../util/Common";
import * as qs from 'qs';

import { IResultPaginated } from "../interface/IResultPaginated";
import { IProposal, IProposalEvaluation } from "../interface/IProposal";
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

  private _url = `${environment.apiEndpoint}/proposal-evaluation`;
  private _optionsUrl = `${this._url}/options`

  private headers = Common.buildHeaders();

  private _orgGuidNameMapObj: { [key: string]: string } = {};

  constructor(private _http: HttpClient) {}

  public get orgGuidNameMapObj(): { [key: string]: string } {
    return this._orgGuidNameMapObj;
  }

  public set orgGuidNameMapObj(value: {[key: string]: string}) {
    this._orgGuidNameMapObj = value
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

  public getDomainConfiguration(conferenceId: number): Promise<any> {
    return this._http.get<any>(`${this._optionsUrl}/configuration?conferenceId=${conferenceId}`, {headers: this.headers}).toPromise();
  }

  // NÃO FUNCIONA erro 401
  // Entender auth melhor
  // public testFetchBudgetConfig() {
  //   const url = "http://10.243.135.33/pentaho/plugin/cda/api/doQuery?path=/public/dashboard/orcamento/dash_unidade.cda&dataAccessId=qUnidade";
  //   const headers = new HttpHeaders({
  //     Authorization: 'Basic YXJ0dXIuZmFyaWE6NTE0MjYzQHVG'
  //   });

  //   return this._http.get(url, {headers: headers}).toPromise();
  // }

  public populateBudgetUnitOptions() {
    return [
      "10101 - SVC",
      "10102 - SCM",
      "10103 - SECONT",
      "10104 - SECOM",
      "10109 - RTV-ES",
      "10904 - FECC",
      "16101 - PGE",
    ];
  }

  public populateBudgetActionOptions() {
    return [
      "1051 - Construção, Ampliação e Modernização da Rede de Serviços de Saúde do Estado",
      "2619 - Seleção e Premiação de Projetos Culturais",
      "2971 - Selecção e Premiação de Projetos de Patrimônio",
      "8683 - Desenvolvimento Integrado e Esporte e Cultura nas Escolas",
      "8657 - Expansão, Qualificação e Desenvolvimento da Oferta de Cursos Técnicos de Nível Médio",
    ];
  }

  public populateBudgetPlanOptions() {
    return [
      "1051 - Construção, Ampliação e Modernização da Rede de Serviços de Saúde do Estado",
      "2619 - Seleção e Premiação de Projetos Culturais",
      "2971 - Selecção e Premiação de Projetos de Patrimônio",
      "8683 - Desenvolvimento Integrado e Esporte e Cultura nas Escolas",
      "8657 - Expansão, Qualificação e Desenvolvimento da Oferta de Cursos Técnicos de Nível Médio",
    ];
  }

  public populateReasonOptions() {
    return [
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
}
