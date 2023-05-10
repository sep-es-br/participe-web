import * as _ from 'lodash';

import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { Injectable } from '@angular/core';
import { LoadingService } from '../services/loading.service';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {

  isRefreshingToken = false;

  constructor(
    private authService: AuthService,
    private loadingService: LoadingService,
    private messageSrv: MessageService,
    private translateSrv: TranslateService,
    private route: Router,
  ) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const hideLoading = !!req.headers.get('x-hidden-loading');
    this.loadingService.loading(!hideLoading);

    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        return hideLoading
          ? this.handleNoLoading(event)
          : this.handleLoading(event);
      }),
      catchError((error: HttpErrorResponse) => {
        if ([422, 404, 400].indexOf(error.status) > -1) {
          const message = _.get(error, 'error.message') || _.get(error, 'message') || this.translateSrv.instant('generic.error');
          this.messageSrv.add({
            severity: 'warn',
            detail: this.translateSrv.instant(message)
          });
        } else if (error.status === 403) {
          this.messageSrv.add({
            severity: 'warn',
            detail: this.translateSrv.instant('unauthorized.error')
          });
        }
        else if (error.status === 401) {
          return this.handleUnauthorized(req, next);
        }
        this.loadingService.updateProgressLoading(100);
        return throwError({ ...error });
      }),
      finalize(() => {
        this.loadingService.loading(false);
      })
    );
  }

  handleUnauthorized(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (!this.isRefreshingToken) {
        this.isRefreshingToken = true;

        // get a new token via userService.refreshToken
        return from(this.authService.refresh())
            .pipe(switchMap((newToken: boolean) => {
                // did we get a new token retry previous request
                if (newToken) {
                  const accessToken = this.authService.getAccessToken();
                  const headers = new HttpHeaders(accessToken ? { Authorization: `Bearer ${accessToken}` } : { }) ;
                  req = req.clone({ headers });
                  return next.handle(req);
                }

                // If we don't get a new token, we are in trouble so logout.
                this.route.navigate(['/login']);
                this.messageSrv.add({
                  summary: this.translateSrv.instant('error'),
                  severity: 'warn',
                  detail: this.translateSrv.instant('expired.error')
                });
                return of(new HttpResponse({
                  body: {
                    success: false,
                    data: null,
                    message: this.translateSrv.instant('expired.error'),
                  }
                }));
            }),
            catchError(error => {
              this.route.navigate(['/login']);
              this.messageSrv.add({
                summary: this.translateSrv.instant('error'),
                severity: 'warn',
                detail: this.translateSrv.instant('expired.error')
              });
              return of(new HttpResponse({
                body: {
                  success: false,
                  data: null,
                  message: this.translateSrv.instant('expired.error'),
                }
              }));
            }),
            finalize(() => {
              this.isRefreshingToken = false;
            })
        );
    } else {
      return next.handle(req);
    }
  }


  handleLoading(event: HttpEvent<any>) {
    switch (event.type) {
      case HttpEventType.Response:
        this.loadingService.updateProgressLoading(100);
        return event;
      case HttpEventType.Sent:
        this.loadingService.updateProgressLoading(15);
        break;
      case HttpEventType.UploadProgress:
        this.loadingService.updateProgressLoading(
          !!event.total ? ((event.loaded / event.total) * 35) + 15 : 35
        );
        break;
      case HttpEventType.ResponseHeader:
        this.loadingService.updateProgressLoading(50);
        break;
      case HttpEventType.DownloadProgress:
        this.loadingService.updateProgressLoading(
          !!event.total ? ((event.loaded / event.total) * 25) + 50 : 75
        );
        break;
      default:
        break;
    }
  }

  handleNoLoading(event: HttpEvent<any>) {
    if (event instanceof HttpResponse) {
      return event;
    }
  }
}


