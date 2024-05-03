import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import Common from "../util/Common";

@Injectable({
  providedIn: "root",
})
export class EvaluationSectionsService {
  private _url = `${environment.apiEndpoint}/placeholder`;

  private headers: HttpHeaders = Common.buildHeaders();

  private data = [
    {
      entity: "SECOM - SUPERINTENDÊNCIA ESTADUAL DE COMUNICAÇÃO SOCIAL",
      section: "GAF - GRUPO ADMINISTRATIVO FINANCEIRO",
      server: "CLAUDIO MARCIO NASCIMENTO",
    },
    {
      entity: "SCM - SECRETARIA DA CASA MILITAR",
      section: "GRUPO FINANCEIRO SETORIAL-GFS-SCM",
      server: "Todos",
    },
    {
      entity: "SEAG - SECRETARIA DA AGRICULTURA, ABASTECIMENTO, AQUICULTURA",
      section: "GPO - GRUPO DE PLANEJAMENTO E ORCAMENTO-SEAG",
      server: "MAX EMANUEL FLORES EVANGELISTA CALDERARO",
    },
    {
      entity: "PGE - PROCURADORIA GERAL DO ESTADO",
      section: "GPO - GRUPO DE PLANEJAMENTO E ORCAMENTO-PGE",
      server: "CARLOS HENRIQUE DE ALMEIDA",
    },
    {
      entity: "SEAMA - SECRETARIA DO MEIO AMBIENTE E RECURSOS HÍDRICOS",
      section: "GPO - GRUPO DE PLANEJAMENTO E ORCAMENTO-SEAMA",
      server: "HAMILTON PERILO SILVA DE OLIVEIRA",
    },
    {
      entity: "SECONT - SECRETARIA DE CONTROLE E TRANSPARÊNCIA",
      section: "GPO - GRUPO DE PLANEJAMENTO E ORCAMENTO-SECONT",
      server: "LORENA DOS SANTOS SOUZA",
    },
  ];

  private entityList = [
    "SECOM - Superintendência Estadual de Comunicação Social",
    "SCM - Secretaria da Casa Militar",
    "SCV - Secretaria da Casa Civil",
    "PGE - Procuradoria Geral do Estado",
    "SEAG - Secretaria da Agricultura, Abastecimento, Aquicultura e Pesca",
    "SEAMA - Secretaria do Meio Ambiente e Recursos Hídricos",
  ];

  private sectionList = [
    "ASSESP - Assessoria Especial",
    "GPO - Grupo de Planejamento e Orçamento",
    "GETAD - Gerência Técnico Administrativa",
    "SUBEPP - Subsecretaria de Estado de Planejamento e Projetos",
  ];

  private serverList = [
    "CARLOS HENRIQUE DE ALMEIDA ESTAGIARIO JOVENS VALORES - NIVEL SUPERIOR - 20HS - CGTI - SEP - GOVES",
    "MAX EMANUEL FLORES EVANGELISTA CALDERARO CHEFE GRUPO DE PLANEJAMENTO E ORCAMENTO QCE-05 - GPO - SEP - GOVES",
    "FABIANA DO ESPIRITO SANTO CARDOSO CHEFE GRUPO RECURSOS HUMANOS QCE-05 - GRH - SEP - GOVES",
  ];

  constructor(private _http: HttpClient) {}

  public getEvaluationSectionsMock() {
    return this.data;
  }

  public getEntityListMock() {
    return this.entityList;
  }

  public getSectionListMock() {
    return this.sectionList;
  }

  public getServerListMock() {
    return this.serverList;
  }

  private getEvaluationSections(): Promise<any> {
    return this._http.get(this._url, { headers: this.headers }).toPromise();
  }

  private postEvaluationSection(body: any): Promise<any> {
    return this._http
      .post(this._url, body, { headers: this.headers })
      .toPromise();
  }

  private putEvaluationSection(id: number, body: any): Promise<any> {
    return this._http
      .put(`${this._url}/${id}`, body, { headers: this.headers })
      .toPromise();
  }
}
