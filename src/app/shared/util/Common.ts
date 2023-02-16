import { StoreKeys } from './../constants';
import { HttpHeaders } from '@angular/common/http';

export default class Common {
  public static buildHeaders(...headers) {
    const accessToken = localStorage.getItem(StoreKeys.ACCESS_TOKEN);
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Authorization: accessToken ? `Bearer ${accessToken}` : '',
      headers
    });
  }

  public static buildFileUploadHeaders(...headers) {
    const accessToken = localStorage.getItem(StoreKeys.ACCESS_TOKEN);
    return new HttpHeaders({
      'Form-Data': 'true',
      'encType': 'multipart/form-data',
      'Access-Control-Allow-Origin': '*',
      Authorization: accessToken ? `Bearer ${accessToken}` : '',
      headers
    });
  }

}
