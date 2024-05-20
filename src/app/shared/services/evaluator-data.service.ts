import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import Common from "../util/Common";
import { IEvaluatorOrganization, IEvaluatorSection, IEvaluatorServer } from "../interface/IEvaluatorData";

@Injectable({
  providedIn: "root",
})
export class EvaluatorDataService {
  private _url = `${environment.apiEndpoint}/evaluator-data`;

  private headers: HttpHeaders = Common.buildHeaders();

  constructor(private _http: HttpClient) {}

  public getOrganizationsList(): Promise<Array<IEvaluatorOrganization>> {
    return this._http
      .get<Array<IEvaluatorOrganization>>(`${this._url}/organizations`, { headers: this.headers })
      .toPromise();
  }

  public getSectionsList(): Promise<Array<IEvaluatorSection>> {
    return this._http
      .get<Array<IEvaluatorSection>>(`${this._url}/sections`, { headers: this.headers })
      .toPromise();
  }

  public getServersList(): Promise<Array<IEvaluatorServer>> {
    return this._http
      .get<Array<IEvaluatorServer>>(`${this._url}/servers`, { headers: this.headers })
      .toPromise();
  }
}
