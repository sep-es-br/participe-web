import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { StoreKeys } from '../constants';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class TranslateChangeService {

    constructor(
        private translate: TranslateService
    ) { }

    private subject = new Subject<any>();

    changeLangDefault(lang: string) {
        localStorage.setItem(StoreKeys.defaultLanguage, lang);
        this.translate.setDefaultLang(lang);
        this.subject.next({ lang });
    }

    getCurrentLang(): Observable<any> {
        setTimeout(() => {
            const lang = localStorage.getItem(StoreKeys.defaultLanguage) || 'pt';
            this.subject.next({ lang });
        }, 500);
        return this.subject.asObservable();
    }
}
