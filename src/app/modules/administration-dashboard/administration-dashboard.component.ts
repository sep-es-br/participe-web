
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
  selector: 'tt-administration-dashboard',
  templateUrl: './administration-dashboard.component.html',
  styleUrls: ['./administration-dashboard.component.scss']
})
export class AdministrationDashboardComponent implements OnInit {

  actions: Array<{ name: string, url: string, icon: IconDefinition }>;

  ngOnInit(): void {
    this.actions = [
      { name: 'administration.domain', url: '/administration/domains', icon: faMapMarkedAlt },
      { name: 'administration.structure', url: '/administration/structures', icon: faSitemap },
      { name: 'administration.plan', url: '/administration/plans', icon: faClipboardList },
      { name: 'administration.conference', url: '/administration/conferences', icon: faComments },
    ]
  }

  constructor(
    private breadcrumbService: BreadcrumbService
  ) {
    this.breadcrumbService.setItems([
      { label: 'administration.label' }
    ]);
  }
}
