import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SelectItem } from "primeng/api";
import Common from "../util/Common";

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
}
