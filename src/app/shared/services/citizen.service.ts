import { CitizenModel } from '../models/CitizenModel';
import { Injectable, Injector, Inject } from '@angular/core';
import { BaseService } from '../base/base.service';

@Injectable({ providedIn: 'root' })
export class CitizenService extends BaseService<CitizenModel> {

  constructor(
    @Inject(Injector) injector: Injector
  ) {
    super('citizen', injector);
  }

}

