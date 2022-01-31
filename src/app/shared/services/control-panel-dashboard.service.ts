import { Inject, Injectable, Injector } from '@angular/core';
import Common from '@app/shared/util/Common';
import { IControlPanelDashboardData } from '../interface/IControlPanelDashboardData';
import { LocalityType } from '../models/locality-type';
import { BaseService } from '../base/base.service';

@Injectable()
export class ControlPanelDashboardService extends BaseService<any> {

  constructor(
    @Inject(Injector) injector: Injector
  ) {
    super('control-panel-dashboard', injector);
  }

  getDashboardData(idConference: number,
                   result?: string,
                   origin?: string,
                   meetings?: number[],
                   microregionChartAgroup?: number,
                   microregionLocalitySelected?: number,
                   stLastLevelLocality?: boolean,
  //                 structureItemSelected?: number,
                   structureItemPlanSelected?: number,
                   stLastLevelPlanItem?: boolean) {
    const url = this.urlBase.concat('?idConference=').concat(idConference ? idConference.toString() : '')
      .concat(result ? `&result=${result}` : '')
      .concat(origin ? `&origin=${origin}` : '')
      .concat(meetings && meetings.length > 0 ? `&meetings=${meetings.join(',')}` : '')
      .concat(microregionChartAgroup ? `&microregionChartAgroup=${microregionChartAgroup.toString()}` : '')
      .concat(microregionLocalitySelected ? `&microregionLocalitySelected=${microregionLocalitySelected.toString()}` : '')
      .concat(stLastLevelLocality ? `&stLastLevelLocality=${stLastLevelLocality.toString()}` : '')
//      .concat(structureItemSelected ? `&structureItemSelected=${structureItemSelected.toString()}` : '')
      .concat(structureItemPlanSelected ? `&structureItemPlanSelected=${structureItemPlanSelected.toString()}` : '')
      .concat(stLastLevelPlanItem ? `&stLastLevelPlanItem=${stLastLevelPlanItem.toString()}` : '');
    return this.http.get<IControlPanelDashboardData>(url, { headers: Common.buildHeaders() }).toPromise();
  }

  getAllTypeLocalityFromParents(options: any) {
    const url = this.urlBase.concat('/locality-parents')
      .concat('?idDomain=').concat(options.idDomain ? options.idDomain.toString() : '')
      .concat('&idTypeLocality=').concat(options.idTypeLocality ? options.idTypeLocality.toString() : '');
    return this.http.get<LocalityType[]>
      (url,
      { headers: Common.buildHeaders() }).toPromise();
  }

}
