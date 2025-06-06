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
import { MeetPanelComponent } from './modules/conference/meeting/meet-panel/meet-panel.component';
import { ProposalEvaluationComponent } from './modules/proposal-evaluation/proposal-evaluation.component';
import { EvaluateComponent } from './modules/proposal-evaluation/evaluate/evaluate.component';
import { EvaluatorsComponent } from './modules/evaluators/evaluators.component';

export const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'home', component: HomeComponent},
  {path: 'control-panel-dashboard', component: ControlPanelDashboardComponent},
  {
    path: 'administration', 
    loadChildren: async () => (await import('./modules/administration-dashboard/administration-dashboard.module')).AdministrationDashboardModule
  },
  {
    path: 'moderation', 
    loadChildren: async () => (await import('./modules/moderation/moderation.module')).ModerationModule
  },
  {
    path: 'attendance',
    loadChildren: async () => (await import('./modules/attendance/attendance.module')).AttendanceModule
  },
  {path: "proposal-evaluation", component: ProposalEvaluationComponent},
  {path: "proposal-evaluation/:proposalId", component: EvaluateComponent},
];

export const AppRoutes: ModuleWithProviders<any> = RouterModule.forRoot(routes, {
    useHash: true,
    scrollPositionRestoration: 'enabled',
    onSameUrlNavigation: 'reload'
});

