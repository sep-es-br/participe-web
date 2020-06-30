import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../../app-routing.module';
import { ComponentsModule } from '../../shared/components/components.module';
import { CoreModule } from '../../core/core.module';
import { TranslateModule } from '@ngx-translate/core';
import { CitizenComponent } from './citizen.component';
import { ConfirmationService } from 'primeng/api';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    ComponentsModule,
    CoreModule,
    TranslateModule
  ],
  declarations: [
    CitizenComponent
  ],
  exports: [
    CitizenComponent
  ],
  providers: [
    ConfirmationService,
  ]
})
export class CitizenModule { }
