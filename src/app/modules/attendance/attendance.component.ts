import {Component, OnInit} from '@angular/core';
import {BreadcrumbService} from '@app/core/breadcrumb/breadcrumb.service';
import {IconDefinition} from '@fortawesome/fontawesome-svg-core';
import {faEdit, faUserPlus} from '@fortawesome/free-solid-svg-icons';
import {AuthService} from '@app/shared/services/auth.service';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {

  actions: Array<{ name: string, url: string, icon: IconDefinition }>;

  constructor(private breadcrumbSrv: BreadcrumbService, private userAuth: AuthService) {
    this.breadcrumbSrv.setItems([
      {label: 'attendance.label'}
    ]);
  }

  ngOnInit() {
    const {roles} = this.userAuth.getUserInfo;

    this.actions = [
      {name: 'attendance.registerAttendance', url: 'register', icon: faUserPlus}
    ];

    if (roles.includes('Administrator')) {
      this.actions.push({name: 'attendance.edit', url: 'edit', icon: faEdit});
    }
  }
}
