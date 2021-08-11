import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '@app/app-routing.module';
import { CoreModule } from '@app/core/core.module';
import { TranslateModule } from '@ngx-translate/core';
import { ControlPanelDashboardComponent } from './control-panel-dashboard.component';
import { HorizontalBarGraphComponent } from './graphs/horizontal-bar-graph/horizontal-bar-graph.component';
import { HeatMapComponent } from './graphs/heat-map/heat-map.component';
import { ControlPanelDashboardService } from '@app/shared/services/control-panel-dashboard.service';

@NgModule({
  declarations: [ControlPanelDashboardComponent, HorizontalBarGraphComponent, HeatMapComponent],
  imports: [
    CoreModule,
    CommonModule,
    AppRoutingModule,
    CommonModule,
    TranslateModule
  ],
  providers: [
    ControlPanelDashboardService
  ]
})
export class ControlPanelDashboardModule { }
