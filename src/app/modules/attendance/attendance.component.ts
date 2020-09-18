import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from '@app/core/breadcrumb/breadcrumb.service';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faUserPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import { ActionBarService } from '@app/core/actionbar/app.actionbar.actions.service';
import { AuthService } from '@app/shared/services/auth.service';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {

  actions: { name: string, url: string, icon: IconDefinition }[];

  constructor( private breadcrumbSrv: BreadcrumbService, private userAuth: AuthService) { }

  ngOnInit() {
    const { roles } = this.userAuth.getUserInfo;
    this.breadcrumbSrv.setItems([
      { label: 'attendance.label' }
    ]);
    this.actions = [{ name: 'attendance.registerAttendance', url: 'register', icon: faUserPlus }];
    if (roles.includes('Administrator')) {
      this.actions.push({ name: 'attendance.edit', url: 'edit', icon: faEdit });
    }
  }
}
