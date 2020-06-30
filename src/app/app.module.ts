import { CitizenModule } from './modules/citizen/citizen.module';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutes } from './app.routes';

import { CoreModule } from '@app/core/core.module';
import { AppComponent } from './app.component';

import { ComponentsModule } from './shared/components/components.module';
import { DomainModule } from './modules/domain/domain.module';

import { AdministrationDashboardModule } from './modules/administration-dashboard/administration-dashboard.module';
import { HomeModule } from '@app/modules/home/home.module';
import { EmBrancoModule } from '@app/modules/em-branco/em-branco.module';
import { LoginModule } from '@app/modules/login/login.module';
import { BreadcrumbService } from './core/breadcrumb/breadcrumb.service';
import { PlanModule } from './modules/plan/plan.module';
import { StructureModule } from './modules/structure/structure.module';
import { ConferenceModule } from './modules/conference/conference.module';

// import ngx-translate and the http loader
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from './HttpLoaderFactory';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { ModerationModule } from './modules/moderation/moderation.module';

@NgModule({
  imports: [
    AppRoutes,
    BrowserAnimationsModule,
    BrowserModule,
    ComponentsModule,
    AdministrationDashboardModule,
    DomainModule,
    FormsModule,
    EmBrancoModule,
    HomeModule,
    HttpClientModule,
    LoginModule,
    PlanModule,
    ConferenceModule,
    CoreModule,
    StructureModule,
    CitizenModule,
    ModerationModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),

  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [
    BreadcrumbService,
    {
      provide: JWT_OPTIONS,
      useValue: JWT_OPTIONS
    },
    JwtHelperService
  ]
})
export class AppModule { }


