
import { AuthGuardService } from './shared/services/auth-guard.service';
import { ModerateComponent } from './modules/moderation/moderate/moderate.component';
import { ModerationComponent } from './modules/moderation/moderation.component';
import { LoginComponent } from '@app/modules/login/login.component.ts';
import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { DomainComponent } from '@app/modules/domain/domain.component';

import { AdministrationDashboardComponent } from './modules/administration-dashboard/administration-dashboard.component';
import { StructureComponent } from './modules/structure/structure.component';
import { PlanComponent } from './modules/plan/plan.component';
import { ConferenceComponent } from './modules/conference/conference.component';
import { HomeComponent } from './modules/home/home.component';
import { CitizenComponent } from './modules/citizen/citizen.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent },
    { path: 'administration/dashboard', component: AdministrationDashboardComponent },
    { path: 'administration/domains', component: DomainComponent },
    { path: 'administration/structures', component: StructureComponent },
    { path: 'administration/plans', component: PlanComponent },
    { path: 'administration/conferences', component: ConferenceComponent },
    { path: 'administration/citizen', component: CitizenComponent },
    { path: 'moderation/search', component: ModerationComponent },
    { path: 'moderation/moderate/:id/:conferenceId', component: ModerateComponent },
];

export const AppRoutes: ModuleWithProviders = RouterModule.forRoot(routes, { useHash: true, scrollPositionRestoration: 'enabled' });

