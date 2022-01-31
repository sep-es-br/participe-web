import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '@app/app-routing.module';
import { ComponentsModule } from '@app/shared/components/components.module';
import { CoreModule } from '@app/core/core.module';
import { TranslateModule } from '@ngx-translate/core';
import { CitizenComponent } from './citizen.component';
import { ConfirmationService } from 'primeng/api';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    ComponentsModule,
    CoreModule,
    TranslateModule,
    ReactiveFormsModule,
    FormsModule
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
