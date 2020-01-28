import { HttpHeaders } from '@angular/common/http';

export default class Common {
  public static buildHeaders(...headers) {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      headers
    })
  }
}
