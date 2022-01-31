import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '@app/app-routing.module';
import { CoreModule } from '@app/core/core.module';

import { EmBrancoComponent } from '@app/modules/em-branco/em-branco.component';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    CoreModule
  ],
  declarations: [
    EmBrancoComponent
  ],
  exports: [
    EmBrancoComponent
  ],
})
export class EmBrancoModule {}
