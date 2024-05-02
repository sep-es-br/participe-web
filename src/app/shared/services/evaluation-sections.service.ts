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

  constructor(private _http: HttpClient) {}

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
