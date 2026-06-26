import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AttendanceComponent } from './attendance.component';
import { RegisterComponent } from './register/register.component';
import { EditComponent } from './edit/edit.component';
import { AuthorityListComponent } from './authority-list/authority-list.component';
import * as path from 'path';
import {NewAuthorityComponent} from '@app/modules/attendance/new-authority/new-authority.component';

const routes: Routes = [
  {
    path: 'attendance',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: AttendanceComponent
      },
      {
        path: 'register',
        component: RegisterComponent
      },
      {
        path: 'edit',
        children: [
          {
            path: '',
            pathMatch: 'full',
            component: EditComponent
          },
          {
            path: 'new-authority',
            component: NewAuthorityComponent
          }
        ]
      },
      {
        path: 'authority-list',
        component: AuthorityListComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AttendanceRoutingModule {}
