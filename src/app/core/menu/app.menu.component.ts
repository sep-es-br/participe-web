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
  faUsers
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

  @Input() reset: boolean;

  model: any[];

  constructor(public template: AppTemplateComponent) { }

  ngOnInit() {
      this.model = [
          { label: 'dashboard', icon: faTachometerAlt, routerLink: ['/home'] },
          { label: 'moderation', icon: faCrown, routerLink: ['/home'] },
          { label: 'administration.label', icon: faCog, routerLink: ['/administration/dashboard'], items:[
            { label: 'administration.domain', icon: faMapMarkedAlt, routerLink: ['/administration/domains'] },
            { label: 'administration.structure', icon: faSitemap, routerLink: ['/administration/structures'] },
            { label: 'administration.plan', icon: faClipboardList, routerLink: ['/administration/plans'] },
            { label: 'administration.conference', icon: faComments, routerLink: ['/administration/conferences'] },
          ] }
      ];
  }
}
