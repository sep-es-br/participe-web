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
}
