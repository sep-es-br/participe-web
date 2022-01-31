import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '@app/app-routing.module';
import { CoreModule } from '@app/core/core.module';
import { TranslateModule } from '@ngx-translate/core';
import { AdministrationDashboardComponent } from './administration-dashboard.component';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    CoreModule,
    TranslateModule
  ],
  declarations: [
    AdministrationDashboardComponent
  ],
  exports: [
    AdministrationDashboardComponent
  ],
})
export class AdministrationDashboardModule {}
