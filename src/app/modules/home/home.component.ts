import { Component, OnInit } from '@angular/core';

import { BreadcrumbService } from '@app/core/breadcrumb/breadcrumb.service';

import {
  faClipboardList,
  faComments,
  faMapMarkedAlt,
  faSitemap,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'tt-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  actions: Array<{ name: string, url: string, icon: IconDefinition }>;

  ngOnInit(): void {
    this.actions = [
      { name: 'Domain', url: '/administration/domains', icon: faMapMarkedAlt },
      { name: 'Structure', url: '/administration/structures', icon: faSitemap },
      { name: 'Plan', url: '/administration/plans', icon: faClipboardList },
      { name: 'Conference', url: '/administration/conferences', icon: faComments },
    ]
  }

  constructor(
    private breadcrumbService: BreadcrumbService
  ) {
    this.breadcrumbService.setItems([
      { label: 'Dashboard' },
      { label: 'Home', routerLink: ['/home'] }
    ]);
  }
}
