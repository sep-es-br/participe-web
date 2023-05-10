import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import Common from '../util/Common';

@Injectable()
export class FilesService {
  private url = `${environment.apiEndpoint}/files`;
  private headers = Common.buildFileUploadHeaders();

  constructor(private http: HttpClient) {}

  uploadFile(file: FormData) {
    return this.http.post<any>(`${this.url}/upload`, file, { headers: Common.buildHeaders() }).toPromise();
  }
}
