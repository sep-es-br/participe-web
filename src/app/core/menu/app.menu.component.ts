import {Component, Input, OnInit} from '@angular/core';

import {AppTemplateComponent} from '../template/app.template.component';

import {
  faClipboardCheck,
  faClipboardList,
  faCog,
  faComments,
  faCrown,
  faEdit,
  faMapMarkedAlt,
  faPortrait,
  faSitemap,
  faTachometerAlt,
  faUserCheck,
  faUserPlus,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import {AuthService} from '@app/shared/services/auth.service';
import {TranslateService} from '@ngx-translate/core';
import { IPerson } from '@app/shared/interface/IPerson';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

  @Input() reset: boolean;

  model: any[];
  person: IPerson;

  constructor(public template: AppTemplateComponent, private userAuth: AuthService, private translateSrv: TranslateService, private router: Router) {
  }

  ngOnInit() {
    const person = this.userAuth.getUserInfo;

    if(this.userAuth.getUserInfo){
      this.updateMenu();
    }
  }

  updateMenu(){
    this.person = this.userAuth.getUserInfo;

    this.model = [];

    if (this.person.roles.includes('Moderator') || this.person.roles.includes('Administrator')) {
      this.model.push(
        {label: this.translateSrv.instant('control-panel'), icon: faTachometerAlt, routerLink: ['/home']}
      );
      this.model.push({label: 'administration.moderation', icon: faCrown, routerLink: ['/moderation/search']});
    }

    // <-- Avaliação de propostas

    // Alterar condição do if para mais roles
    if(person.roles.includes('Administrator')) {
      this.model.push(
        {label: 'proposal_evaluation', icon: faClipboardCheck, routerLink: ['/proposal-evaluation']}
      )
    }

    if(sessionStorage.getItem("evaluatorOrgGuid") && !this.person.roles.includes('Administrator')){
      this.model.push({label: 'proposal_evaluation.title', icon: faClipboardCheck, routerLink: ['/proposal-evaluation']})
    }

    if (this.person.roles.includes('Recepcionist') && !this.person.roles.includes('Administrator')) {
      if (window.location.href.endsWith('#/attendance')) {
        this.model.push(
          {
            label: 'attendance.label', icon: faUserCheck, items: [
              {label: 'attendance.registerAttendance', icon: faUserPlus, routerLink: ['/attendance/register']}
            ]
          });
      } else {
        this.model.push(
          {
            label: 'attendance.label', icon: faUserCheck, routerLink: ['/attendance'], items: [
              {label: 'attendance.registerAttendance', icon: faUserPlus, routerLink: ['/attendance/register']}
            ]
          });
      }
    }

    if (this.person.roles.includes('Administrator')) {
      this.model.push({label: 'proposal_evaluation.title', icon: faClipboardCheck, routerLink: ['/proposal-evaluation']})
      if (window.location.href.endsWith('#/attendance')) {
        this.model.push(
          {
            label: 'attendance.label', icon: faUserCheck, items: [
              {label: 'attendance.registerAttendance', icon: faUserPlus, routerLink: ['/attendance/register']},
              {label: 'attendance.edit', icon: faEdit, routerLink: ['/attendance/edit']}
            ]
          }
          );
      } else {
        this.model.push(
          {
            label: 'attendance.label', icon: faUserCheck, routerLink: ['/attendance'], items: [
              {label: 'attendance.registerAttendance', icon: faUserPlus, routerLink: ['/attendance/register']},
              {label: 'attendance.edit', icon: faEdit, routerLink: ['/attendance/edit']}
            ]
          }
        );
      }
      
      if (window.location.href.endsWith('#/administration/dashboard')) {
        this.model.push(
          {
            label: 'administration.label', icon: faCog, items: [
              {label: 'administration.domain', icon: faMapMarkedAlt, routerLink: ['/administration/domains']},
              {label: 'administration.structure', icon: faSitemap, routerLink: ['/administration/structures']},
              {label: 'administration.plan', icon: faClipboardList, routerLink: ['/administration/plans']},
              {label: 'administration.conference', icon: faComments, routerLink: ['/administration/conferences']},
              {label: 'administration.evaluators', icon: faPortrait, routerLink: ['/administration/evaluators']},
              {label: 'administration.citizen', icon: faUsers, routerLink: ['/administration/citizen']},
            ]
          });
        } else {
          this.model.push(
            {
              label: 'administration.label', icon: faCog, routerLink: ['/administration/dashboard'], items: [
                {label: 'administration.domain', icon: faMapMarkedAlt, routerLink: ['/administration/domains']},
                {label: 'administration.structure', icon: faSitemap, routerLink: ['/administration/structures']},
                {label: 'administration.plan', icon: faClipboardList, routerLink: ['/administration/plans']},
                {label: 'administration.conference', icon: faComments, routerLink: ['/administration/conferences']},
                {label: 'administration.evaluators', icon: faPortrait, routerLink: ['/administration/evaluators']},
                {label: 'administration.citizen', icon: faUsers, routerLink: ['/administration/citizen']},
            ]
          });
      }
    }
    if(this.model.length === 0){
      this.router.navigate(['/login']);
    }
  }
}
