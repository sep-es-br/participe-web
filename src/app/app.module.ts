import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutes } from './app.routes';

import { CoreModule } from '@app/core/core.module';
import { AppComponent } from './app.component';

import { ComponentsModule } from './shared/components/components.module';
import { DomainModule } from './modules/domain/domain.module';

import { HomeModule } from '@app/modules/home/home.module';
import { EmBrancoModule } from '@app/modules/em-branco/em-branco.module';
import { LoginModule } from '@app/modules/login/login.module';
import { BreadcrumbService } from './core/breadcrumb/breadcrumb.service';
import { PlanModule } from './modules/plan/plan.module';
import { StructureModule } from './modules/structure/structure.module';
import { ConferenceModule } from './modules/conference/conference.module';

@NgModule({
    imports: [
      AppRoutes,
      BrowserAnimationsModule,
      BrowserModule,
      ComponentsModule,
      DomainModule,
      FormsModule,
      EmBrancoModule,
      HomeModule,
      HttpClientModule,
      LoginModule,
      PlanModule,
      ConferenceModule,
      CoreModule,
      StructureModule
    ],
    declarations: [ AppComponent ],
    bootstrap: [ AppComponent ],
    providers: [ BreadcrumbService ]
})
export class AppModule { }
