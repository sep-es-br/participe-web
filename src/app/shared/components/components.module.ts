import { AppRoutingModule } from '@app/app-routing.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { InputMessageComponent } from '@app/shared/components/input-message/input-message.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    TranslateModule
  ],
  declarations: [
    InputMessageComponent
  ],
  exports: [
    InputMessageComponent
  ]
})
export class ComponentsModule {}
