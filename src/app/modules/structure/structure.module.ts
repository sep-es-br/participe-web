import { AppRoutingModule } from '@app/app-routing.module';
import { CommonModule } from '@angular/common';
import { ConfirmationService } from 'primeng/api';
import { CoreModule } from '@app/core/core.module';
import { NgModule } from '@angular/core';

import { ComponentsModule } from '@app/shared/components/components.module';
import { StructureComponent } from './structure.component';
import { StructureService } from '@app/shared/services/structure.service';
import { StructureItemService } from '@app/shared/services/structure-item.service';
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
    StructureComponent
  ],
  exports: [
    StructureComponent
  ],
  providers: [
    ConfirmationService,
    StructureService,
    StructureItemService,
  ]
})
export class StructureModule {}
