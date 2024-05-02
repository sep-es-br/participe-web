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

  constructor(private _http: HttpClient) {}

  public getEvaluationSectionsMock() {
    return this.data;
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
