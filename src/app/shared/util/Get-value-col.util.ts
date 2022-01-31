import * as _ from 'lodash';

export const getValueCol = (field: string, rowData: any, handleView?: any): string => {
  const value = _.get(rowData, field);
  if (handleView && typeof (handleView) === 'function') {
    return handleView(value, rowData);
  } else {
    return value;
  }
};

