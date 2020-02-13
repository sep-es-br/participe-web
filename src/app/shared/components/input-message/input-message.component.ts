import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'tt-input-message',
  templateUrl: './input-message.component.html',
  styleUrls: ['./input-message.component.scss']
})
export class InputMessageComponent {
  @Input() form: FormGroup;
  @Input() field: string;

  constructor(
    private translate: TranslateService
  ) { }

  isInvalid() {
    return !this.form.get(this.field).valid && this.form.get(this.field).touched;
  }

  message() {
    let message =  this.translate.instant('erro.invalid.field');

    if (this.form.get(this.field).errors.required) message = this.translate.instant('erro.required.field');
    
    return message;
  }
}
