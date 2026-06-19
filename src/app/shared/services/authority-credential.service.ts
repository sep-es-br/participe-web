import {Inject, Injectable, Injector} from "@angular/core";
import { environment } from "@environments/environment";
import { ICheckedInAt } from "../interface/CheckedInAt.interface";
import { HttpClient } from "@angular/common/http";
import {IPreRegistrationAuthority} from '@app/shared/interface/IPreRegistrationAuthority';

@Injectable({
  providedIn: "root"
})
export class AuthorityCredentialService {

  readonly baseUrl = `${environment.apiEndpoint}/authorityCredential`;

  constructor(
    private http : HttpClient
  ) {

  }

  deleteCredential(body: any) {
    return this.http.delete<void>(`${this.baseUrl}`, { body }).toPromise();
  }

  registerAuthority(
    madeBy, representedByCpf, representedByEmail, representedByName,
    localityId, meetingId, organization, role, representedBySub,
    isTeam): Promise<IPreRegistrationAuthority> {
    const body = {
      madeBy,
      representedByCpf,
      representedByEmail,
      representedByName,
      representedBySub,
      meetingId,
      organization,
      role,
      localityId,
      isTeam
    };
    return this.http.put<IPreRegistrationAuthority>(`${this.baseUrl}`, body).toPromise();
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
