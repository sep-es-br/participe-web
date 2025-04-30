import { Routes } from '@angular/router';
import { ModerateComponent } from '@app/modules/moderation/moderate/moderate.component';
import { ModerationComponent } from '@app/modules/moderation/moderation.component';

export const routes: Routes = [
  {path: 'search', component: ModerationComponent},
  {path: 'moderate/:id/:conferenceId', component: ModerateComponent},
  
];