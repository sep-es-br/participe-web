import * as _ from 'lodash';
import * as qs from 'qs';

import { IQueryOptions } from '../interface/IQueryOptions';

export const PrepareHttpQuery = (options?: IQueryOptions, addQueryPrefix: boolean = true): string => {
  const query: any = {};
  query.size = _.get(options, 'pageSize', 15);
  query.page = _.get(options, 'page', 0);
  query.sort = _.get(options, 'sort');
  const search = _.get(options, 'search', {});
  Object.keys(search).forEach(key =>
    query[key] = search[key]
  );
  return qs.stringify(query, { addQueryPrefix, arrayFormat: 'repeat' });
};
