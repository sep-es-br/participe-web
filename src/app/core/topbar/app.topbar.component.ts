import { Component } from '@angular/core';
import { AppTemplateComponent } from '../template/app.template.component';
import { TranslateService } from '@ngx-translate/core';
import { StoreKeys } from '../../shared/constants';
import { EventEmitter } from 'protractor';
import { TranslateChangeService } from '../../shared/services/translateChange.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent {

  constructor(
    public template: AppTemplateComponent,
    private translateChange: TranslateChangeService
  ) {

  }

  changeLanguage(lang: string) {
    this.translateChange.changeLangDefault(lang)
  }

  isSelectLanguage(lang: string) {
    const defaultLang = localStorage.getItem(StoreKeys.defaultLanguage) || 'en'
    return defaultLang === lang
  }

}
