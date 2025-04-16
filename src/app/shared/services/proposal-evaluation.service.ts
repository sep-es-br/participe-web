
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SelectItem } from "primeng/api";
import Common from "../util/Common";

import { HttpClient, HttpParams } from "@angular/common/http";
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

  private evaluationStatusOptions: SelectItem[] = [
    { label: "Avaliado", value: "Avaliado" },
    { label: "Não Avaliado", value: "Não Avaliado" },
  ];

  private loaIncludedOptions: SelectItem[] = [
    { label: "Sim", value: true },
    { label: "Não", value: false },
  ];

  constructor(private _http: HttpClient) {}

  private getMicrorregionOptions(): SelectItem[] {
    // chamada http
    return [
      { label: "Caparaó", value: 1 },
      { label: "Central Serrana", value: 2 },
      { label: "Central Sul", value: 3 },
      { label: "Centro Oeste", value: 4 },
      { label: "Literal Sul", value: 5 },
      { label: "Metropolitana", value: 6 },
      { label: "Nordeste", value: 7 },
      { label: "Noroeste", value: 8 },
      { label: "Rio Doce", value: 9 },
      { label: "Sudeste Serrana", value: 10 },
    ];
  }

  private getThemeAreaOptions(): SelectItem[] {
    // chamada http
    return [
      { label: "01. Educação, Cultura, Esporte e Lazer", value: 1 },
      { label: "02. Segurança Pública e Justiça", value: 2 },
      { label: "03. Proteção Social, Saúde e Direitos Humanos", value: 3 },
      { label: "04. Agricultura e Meio Ambiente", value: 4 },
    ];
  }

  private getBudgetCategoryOptions(): SelectItem[] {
    // chamada http
    return [
      { label: "Saneamento Básico", value: 1 },
      { label: "Habitação", value: 2 },
      { label: "Infraestrutura Rodoviária", value: 3 },
      { label: "Transporte Público", value: 4 },
      { label: "Crédito e Regularização Fundiária", value: 5 },
    ];
  }

  private getEntityOptions(): SelectItem[] {
    // chamada http
    return [
      { label: "10101 - SVC", value: 1 },
      { label: "10102 - SCM", value: 2 },
      { label: "10103 - SECONT", value: 3 },
      { label: "10104 - SECOM", value: 4 },
      { label: "10109 - RTV-ES", value: 5 },
      { label: "10904 - FECC", value: 6 },
      { label: "16101 - PGE", value: 7 },
    ];
  }

  public getFilterOptions(): any {
    return {
      evaluationStatusOptions: this.evaluationStatusOptions,
      microrregionOptions: this.getMicrorregionOptions(),
      themeAreaOptions: this.getThemeAreaOptions(),
      budgetCategoryOptions: this.getBudgetCategoryOptions(),
      entityOptions: this.getEntityOptions(),
      loaIncludedOptions: this.loaIncludedOptions,
    };
  }

  public getProposalListForEvaluation() {
    // chamada http

    return [
      {
        id: 1,
        status: "Avaliado",
        microrregion: "Caparaó",
        descriptionText:
          "Elaborar e implementar um plano abrangente de educação e formação profissional direcionado a indivíduos detidos, visando proporcionar-lhes oportunidades significativas para adquirir novas habilidades, competências e conhecimentos que os habilitem a reintegrar-se de forma eficaz e construtiva na comunidade após o período de encarceramento.",
        themeArea: "02. Segurança Pública e Justiça",
        budgetCategory: "Segurança e Cidadania",
        entities: [
          "SEAMA",
          "PGE",
          // "PGE",
          // "PGE",
          // "PGE",
          // "PGE",
          // "PGE",
          // "PGE",
          // "PGE",
          // "PGE",
          // "PGE",
          // "PGE",
          // "PGE",
          // "PGE",
          // "PGE",
          // "PGE",
          // "PGE",
          // "PGE",
          // "PGE",
        ],
      },
      {
        id: 2,
        status: "Não Avaliado",
        microrregion: "Central Serrana",
        descriptionText:
          "Propor a inserção de um currículo dedicado à Robótica nos programas educacionais do Estado do Espírito Santo, tanto teórico quanto prático, incluindo laboratórios específicos para a aprendizagem e experimentação nesse campo. Esta iniciativa não apenas ampliaria o leque de disciplinas oferecidas, mas também prepararia os estudantes para as demandas crescentes do mercado de trabalho em áreas relacionadas à tecnologia e inovação.",
        themeArea: "01. Educação, Cultura, Esporte e Lazer",
        budgetCategory: "Educação",
        entities: [
          "SECULT",
          "SEAMA",
          "SEDU",
          "SEDES",
          // "PGE",
          // "PGE",
          // "PGE",
          // "PGE",
          // "PGE",
        ],
      },
    ];
  }

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

  public testFetchProposals(conferenceId: number): Promise<any[]> {
    const url = `http://localhost:8080/participe/proposal-evaluation?conferenceId=${conferenceId}`;
    return this._http.get<any[]>(url, { headers: Common.buildHeaders() }).toPromise<any[]>();
  }

  // public getProposalListForEvaluation() {
  //   // const url = "http://localhost:8080/participe/comments"; -> NÃO É ISSO
  //   return this._http.get(url, { headers: Common.buildHeaders() }).toPromise();
  // }

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
    const { organizationGuid, ...restSearchFilter } = searchFilter || {};
    const params = {
      conferenceId: conferenceId,
      page: pageNumber,
      size: pageSize,
      ...(organizationGuid !== undefined && organizationGuid !== null  ? { organizationGuid: organizationGuid } : { organizationGuid: [] })
    };

    const urlWithFilters = this._url + "?" + qs.stringify(restSearchFilter);

    return this._http
      .get<IResultPaginated<IProposal>>(urlWithFilters, {
        headers: Common.buildHeaders(),
        params: params,
        
      })
      .toPromise();
  }

  public getProposalEvaluationData(
    proposalId: number,
    guid: string
  ): Promise<IProposalEvaluation> {
    const params = {
      guid: guid
    }
    return this._http
      .get<IProposalEvaluation>(`${this._url}/${proposalId}`, {
        headers: Common.buildHeaders(),
        params: params
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

  public jasperxlsx(conferenceId: number, search?: IProposalEvaluationSearchFilter) {
    const { organizationGuid, ...restSearchFilter } = search || {};
    const params = {
      conferenceId: conferenceId,
      ...(organizationGuid !== undefined && organizationGuid !== null  ? { organizationGuid: organizationGuid } : { organizationGuid: [] })
    };

    const urlWithFilters = this._url + "/proposalEvaluationXlsx?" + qs.stringify(restSearchFilter);

    return this._http
      .get(urlWithFilters, {
        headers: Common.buildHeaders({
        }),
        params: params,
        responseType: 'blob' 
      })
      .toPromise()
      .then((response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'AvaliacaoDeProposta.xlsx'; 
        a.click();

        window.URL.revokeObjectURL(url);

      })
      .catch(error => {
        console.error('Error fetching report:', error);
        throw error;
      });
  }

}
