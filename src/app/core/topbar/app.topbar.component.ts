import { AuthService } from './../../shared/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { AppTemplateComponent } from '../template/app.template.component';
import { TranslateService } from '@ngx-translate/core';
import { StoreKeys } from '../../shared/constants';
import { EventEmitter } from 'protractor';
import { TranslateChangeService } from '../../shared/services/translateChange.service';
import { IPerson } from '../../shared/interface/IPerson';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent implements OnInit {

  person: IPerson;

  constructor(
    public template: AppTemplateComponent,
    private translateChange: TranslateChangeService,
    private userAuth: AuthService
  ) {

  }

  get shortName() {
    try {
      return this.person.name.split(' ').filter((_, i) => i <= 1).join(' ');
    } catch (error) {
      return this.person.name;
    }
  }

  ngOnInit(): void {
    this.person = this.userAuth.getUserInfo;
  }

  changeLanguage(lang: string) {
    this.translateChange.changeLangDefault(lang);
  }

  isSelectLanguage(lang: string) {
    const defaultLang = localStorage.getItem(StoreKeys.defaultLanguage) || 'en';
    return defaultLang === lang;
  }



}
