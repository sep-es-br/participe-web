import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '@app/app-routing.module';
import { CoreModule } from '@app/core/core.module';
import { HomeComponent } from './home.component';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    CoreModule
  ],
  declarations: [
    HomeComponent
  ],
  exports: [
    HomeComponent
  ],
})
export class HomeModule {}
