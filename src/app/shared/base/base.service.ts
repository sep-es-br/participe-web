import Common from '@app/shared/util/Common';
import { PrepareHttpQuery } from './../util/Query.utils';
import { IHttpResult } from './../interface/IHttpResult';
import { IResultPaginated } from './../interface/IResultPaginated';
import { IQueryOptions } from './../interface/IQueryOptions';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ConfirmationService } from 'primeng/api';
import { Inject, Injector } from '@angular/core';
import * as _ from 'lodash';

// tslint:disable: no-string-literal
// tslint:disable: no-shadowed-variable

export abstract class BaseService<T> {

  urlBaseDefault: string = '';
  urlBase: string = '';
  http: HttpClient;
  confirmationSrv: ConfirmationService;

  protected constructor(
    public url: string,
    @Inject(Injector) injector: Injector
  ) {
    this.urlBaseDefault = this.urlBase = `${environment.apiEndpoint}/${this.url}`;
    this.http = injector.get(HttpClient);
    this.confirmationSrv = injector.get(ConfirmationService);
  }

  setParamsFromUrl(fields: string[], values: any[]) {
    fields.forEach((f, i) => {
      this.urlBase = this.urlBaseDefault.replace(f, values[i]);
    });
  }

  public GetAllUrl<T>({ url, options }: { url: string; options?: IQueryOptions; }): Promise<IResultPaginated<T>> {
    return this.http.get<IResultPaginated<T>>(`${url}${PrepareHttpQuery(options)}`, { headers: Common.buildHeaders() }).toPromise();
  }

  public async GetAll(options?: IQueryOptions): Promise<T[]> {
    const response = await
      this.http.get<any>(`${this.urlBase}${PrepareHttpQuery(options)}`, { headers: Common.buildHeaders() }).toPromise();
    if (_.get(response, 'success', true)) {
      return _.get(response, 'data', response) as T[];
    } else {
      return undefined;
    }
  }

  public async GetAllPaginated(options?: IQueryOptions): Promise<any> {
    console.log('URL   ',this.urlBase);
    console.log('Options   ',options);
    const response = await
      this.http.get<IResultPaginated<T>>(`${this.urlBase}${PrepareHttpQuery(options)}`,
        { headers: Common.buildHeaders() }
      ).toPromise();
    if (_.get(response, 'totalPages', 0) > 0) {
      return response as IResultPaginated<T>;
    } else {
      return undefined;
    }
  }


  public async GetById(id: number, options?: IQueryOptions): Promise<IHttpResult<T>> {
    const response = await this.http.get<T>(
      `${this.urlBase}/${id}${PrepareHttpQuery(options)}`,
      { headers: Common.buildHeaders() }).toPromise();
    return {
      success: _.get(response, 'success', true),
      data: _.get(response, 'data', response),
      error: undefined
    };
  }

  public post(model: T, url?: string): Promise<T> {
    return this.http.post(url ? url : this.urlBase, model, { headers: Common.buildHeaders() }).toPromise() as Promise<T>;
  }

  public put(model: T, id: number): Promise<T> {
    return this.http.put(`${this.urlBase}/${id}`, model, { headers: Common.buildHeaders() }).toPromise() as Promise<T>;
  }

  public save(model: T, id?: number): Promise<T> {
    if (_.isNumber(id) && id > 0) {
      return this.put(model, id);
    } else {
      return this.post(model);
    }
  }

  public deleteFlush(id: number, url?: string): Promise<T> {
    return this.http.delete(`${this.urlBase}/${id}`, { headers: Common.buildHeaders() }).toPromise() as Promise<T>;
  }

  public async delete(model: T, options?: { message?: string, field?: string }) {
    const message = _.get(options, 'message');
    const field: string = _.get(options, 'field');
    return new Promise((resolve, reject) => {
      this.confirmationSrv.confirm({
        message: message || `Deseja realmente excluir o(a) ${model[field ? field : 'name']}?`,
        key: 'deleteConfirm',
        acceptLabel: 'Sim',
        rejectLabel: 'Não',
        accept: async () => {
          try {
            const result = await this.http.delete(`${this.urlBase}/${model['id']}`, { headers: Common.buildHeaders() }).toPromise();
            resolve(result['success'] || !!result);
          } catch (error) {
            reject(error);
            console.error(`delete-${this.url}-${model['id']}-reason:`, error);
          }
        },
        reject: () => {
          resolve(false);
        }
      });
    });
  }

}
