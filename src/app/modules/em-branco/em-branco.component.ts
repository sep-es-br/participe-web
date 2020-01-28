import { Component } from '@angular/core';
import { BreadcrumbService } from '@app/core/breadcrumb/breadcrumb.service';

@Component({
  selector: 'tt-em-branco',
  templateUrl: './em-branco.component.html'
})
export class EmBrancoComponent {

  constructor(private breadcrumbService: BreadcrumbService) {
    this.breadcrumbService.setItems([
        { label: 'Exemplos' },
        { label: 'Página em branco', routerLink: ['/em-branco'] }
    ]);
  }
}
