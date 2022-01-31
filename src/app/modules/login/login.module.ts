import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '@app/app-routing.module';
import { CoreModule } from '@app/core/core.module';

import { LoginComponent } from '@app/modules/login/login.component.ts';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    LoginComponent
  ],
  exports: [
    LoginComponent
  ],
})
export class LoginModule {}
