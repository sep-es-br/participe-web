import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import Common from "../util/Common";
import { IOrganogramaData } from "../interface/IOrganogramaData";
import { Observable } from "rxjs";
import {
  IEvaluationSection,
  IEvaluationSectionCreate,
} from "../interface/IEvaluationSection";

@Injectable({
  providedIn: "root",
})
export class EvaluationSectionsService {
  private _url = `${environment.apiEndpoint}/evaluation-sections`;
  private _urlApiOrganograma = "";
  private _urlApiAcessoCidadao = "";

  private headers: HttpHeaders = Common.buildHeaders();

  private data = [
    {
      entity: "SECOM - SUPERINTENDÊNCIA ESTADUAL DE COMUNICAÇÃO SOCIAL",
      sections: "GAF - GRUPO ADMINISTRATIVO FINANCEIRO",
      servers: "CLAUDIO MARCIO NASCIMENTO",
    },
    {
      entity: "SCM - SECRETARIA DA CASA MILITAR",
      sections: "GRUPO FINANCEIRO SETORIAL-GFS-SCM",
      servers: "Todos",
    },
    {
      entity: "SEAG - SECRETARIA DA AGRICULTURA, ABASTECIMENTO, AQUICULTURA",
      sections: "GPO - GRUPO DE PLANEJAMENTO E ORCAMENTO-SEAG",
      servers: "MAX EMANUEL FLORES EVANGELISTA CALDERARO",
    },
    {
      entity: "PGE - PROCURADORIA GERAL DO ESTADO",
      sections: "GPO - GRUPO DE PLANEJAMENTO E ORCAMENTO-PGE",
      servers: "CARLOS HENRIQUE DE ALMEIDA",
    },
    {
      entity: "SEAMA - SECRETARIA DO MEIO AMBIENTE E RECURSOS HÍDRICOS",
      sections: "GPO - GRUPO DE PLANEJAMENTO E ORCAMENTO-SEAMA",
      servers: "HAMILTON PERILO SILVA DE OLIVEIRA",
    },
    {
      entity: "SECONT - SECRETARIA DE CONTROLE E TRANSPARÊNCIA",
      sections: "GPO - GRUPO DE PLANEJAMENTO E ORCAMENTO-SECONT",
      servers: "LORENA DOS SANTOS SOUZA",
    },
  ];

  // private entityList = [
  //   "SECOM - Superintendência Estadual de Comunicação Social",
  //   "SCM - Secretaria da Casa Militar",
  //   "SCV - Secretaria da Casa Civil",
  //   "PGE - Procuradoria Geral do Estado",
  //   "SEAG - Secretaria da Agricultura, Abastecimento, Aquicultura e Pesca",
  //   "SEAMA - Secretaria do Meio Ambiente e Recursos Hídricos",
  // ];

  // private sectionList = [
  //   "ASSESP - Assessoria Especial",
  //   "GPO - Grupo de Planejamento e Orçamento",
  //   "GETAD - Gerência Técnico Administrativa",
  //   "SUBEPP - Subsecretaria de Estado de Planejamento e Projetos",
  // ];

  // private serverList = [
  //   "CARLOS HENRIQUE DE ALMEIDA ESTAGIARIO JOVENS VALORES - NIVEL SUPERIOR - 20HS - CGTI - SEP - GOVES",
  //   "MAX EMANUEL FLORES EVANGELISTA CALDERARO CHEFE GRUPO DE PLANEJAMENTO E ORCAMENTO QCE-05 - GPO - SEP - GOVES",
  //   "FABIANA DO ESPIRITO SANTO CARDOSO CHEFE GRUPO RECURSOS HUMANOS QCE-05 - GRH - SEP - GOVES",
  // ];

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

  public getEvaluationSectionsMock() {
    return this.data;
  }

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
      .delete<string>(`${this._url}/${id}`, { headers: this.headers })
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
