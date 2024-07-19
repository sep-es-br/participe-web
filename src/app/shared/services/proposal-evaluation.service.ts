import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { environment } from "@environments/environment";

import { SelectItem } from "primeng/api";

import { TranslateService } from "@ngx-translate/core";

import Common from "../util/Common";
import * as qs from "qs";

import { IResultPaginated } from "../interface/IResultPaginated";
import {
  IBudgetAction,
  IBudgetOptions,
  IBudgetUnit,
  IProposal,
  IProposalEvaluation,
  IProposalEvaluationSearchFilter,
} from "../interface/IProposal";
import { ILocalityConferenceItem } from "../interface/ILocalityConferenceItem";
import { IResultPlanItemByConference } from "../interface/IResultPlanItemByConference";

import { ProposalEvaluationCreateFormModel } from "../models/ProposalEvaluationModel";
import { Conference } from "../models/conference";

@Injectable({
  providedIn: "root",
})
export class ProposalEvaluationService {
  private evaluationStatusOptions: SelectItem[] = [];

  private loaIncludedOptions: SelectItem[] = [];

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

  private _budgetOptions: Array<IBudgetOptions> = [];

  public get budgetOptions(): Array<IBudgetOptions> {
    return this._budgetOptions;
  }

  public set budgetOptions(value: Array<IBudgetOptions>) {
    this._budgetOptions = value;
  }

  private _url = `${environment.apiEndpoint}/proposal-evaluation`;
  private _optionsUrl = `${this._url}/options`;

  constructor(
    private _http: HttpClient,
    private translateService: TranslateService
  ) {
    this.translateEvaluation();
  }

  public getEvaluationStatusOptions(): Array<SelectItem> {
    return this.evaluationStatusOptions;
  }

  public getLoaIncludedOptions(): Array<SelectItem> {
    return this.loaIncludedOptions;
  }

  public getLocalityOptions(
    conferenceId: number
  ): Promise<Array<ILocalityConferenceItem>> {
    return this._http
      .get<Array<ILocalityConferenceItem>>(
        `${this._optionsUrl}/locality?conferenceId=${conferenceId}`,
        { headers: Common.buildHeaders() }
      )
      .toPromise();
  }

  public getPlanItemAreaOptions(
    conferenceId: number
  ): Promise<Array<IResultPlanItemByConference>> {
    return this._http
      .get<Array<IResultPlanItemByConference>>(
        `${this._optionsUrl}/planItemArea?conferenceId=${conferenceId}`,
        { headers: Common.buildHeaders() }
      )
      .toPromise();
  }

  public getPlanItemOptions(
    conferenceId: number
  ): Promise<Array<IResultPlanItemByConference>> {
    return this._http
      .get<Array<IResultPlanItemByConference>>(
        `${this._optionsUrl}/planItem?conferenceId=${conferenceId}`,
        { headers: Common.buildHeaders() }
      )
      .toPromise();
  }

  public getReasonOptions(): Array<string> {
    return this.reasonOptions;
  }

  public getBudgetUnitList(): Array<IBudgetUnit> {
    return this.budgetOptions
      .map((item) => {
        return {
          budgetUnitId: item.budgetUnitId,
          budgetUnitName: item.budgetUnitName,
        };
      })
      .sort((a, b) => Number(a.budgetUnitId) - Number(b.budgetUnitId));
  }

  public getBudgetActionListByBudgetUnitId(
    budgetUnitIdValues: Array<string>
  ): Array<IBudgetAction> {
    const budgetActionList: Array<IBudgetAction> = [];

    this.budgetOptions
      .filter((item) => budgetUnitIdValues.includes(item.budgetUnitId))
      .map((item) => item.budgetActions)
      .forEach((item) => budgetActionList.push(...item));

    return budgetActionList.sort(
      (a, b) => Number(a.budgetActionId) - Number(b.budgetActionId)
    );
  }

  public getDomainConfiguration(conferenceId: number): Promise<any> {
    return this._http
      .get<any>(
        `${this._optionsUrl}/configuration?conferenceId=${conferenceId}`,
        { headers: Common.buildHeaders() }
      )
      .toPromise();
  }

  public checkIsPersonEvaluator(personId: number): Promise<string> {
    return this._http
      .get(`${this._url}/is-evaluator/${personId}`, {
        headers: Common.buildHeaders(),
        responseType: "text",
      })
      .toPromise();
  }

  public listProposalEvaluationsByConference(
    conferenceId: number,
    pageNumber: number,
    pageSize: number,
    searchFilter?: IProposalEvaluationSearchFilter
  ): Promise<IResultPaginated<IProposal>> {
    const params = {
      conferenceId: conferenceId,
      page: pageNumber,
      size: pageSize,
    };

    const urlWithFilters = this._url + "?" + qs.stringify(searchFilter);

    return this._http
      .get<IResultPaginated<IProposal>>(urlWithFilters, {
        headers: Common.buildHeaders(),
        params: params,
      })
      .toPromise();
  }

  public getProposalEvaluationData(
    proposalId: number
  ): Promise<IProposalEvaluation> {
    return this._http
      .get<IProposalEvaluation>(`${this._url}/${proposalId}`, {
        headers: Common.buildHeaders(),
      })
      .toPromise();
  }

  public postProposalEvaluation(
    body: ProposalEvaluationCreateFormModel
  ): Promise<IProposalEvaluation> {
    return this._http
      .post<IProposalEvaluation>(this._url, body, {
        headers: Common.buildHeaders(),
      })
      .toPromise();
  }

  public putProposalEvaluation(
    id: number,
    body: ProposalEvaluationCreateFormModel
  ): Promise<IProposalEvaluation> {
    return this._http
      .put<IProposalEvaluation>(`${this._url}/${id}`, body, {
        headers: Common.buildHeaders(),
      })
      .toPromise();
  }

  public deleteProposalEvaluation(
    proposalId: number,
    body?: ProposalEvaluationCreateFormModel
  ): Promise<string> {
    return this._http
      .post(`${this._url}/${proposalId}`, body, {
        headers: Common.buildHeaders(),
        responseType: "text",
      })
      .toPromise();
  }

  private fetchBudgetOptions(): Promise<Array<IBudgetOptions>> {
    return this._http
      .get<Array<IBudgetOptions>>(`${this._optionsUrl}/budgetOptions`, {
        headers: Common.buildHeaders(),
      })
      .toPromise();
  }

  public checkIsCommentEvaluated(commentId: number): Promise<boolean> {
    return this._http
      .get<boolean>(`${this._url}/isCommentEvaluated?commentId=${commentId}`, {
        headers: Common.buildHeaders(),
      })
      .toPromise();
  }

  public getConferencesActive(isActive: boolean) {
    return this._http
      .get<Conference[]>(
        `${this._url}/conferences?activeConferences=${isActive}`,
        { headers: Common.buildHeaders() }
      )
      .toPromise();
  }

  public async populateBudgetOptions(): Promise<void> {
    await this.fetchBudgetOptions().then(
      (response) => (this.budgetOptions = response)
    );
  }

  public translateEvaluation() {
    this.translateService
      .getTranslation(
        this.translateService.currentLang ?? this.translateService.defaultLang
      )
      .subscribe((translationsJSON) => {
        this.evaluationStatusOptions = [
          { label: translationsJSON["all"], value: null },
          {
            label:
              translationsJSON["proposal_evaluation"]["evaluationStatus_true"],
            value: true,
          },
          {
            label:
              translationsJSON["proposal_evaluation"]["evaluationStatus_false"],
            value: false,
          },
        ];

        this.loaIncludedOptions = [
          { label: translationsJSON["all"], value: null },
          { label: translationsJSON["yes"], value: true },
          { label: translationsJSON["no"], value: false },
        ];
      });

    this.translateService.onLangChange.subscribe((langConfig) => {
      this.evaluationStatusOptions = [
        { label: langConfig.translations["all"], value: null },
        {
          label:
            langConfig.translations["proposal_evaluation"][
              "evaluationStatus_true"
            ],
          value: true,
        },
        {
          label:
            langConfig.translations["proposal_evaluation"][
              "evaluationStatus_false"
            ],
          value: false,
        },
      ];

      this.loaIncludedOptions = [
        { label: langConfig.translations["all"], value: null },
        { label: langConfig.translations["yes"], value: true },
        { label: langConfig.translations["no"], value: false },
      ];
    });
  }
}
