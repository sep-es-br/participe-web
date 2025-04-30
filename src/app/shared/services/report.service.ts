import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import Common from "../util/Common";

@Injectable({
  providedIn: "root",
})
export class ReportService {
  
  private _url = `${environment.apiEndpoint}/report`;

  constructor(
    private _http: HttpClient
  ) {}

  public getProposalReport(conferenceId: number) {
    const params = {
        idConference: conferenceId
    };

    return this._http
      .get(this._url + "/proposeReport", {
            headers: Common.buildHeaders(),
            params: params,
            responseType: 'blob' 
      })
      .toPromise()
      .then((response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ProposalReport.pdf`; 
        a.click();

        window.URL.revokeObjectURL(url);

      })
      .catch(error => {
        console.error('Error fetching report:', error);
        throw error;
      });
  }
}
