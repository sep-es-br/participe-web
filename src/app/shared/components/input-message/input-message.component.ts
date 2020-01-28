import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'tt-input-message',
  templateUrl: './input-message.component.html',
  styleUrls: ['./input-message.component.scss']
})
export class InputMessageComponent {
  @Input() form: FormGroup;
  @Input() field: string;

  isInvalid() {
    return !this.form.get(this.field).valid && this.form.get(this.field).touched;
  }

  message() {
    let message = 'Invalid field';

    if (this.form.get(this.field).errors.required) message = 'Required field.';

    return message;
  }
}
