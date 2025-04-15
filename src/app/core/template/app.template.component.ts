import { AuthService } from '@app/shared/services/auth.service';
import {Component, Renderer2} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-template',
  templateUrl: './app.template.component.html',
  styleUrls: ['./app.template.component.scss'],
  animations: [
    trigger('mask-anim', [
      state('void', style({
        opacity: 0
      })),
      state('visible', style({
        opacity: 0.8
      })),
      transition('* => *', animate('250ms cubic-bezier(0, 0, 0.2, 1)'))
    ])
  ]
})
export class AppTemplateComponent {
  layout = 'layout-turquoise';

  layoutMode = 'horizontal';

  configDialogActive = false;

  theme = 'turquoise';

  scheme = 'light';

  topbarItemClick: boolean;

  activeTopbarItem: any;

  resetMenu: boolean;

  menuHoverActive: boolean;

  topbarMenuActive: boolean;

  overlayMenuActive: boolean;

  menuClick: boolean;

  overlayMenuMobileActive: boolean;

  constructor(public renderer: Renderer2,
              public authService: AuthService) {
  }

  onLayoutClick() {
    if (!this.topbarItemClick) {
      this.activeTopbarItem = null;
      this.topbarMenuActive = false;
    }

    if (!this.menuClick) {
      if (this.isHorizontal()) {
        this.resetMenu = true;
      }

      if (this.overlayMenuActive || this.overlayMenuMobileActive) {
        this.hideOverlayMenu();
      }

      this.menuHoverActive = false;
    }

    this.topbarItemClick = false;
    this.menuClick = false;
  }

  onTopbarItemClick(event, item) {
    this.topbarItemClick = true;

    if (this.activeTopbarItem === item) {
      this.activeTopbarItem = null;
    } else {
      this.activeTopbarItem = item;
    }

    event.preventDefault();
  }

  onTopbarSubItemClick(event) {
    event.preventDefault();
    this.authService.signOut();
  }

  changeComponentTheme(event, theme, scheme) {
    this.theme = theme;
    this.scheme = scheme;
    const themeLink: HTMLLinkElement = document.getElementById('theme-css') as HTMLLinkElement;
    themeLink.href = 'assets/theme/' + theme + '/theme-' + scheme + '.css';

    event.preventDefault();
  }

  changeLayoutTheme(event, color, theme, scheme) {
    this.layout = color;
    const layoutLink: HTMLLinkElement = document.getElementById('layout-css') as HTMLLinkElement;
    layoutLink.href = 'assets/layout/css/' + color + '.css';

    this.changeComponentTheme(event, theme, scheme);

    event.preventDefault();
  }

  changeLayoutMode(event, mode) {
    this.layoutMode = mode;
    event.preventDefault();
  }

  onMenuButtonClick(event) {
    this.menuClick = true;
    this.topbarMenuActive = false;

    if (this.layoutMode === 'overlay' && !this.isMobile()) {
      this.overlayMenuActive = !this.overlayMenuActive;
    } else {
      if (!this.isDesktop()) {
        this.overlayMenuMobileActive = !this.overlayMenuMobileActive;
      }
    }

    event.preventDefault();
  }

  onMenuClick() {
    this.menuClick = true;
    this.resetMenu = false;
  }

  hideOverlayMenu() {
    this.overlayMenuActive = false;
    this.overlayMenuMobileActive = false;
  }

  isTablet() {
    const width = window.innerWidth;
    return width <= 1024 && width > 640;
  }

  isDesktop() {
    return window.innerWidth > 1024;
  }

  isMobile() {
    return window.innerWidth <= 640;
  }

  isOverlay() {
    return this.layoutMode === 'overlay';
  }

  isHorizontal() {
    return this.layoutMode === 'horizontal';
  }
}
