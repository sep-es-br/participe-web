import { Inject } from '@angular/core';
import * as _ from 'lodash';
import { LazyLoadEvent } from 'primeng/api';
import { ITableCol } from './../interface/ITableCol';
import { getValueCol } from './../util/Get-value-col.util';
import { BaseService } from './base.service';

export abstract class BasePageList<T> {

  enableSearch: boolean = false;
  search?: any;
  data: T[];
  page: number = 0;
  totalRecords: number = 0;
  pageSize: number = 10;
  sort: string = '';
  cols: ITableCol[];
  service: BaseService<T>;
  mapElementHandle: any;

  protected constructor(
    @Inject(BaseService) service: BaseService<T>
  ) {
    this.service = service;
  }

  async loadData(event?: LazyLoadEvent) {
    if (event) {
      this.page = event.first > 0 ? (event.first / this.pageSize) : 0;
      if (event.sortField) {
        this.sort = `${event.sortField},${event.sortOrder === 1 ? 'asc' : 'desc'}`;
      }
    }
    const response = await this.service.GetAllPaginated({
      page: this.page,
      pageSize: this.pageSize,
      sort: this.sort,
      search: Object.keys(this.search).reduce((a, key) => {
        const value = this.search[key];
        a[key] = value instanceof Array ? value.join(', ') : value;
        return a;
      }, { })
    });
    this.totalRecords = _.get(response, 'totalElements', response ? response.length : 0);
    this.page = _.get(response, 'pageable.pageNumber', 0);
    this.data = _.get(response, 'content', response);

    if (typeof (this.mapElementHandle) === 'function' && _.size(this.data) > 0) {
      this.data.map(this.mapElementHandle);
    }

  }

  toggleSearch() {
    this.enableSearch = !this.enableSearch;
    setTimeout(() => document.getElementById('search-input').focus(), 100);
  }

  async searchHandle() {
    await this.loadData();
  }

  async delete(record: T) {
    await this.service.delete(record);
    await this.loadData();
  }

  getValue(field: string, rowData: any, handleView?: any) {
    return getValueCol(field, rowData, handleView);
  }

  get getCurrentTotalOfRecords() {
    // let total = this.pageSize * (this.page + 1);
    // if (total > this.totalRecords) {
    //   const remainingRecods = this.totalRecords - total;
    //   total = total - remainingRecods;
    // }
    return this.pageSize * (this.page + 1);
  }
}
