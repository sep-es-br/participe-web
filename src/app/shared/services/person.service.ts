import { PrepareHttpQuery } from './../util/Query.utils';
import { CitizenFilterModel } from '../models/CitizenFilterModel';
import { CitizenModel } from '../models/CitizenModel';
import Common from '@app/shared/util/Common';
import { Injectable, Injector, Inject } from '@angular/core';
import { BaseService } from '../base/base.service';

@Injectable({ providedIn: 'root' })
export class PersonService extends BaseService<any> {
  constructor(
    @Inject(Injector) injector: Injector
  ) {
    super('person', injector);
  }

}


