import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { LoadingService } from './shared/services/loading.service';
import { StoreKeys } from './shared/constants';
import { TranslateService } from '@ngx-translate/core';
import { delay } from 'rxjs/operators';
import { ResponsiveService } from './shared/services/responsive.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  isLoading: boolean = false;
  loadingPercentage: number;
  isMobileView = false;

  constructor(
    private loadingSrv: LoadingService,
    private change: ChangeDetectorRef,
    private translate: TranslateService,
    private responsiveSrv: ResponsiveService,
  ) {
    const defaultLang = localStorage.getItem(StoreKeys.defaultLanguage) || 'pt';
    translate.setDefaultLang(defaultLang);
  }

  ngOnInit(): void {
    this.loadingSrv.isLoading().subscribe(x => {
      this.isLoading = x; this.change.detectChanges();
    });
    this.loadingSrv.getProgressLoading().pipe(delay(250)).subscribe(p => {
      if (!p) {
        return setTimeout(() =>
          this.loadingPercentage = p,
          1000);
      }
      this.loadingPercentage = p;
    });
    this.detectViewMode(window.innerWidth);
  }

  detectViewMode(width: number) {
    if (!this.isMobileView && width <= 768) {
      this.responsiveSrv.next(true);
    }
    if (this.isMobileView && width > 768) {
      this.responsiveSrv.next(false);
    }
  }
}
