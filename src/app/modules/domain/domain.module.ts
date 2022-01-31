import { AppRoutingModule } from '@app/app-routing.module';
import { CommonModule } from '@angular/common';
import { ConfirmationService } from 'primeng/api';
import { CoreModule } from '@app/core/core.module';
import { NgModule } from '@angular/core';

import { ComponentsModule } from '@app/shared/components/components.module';
import { DomainComponent } from '@app/modules/domain/domain.component';
import { DomainService } from '@app/shared/services/domain.service';
import { LocalityService } from '@app/shared/services/locality.service';
import { LocalityTypeService } from '@app/shared/services/locality-type.service';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    ComponentsModule,
    CoreModule,
    TranslateModule
  ],
  declarations: [
    DomainComponent
  ],
  exports: [
    DomainComponent
  ],
  providers: [
    ConfirmationService,
    DomainService,
    LocalityService,
    LocalityTypeService
  ]
})
export class DomainModule {}
