import {MeetingComponent} from './modules/conference/meeting/meeting.component';

import {ModerateComponent} from './modules/moderation/moderate/moderate.component';
import {ModerationComponent} from './modules/moderation/moderation.component';
import {LoginComponent} from './modules/login/login.component';
import {RouterModule, Routes} from '@angular/router';
import {ModuleWithProviders} from '@angular/core';

import {DomainComponent} from '@app/modules/domain/domain.component';

import {AdministrationDashboardComponent} from './modules/administration-dashboard/administration-dashboard.component';
import {StructureComponent} from './modules/structure/structure.component';
import {PlanComponent} from './modules/plan/plan.component';
import {ConferenceComponent} from './modules/conference/conference.component';
import {HomeComponent} from './modules/home/home.component';
import {CitizenComponent} from './modules/citizen/citizen.component';
import {ControlPanelDashboardComponent} from './modules/control-panel-dashboard/control-panel-dashboard.component';
import {ConferenceListComponent} from './modules/conference/conference-list/conference-list.component';

export const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'home', component: HomeComponent},
  {path: 'control-panel-dashboard', component: ControlPanelDashboardComponent},
  {path: 'administration/dashboard', component: AdministrationDashboardComponent},
  {path: 'administration/domains', component: DomainComponent},
  {path: 'administration/structures', component: StructureComponent},
  {path: 'administration/plans', component: PlanComponent},
  {path: 'administration/conferences', component: ConferenceListComponent},
  {path: 'administration/conferences/conference', component: ConferenceComponent},
  {path: 'administration/conferences/:id/meeting', component: MeetingComponent},
  {path: 'administration/citizen', component: CitizenComponent},
  {path: 'moderation/search', component: ModerationComponent},
  {path: 'moderation/moderate/:id/:conferenceId', component: ModerateComponent},
  {
    path: 'attendance',
    loadChildren: async () => (await import('./modules/attendance/attendance.module')).AttendanceModule
  }
];

export const AppRoutes: ModuleWithProviders = RouterModule.forRoot(routes, {
  useHash: true,
  scrollPositionRestoration: 'enabled',
  onSameUrlNavigation: 'reload'
});

