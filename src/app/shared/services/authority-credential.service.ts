import {Inject, Injectable, Injector} from "@angular/core";
import { environment } from "@environments/environment";
import { ICheckedInAt } from "../interface/CheckedInAt.interface";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root"
})
export class AuthorityCredentialService {

  readonly baseUrl = `${environment.apiEndpoint}/authorityCredential`;

  constructor(
    private http : HttpClient
  ) {
    
  }

  toggleAnnounced(
    idCheckedIn:number
    ) : Promise<ICheckedInAt> {
    
    if(!idCheckedIn) return new Promise(() => {return {} as ICheckedInAt});

    return this.http.put<ICheckedInAt>(`${this.baseUrl}/${idCheckedIn}/toggleAnnounced`, undefined).toPromise();
  } 

  toggleToAnnounce(
    idCheckedIn:number
    ) : Promise<ICheckedInAt> {
    
    if(!idCheckedIn) return new Promise(() => {return {} as ICheckedInAt});

    return this.http.put<ICheckedInAt>(`${this.baseUrl}/${idCheckedIn}/toggleToAnnounce`, undefined).toPromise();
  } 

  
}
