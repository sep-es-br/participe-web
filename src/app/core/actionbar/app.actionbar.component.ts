import { Component, OnDestroy } from '@angular/core';
import { BreadcrumbService } from '@app/core/breadcrumb/breadcrumb.service';
import { Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { ActionButtonItem, ActionBarService } from './app.actionbar.actions.service';

@Component({
    selector: 'app-actionbar',
    templateUrl: './app.actionbar.component.html'
})
export class AppActionBarComponent implements OnDestroy {

    subscription: Subscription;
    subActions: Subscription;

    items: MenuItem[];
    actionsButtonLeft: ActionButtonItem[] = [];
    actionsButtonRight: ActionButtonItem[] = [];

    constructor(
        private breadcrumbService: BreadcrumbService,
        private actionBarService: ActionBarService
    ) {
        this.subscription = breadcrumbService.itemsHandler.subscribe(response => {
            this.items = response;
        });
        this.subActions = actionBarService.itemsHandler.subscribe(response => {
            this.actionsButtonLeft = response.filter(action => action.position === 'LEFT');
            this.actionsButtonRight = response.filter(action => action.position === 'RIGHT');
        });
    }

    isClickable(item: ActionButtonItem): boolean {
        return !!item.handle;
    }

    handleEvent(item: ActionButtonItem) {
        if (this.isClickable(item)) {
            item.handle();
        }
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.subActions) {
            this.subActions.unsubscribe();
        }
    }
}
