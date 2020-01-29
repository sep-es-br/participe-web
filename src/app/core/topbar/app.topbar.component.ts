import { Component } from '@angular/core';
import { AppTemplateComponent } from '../template/app.template.component';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent {

    constructor(public template: AppTemplateComponent) {}
}
