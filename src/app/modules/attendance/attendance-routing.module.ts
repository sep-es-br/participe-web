import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AttendanceComponent } from './attendance.component';
import { RegisterComponent } from './register/register.component';
import { EditComponent } from './edit/edit.component';

const routes: Routes = [
  {
    path: 'attendance',
    children: [
      {
        path: '',
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
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AttendanceRoutingModule {}
