import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdministrationDashboardComponent } from '@app/modules/administration-dashboard/administration-dashboard.component';
import { CitizenComponent } from '@app/modules/citizen/citizen.component';
import { ConferenceListComponent } from '@app/modules/conference/conference-list/conference-list.component';
import { ConferenceComponent } from '@app/modules/conference/conference.component';
import { MeetPanelComponent } from '@app/modules/conference/meeting/meet-panel/meet-panel.component';
import { MeetingComponent } from '@app/modules/conference/meeting/meeting.component';
import { DomainComponent } from '@app/modules/domain/domain.component';
import { EvaluatorsComponent } from '@app/modules/evaluators/evaluators.component';
import { ModerateComponent } from '@app/modules/moderation/moderate/moderate.component';
import { ModerationComponent } from '@app/modules/moderation/moderation.component';
import { PlanComponent } from '@app/modules/plan/plan.component';
import { StructureComponent } from '@app/modules/structure/structure.component';

export const routes: Routes = [
  {path: 'dashboard', component: AdministrationDashboardComponent},
  {path: 'domains', component: DomainComponent},
  {path: 'structures', component: StructureComponent},
  {path: 'plans', component: PlanComponent},
  {path: 'conferences', component: ConferenceListComponent},
  {path: 'conferences/conference', component: ConferenceComponent},
  {path: 'conferences/:id/meeting', component: MeetingComponent},
  {path: 'conferences/:id/meeting/:idm/panel', component: MeetPanelComponent},
  {path: 'evaluators', component: EvaluatorsComponent},
  {path: 'citizen', component: CitizenComponent},
  {path: 'moderation/search', component: ModerationComponent},
  {path: 'moderation/moderate/:id/:conferenceId', component: ModerateComponent}
];

