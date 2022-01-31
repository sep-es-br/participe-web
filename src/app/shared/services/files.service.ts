import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { async } from '@angular/core/testing';

@Injectable()
export class FilesService {
  private url = `${environment.apiEndpoint}/files`;

  constructor(private http: HttpClient) {}

  async uploadFile(file: FormData){
    var ret = await this.http.post<any>(`${this.url}/upload`, file).toPromise();
    return ret;
  }
}
