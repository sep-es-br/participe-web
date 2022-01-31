import { ModerationComponent } from './moderation.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '@app/app-routing.module';
import { ComponentsModule } from '@app/shared/components/components.module';
import { CoreModule } from '@app/core/core.module';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { ModerateComponent } from './moderate/moderate.component';


@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    ComponentsModule,
    CoreModule,
    TranslateModule
  ],
  declarations: [
    ModerationComponent,
    ModerateComponent
  ],
  exports: [
    ModerationComponent
  ],
  providers: [
    ConfirmationService,
  ]
})
export class ModerationModule { }
