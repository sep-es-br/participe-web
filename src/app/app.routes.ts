import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { DomainComponent } from '@app/modules/domain/domain.component';

import { AdministrationDashboardComponent } from './modules/administration-dashboard/administration-dashboard.component';
import { StructureComponent } from './modules/structure/structure.component';
import { PlanComponent } from './modules/plan/plan.component';
import { ConferenceComponent } from './modules/conference/conference.component';
import { HomeComponent } from './modules/home/home.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    { path: 'administration/dashboard', component: AdministrationDashboardComponent },
    { path: 'administration/domains', component: DomainComponent },
    { path: 'administration/structures', component: StructureComponent },
    { path: 'administration/plans', component: PlanComponent },
    { path: 'administration/conferences', component: ConferenceComponent },
];

export const AppRoutes: ModuleWithProviders = RouterModule.forRoot(routes, {useHash: true, scrollPositionRestoration: 'enabled'});
