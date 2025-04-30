import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '@app/app-routing.module';
import { CoreModule } from '@app/core/core.module';
import { TranslateModule } from '@ngx-translate/core';
import { AdministrationDashboardComponent } from './administration-dashboard.component';
import { RouterModule } from '@angular/router';
import { routes } from '@app/shared/routes/administration.routing';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    TranslateModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    AdministrationDashboardComponent
  ],
  exports: [
    AdministrationDashboardComponent,
    RouterModule
  ],
})
export class AdministrationDashboardModule {}
