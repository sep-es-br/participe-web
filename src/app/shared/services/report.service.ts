import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import Common from "../util/Common";
import * as moment from "moment";
import { catchError, filter, skipWhile, switchMap, take, takeUntil, takeWhile, tap, timeout } from "rxjs/operators";
import { throwError, timer } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ReportService {
  
  private _url = `${environment.apiEndpoint}/report`;

  constructor(
    private _http: HttpClient
  ) {}

  public getProposalReport(conferenceId: number) {
    const params = { idConference: conferenceId };

    return new Promise<Blob>((resolve, reject) => {
      this._http.post<{ uuid: string }>(
        `${this._url}/proposeReport`,
        {}, // body vazio
        {
          headers: Common.buildNoLoaderHeaders(),
          params: params
        }
      ).pipe(
        switchMap(({ uuid }) => {
          // polling: checa status a cada 1s
          return timer(0, 1000).pipe(
            switchMap(() => 
              this._http.get<{ status: string }>(
                `${this._url}/proposeReport/${uuid}/status`,
                { headers: Common.buildNoLoaderHeaders() }
              )
            ),
            skipWhile(({ status }) => status === 'PROCESSING'),
            take(1),
            switchMap(({ status }) => {
              if (status === 'DONE') {
                return this._http.get(`${this._url}/proposeReport/${uuid}/download`, {
                  headers: Common.buildNoLoaderHeaders(),
                  responseType: 'blob'
                });
              } else {
                return throwError(() => new Error('Erro ao gerar relatório'));
              }
            })
          );
        })
      ).subscribe({
        next: (blob: Blob) => resolve(blob),
        error: (err) => reject(err)
      });
    })
    .then((response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        const today = new Date();
        a.href = url;
        a.download = `ProposalReport_${moment(today).format('YYYY_MM_DD_HH_mm')}.pdf`; 
        a.click();

        window.URL.revokeObjectURL(url);

    })
    .catch(error => {
      console.error('Error fetching report:', error);
      throw error;
    });


    // return this._http
    //   .get(this._url + "/proposeReport", {
    //         headers: Common.buildHeaders(),
    //         params: params,
    //         responseType: 'blob' 
    //   }).pipe(timeout(5 * 60 * 1000))
    //   .toPromise()
    //   .then((response: Blob) => {
    //     const url = window.URL.createObjectURL(response);
    //     const a = document.createElement('a');
    //     const today = new Date();
    //     a.href = url;
    //     a.download = `ProposalReport_${moment(today).format('YYYY_MM_DD_HH_mm')}.pdf`; 
    //     a.click();

    //     window.URL.revokeObjectURL(url);

    //   })
    //   .catch(error => {
    //     console.error('Error fetching report:', error);
    //     throw error;
    //   });
  }
}
