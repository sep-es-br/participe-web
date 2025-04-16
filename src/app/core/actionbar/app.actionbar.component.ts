import {Component, OnDestroy} from '@angular/core';
import {BreadcrumbService} from '@app/core/breadcrumb/breadcrumb.service';
import {Subscription} from 'rxjs';
import {MenuItem} from 'primeng/api';
import {ActionBarService, ActionButtonItem} from './app.actionbar.actions.service';
import {TranslateService} from '@ngx-translate/core';
import { IRecordAmount } from './recordAmmount.interface';

@Component({
  selector: 'app-actionbar',
  templateUrl: './app.actionbar.component.html',
  styleUrl: './app.actionbar.component.scss'
})
export class AppActionBarComponent implements OnDestroy {

  subscription: Subscription;
  subActions: Subscription;
  subRecordAmount: Subscription;

  items: MenuItem[];
  actionsButtonLeft: ActionButtonItem[] = [];
  actionsButtonRight: ActionButtonItem[] = [];

  recordAmount : IRecordAmount;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private actionBarService: ActionBarService,
    private translateSrv: TranslateService
  ) {
    
    this.subscription = breadcrumbService.itemsHandler.subscribe(response => {
      this.items = response;
    });
    this.subActions = actionBarService.itemsHandler.subscribe(response => {
      this.actionsButtonLeft = response.filter(action => action.position === 'LEFT');
      this.actionsButtonRight = response.filter(action => action.position === 'RIGHT');
    });
    this.subRecordAmount = actionBarService.recordAmountHandler.subscribe(
      value => {
        this.recordAmount = value;
      }
    )

  }

  get translationLang () {
    return this.translateSrv.currentLang || this.translateSrv.getBrowserLang();
  }

  

  isClickable(item: ActionButtonItem): boolean {
    return !!item.handle;
  }

  handleEvent(item: ActionButtonItem) {
    if (this.isClickable(item)) {
      item.handle();
    }
  }

  translateAllLabels(labels): string {
    if (labels != null) {
      return labels.split(' ').map(label => this.translateSrv.instant(label)).join(' ');
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.subActions) {
      this.subActions.unsubscribe();
    }
    if (this.subRecordAmount){
      this.subRecordAmount.unsubscribe();
    }
  }
}
