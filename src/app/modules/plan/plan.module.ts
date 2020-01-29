import { AppRoutingModule } from '@app/app-routing.module';
import { CommonModule } from '@angular/common';
import { ConfirmationService } from 'primeng/api';
import { CoreModule } from '@app/core/core.module';
import { NgModule } from '@angular/core';

import { ComponentsModule } from '@app/shared/components/components.module';
import { PlanService } from '@app/shared/services/plan.service';
import { PlanComponent } from '@app/modules/plan/plan.component';
import { PlanItemService } from '@app/shared/services/planItem.service';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    ComponentsModule,
    CoreModule
  ],
  declarations: [
    PlanComponent
  ],
  exports: [
    PlanComponent
  ],
  providers: [
    ConfirmationService,
    PlanService,
    PlanItemService
  ]
})
export class PlanModule {}
