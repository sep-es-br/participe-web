import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StoreKeys } from './shared/constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  constructor(private translate: TranslateService) {
    const defaultLang = localStorage.getItem(StoreKeys.defaultLanguage) || 'pt'
    translate.setDefaultLang(defaultLang);
  }
}
