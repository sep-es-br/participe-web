import { Component, Input, OnInit } from '@angular/core';

import { AppTemplateComponent } from '../template/app.template.component';

import {
  faClipboardList,
  faCog,
  faComments,
  faCrown,
  faMapMarkedAlt,
  faSitemap,
  faTachometerAlt,
  faUsers,
  faUserCheck
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '@app/shared/services/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

  @Input() reset: boolean;

  model: any[];

  constructor(public template: AppTemplateComponent, private userAuth: AuthService) { }

  ngOnInit() {
    const person = this.userAuth.getUserInfo;
    this.model = [
      { label: 'control-panel', icon: faTachometerAlt, routerLink: ['/home'] }
    ];
    if (person.roles.includes('Moderator') || person.roles.includes('Administrator')) {
      this.model.push({ label: 'administration.moderation', icon: faCrown, routerLink: ['/moderation/search'] });
    }
    if (person.roles.includes('Recepcionist') || person.roles.includes('Administrator')) {
      this.model.push({ label: 'attendance.label' , icon: faUserCheck, routerLink: ['/attendance']});
    }
    if (person.roles.includes('Administrator')) {
      if (window.location.href.includes('#/administration')) {
        this.model.push({
          label: 'administration.label', icon: faCog, items: [
            { label: 'administration.domain', icon: faMapMarkedAlt, routerLink: ['/administration/domains'] },
            { label: 'administration.structure', icon: faSitemap, routerLink: ['/administration/structures'] },
            { label: 'administration.plan', icon: faClipboardList, routerLink: ['/administration/plans'] },
            { label: 'administration.conference', icon: faComments, routerLink: ['/administration/conferences'] },
            { label: 'administration.citizen', icon: faUsers, routerLink: ['/administration/citizen'] },
          ]
        });
      } else {
        this.model.push({
          label: 'administration.label', icon: faCog, routerLink: ['/administration/dashboard'], items: [
            { label: 'administration.domain', icon: faMapMarkedAlt, routerLink: ['/administration/domains'] },
            { label: 'administration.structure', icon: faSitemap, routerLink: ['/administration/structures'] },
            { label: 'administration.plan', icon: faClipboardList, routerLink: ['/administration/plans'] },
            { label: 'administration.conference', icon: faComments, routerLink: ['/administration/conferences'] },
            { label: 'administration.citizen', icon: faUsers, routerLink: ['/administration/citizen'] },
          ]
        });
      }
    }
  }
}
