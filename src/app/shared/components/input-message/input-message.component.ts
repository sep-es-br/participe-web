import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'tt-input-message',
  templateUrl: './input-message.component.html',
  styleUrls: ['./input-message.component.scss']
})
export class InputMessageComponent {
  @Input() form: UntypedFormGroup;
  @Input() field: string;

  constructor(
    private translate: TranslateService
  ) { }

  isInvalid() {
    return !this.form.get(this.field).valid && this.form.get(this.field).touched;
  }

  message() {
    const errors = this.form.get(this.field).errors;
    if (!errors) {
      return;
    }
    let message = this.translate.instant(errors.custom ? errors.custom.message : 'erro.invalid.field');
    if (errors.email) {
      message = this.translate.instant('erro.email.field');
    }
    if (errors.required) {
      message = this.translate.instant('erro.required.field');
    }
    return message;
  }
}
