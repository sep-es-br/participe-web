import {HttpClient, HttpResponse} from '@angular/common/http';
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import Common from "../util/Common";
import moment from 'moment';
import {catchError, filter, repeat, expand, skipWhile, switchMap, take, takeUntil, takeWhile, tap, timeout} from 'rxjs/operators';
import {EMPTY, throwError, timer} from 'rxjs';

@Injectable({
  providedIn: "root",
})
export class ReportService {

  private _url = `${environment.apiEndpoint}/report`;

  constructor(
    private _http: HttpClient
  ) {}

  public downloadProposeReport(conferenceId: number) {

    const $chamada = () => this._http.post(
      `${this._url}/proposeReport/${conferenceId}`,
      {}, // body vazio
      {
        headers: Common.buildNoLoaderHeaders(),
        observe: 'response',
        responseType: 'blob',
      } as const
    );

    return $chamada().pipe(

      expand(response => {
        if (response.status === 202){
          return $chamada();
        }

        return EMPTY;
      }),

      tap(response => {
        if (response.status === 200) {
          const url = window.URL.createObjectURL(response.body);
          const a = document.createElement('a');
          const today = new Date();
          a.href = url;
          a.download = `ProposalReport_${moment(today).format('YYYY_MM_DD_HH_mm')}.pdf`;
          a.click();

          window.URL.revokeObjectURL(url);
        }
      }),
      catchError(error => {
        console.error('Error fetching report:', error);
        throw error;
      })
    ).toPromise();

  }
}
