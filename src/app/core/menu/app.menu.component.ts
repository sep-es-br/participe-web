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
          { label: 'Dashboard', icon: faTachometerAlt, routerLink: ['/home'] },
          { label: 'Moderation', icon: faCrown, routerLink: ['/home'] },
          { label: 'Administration', icon: faCog, items:[
            { label: 'Domain', icon: faMapMarkedAlt, routerLink: ['/administration/domains'] },
            { label: 'Structure', icon: faSitemap, routerLink: ['/administration/structures'] },
            { label: 'Plan', icon: faClipboardList, routerLink: ['/administration/plans'] },
            { label: 'Conference', icon: faComments, routerLink: ['/administration/conferences'] },
          ] }
      ];
  }
}
