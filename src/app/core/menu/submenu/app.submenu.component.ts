import { Component, Input, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';

import { BreadcrumbService } from '@app/core/breadcrumb/breadcrumb.service';

import { AppMenuComponent } from '@app/core/menu/app.menu.component';
import { AppTemplateComponent } from '@app/core/template/app.template.component';
import { Router } from '@angular/router';

@Component({
    /* tslint:disable:component-selector */
    selector: '[app-submenu]',
    /* tslint:enable:component-selector */
    templateUrl: './app.submenu.component.html',
    styleUrls: [ './app.submenu.component.scss' ],
    animations: [
        trigger('children', [
            state('hiddenAnimated', style({
                height: '0px'
            })),
            state('visibleAnimated', style({
                height: '*'
            })),
            state('visible', style({
                height: '*',
                'z-index': 100
            })),
            state('hidden', style({
                height: '0px',
                'z-index': '*'
            })),
            transition('visibleAnimated => hiddenAnimated', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
            transition('hiddenAnimated => visibleAnimated', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
        ])
    ]
})
export class AppSubMenuComponent implements OnDestroy {

    @Input() item: MenuItem;

    @Input() root: boolean;

    @Input() visible: boolean;

    _parentActive: boolean;

    _reset: boolean;

    activeIndex: number;

    subscription: Subscription;

    routeItems: MenuItem[];

    constructor(public template: AppTemplateComponent, public appMenu: AppMenuComponent, public breadcrumbService: BreadcrumbService, private router: Router) {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.subscription = breadcrumbService.itemsHandler.subscribe(response => {
            this.routeItems = response;
        });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    itemClick(event: Event, item: MenuItem, index: number) {
        if (this.root) {
            this.template.menuHoverActive = !this.template.menuHoverActive;
        }
        // avoid processing disabled items
        if (item.disabled) {
            event.preventDefault();
            return true;
        }

        // activate current item and deactivate active sibling if any
        this.activeIndex = (this.activeIndex === index) ? null : index;

        // execute command
        if (item.command) {
            item.command({ originalEvent: event, item });
        }

        // prevent hash change
        if (item.items || (!item.url && !item.routerLink)) {
            event.preventDefault();
        }

        // hide menu
        if (!item.items) {
            if (this.template.isHorizontal()) {
                this.template.resetMenu = true;
            } else {
                this.template.resetMenu = false;
            }

            this.template.overlayMenuActive = false;
            this.template.overlayMenuMobileActive = false;
            this.template.menuHoverActive = !this.template.menuHoverActive;
        }
        this.router.navigated = false;
    }

    onMouseEnter(index: number) {
        if (this.root && this.template.menuHoverActive && this.template.isHorizontal()
            && !this.template.isMobile() && !this.template.isTablet()) {
            this.activeIndex = index;
        }
    }

    isActive(index: number): boolean {
        return this.activeIndex === index;
    }

    @Input() get reset(): boolean {
        return this._reset;
    }

    set reset(val: boolean) {
        this._reset = val;
        if (this._reset && this.template.isHorizontal()) {
            this.activeIndex = null;
        }
    }

    @Input() get parentActive(): boolean {
        return this._parentActive;
    }
    set parentActive(val: boolean) {
        this._parentActive = val;
        if (!this._parentActive) {
            this.activeIndex = null;
        }
    }
}
