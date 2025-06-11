import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AttendanceComponent } from './attendance.component';
import { RegisterComponent } from './register/register.component';
import { EditComponent } from './edit/edit.component';
import { AuthorityListComponent } from './authority-list/authority-list.component';

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
        component: EditComponent
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
