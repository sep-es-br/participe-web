import { AppRoutingModule } from '@app/app-routing.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { InputMessageComponent } from '@app/shared/components/input-message/input-message.component';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    TranslateModule
  ],
  declarations: [
    InputMessageComponent,
    LoadingSpinnerComponent
  ],
  exports: [
    InputMessageComponent,
    LoadingSpinnerComponent
  ]
})
export class ComponentsModule {}
