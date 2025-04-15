import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
// import ngx-translate and the http loader
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { AdministrationDashboardModule } from './modules/administration-dashboard/administration-dashboard.module';
import { AppComponent } from './app.component';
import { AppRoutes } from './app.routes';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { BreadcrumbService } from './core/breadcrumb/breadcrumb.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CitizenModule } from './modules/citizen/citizen.module';
import { ComponentsModule } from './shared/components/components.module';
import { ConferenceModule } from './modules/conference/conference.module';
import { CoreModule } from '@app/core/core.module';
import { DomainModule } from './modules/domain/domain.module';
import { EmBrancoModule } from '@app/modules/em-branco/em-branco.module';
import { HomeModule } from '@app/modules/home/home.module';
import { HttpLoaderFactory } from './HttpLoaderFactory';
import { HttpRequestInterceptorModule } from './shared/interceptor/http-request.interceptor.module';
import { LoginModule } from '@app/modules/login/login.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { NgModule } from '@angular/core';
import { PlanModule } from './modules/plan/plan.module';
import { StructureModule } from './modules/structure/structure.module';
import { ControlPanelDashboardModule } from './modules/control-panel-dashboard/control-panel-dashboard.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ProposalEvaluationModule } from './modules/proposal-evaluation/proposal-evaluation.module';
import { EvaluatorsModule } from './modules/evaluators/evaluators.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [
    FontAwesomeModule,
    AppRoutes,
    AttendanceModule,
    BrowserAnimationsModule,
    BrowserModule,
    ComponentsModule,
    AdministrationDashboardModule,
    DomainModule,
    FormsModule,
    ReactiveFormsModule,
    EmBrancoModule,
    HomeModule,
    HttpClientModule,
    LoginModule,
    PlanModule,
    ConferenceModule,
    CoreModule,
    StructureModule,
    CitizenModule,
    EvaluatorsModule,
    ModerationModule,
    ProposalEvaluationModule,
    ControlPanelDashboardModule,
    SweetAlert2Module.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    HttpRequestInterceptorModule
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


