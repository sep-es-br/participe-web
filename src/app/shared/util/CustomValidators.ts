import {AbstractControl, FormControl, ValidationErrors} from '@angular/forms';

export class CustomValidators {
  static ValidateCPF(control: AbstractControl): ValidationErrors {
    const cpf = control.value;

    let sum: number = 0;
    let rest: number;
    let valid: boolean;

    const regex = new RegExp('[0-9]{11}');

    if (
      cpf === '00000000000' || cpf === '11111111111' || cpf === '22222222222' || cpf === '33333333333' ||
      cpf === '44444444444' || cpf === '55555555555' || cpf === '66666666666' || cpf === '77777777777' ||
      cpf === '88888888888' || cpf === '99999999999' ||
      !regex.test(cpf)
    ) {
      valid = false;
    } else {
      for (let i = 1; i <= 9; i++) {
        sum = sum + parseInt(cpf.substring(i - 1, i), 0) * (11 - i);
      }
      rest = (sum * 10) % 11;

      if (rest === 10 || rest === 11) {
        rest = 0;
      }
      if (rest !== parseInt(cpf.substring(9, 10), 0)) {
        valid = false;
      }

      sum = 0;
      for (let i = 1; i <= 10; i++) {
        sum = sum + parseInt(cpf.substring(i - 1, i), 0) * (12 - i);
      }
      rest = (sum * 10) % 11;

      if (rest === 10 || rest === 11) {
        rest = 0;
      }
      if (rest !== parseInt(cpf.substring(10, 11), 0)) {
        valid = false;
      }
      valid = true;
    }

    if (valid) {
      return null;
    }

    return { invalid: true };
  }

  static AttendeeCitizenPassword(control: AbstractControl): ValidationErrors {
    const password = control.value;
    if (password === null || password === undefined) {
      return null;
    }
    if (password.match(/\D/g)) {
      return { custom: { invalid: true, message: 'attendance.error.onlyDigitsPassword' } };
    }
    if (password.length !== 6) {
      return { custom: { invalid: true, message: 'attendance.error.lenghtOf6Password' } };
    }
    return null;
  }

  static URIServerName(control: AbstractControl): ValidationErrors {
    // tslint:disable-next-line: max-line-length
    const regexUri = /^([a-z][a-z0-9+.-]*):(?:\/\/((?:(?=((?:[a-z0-9-._~!$&'()*+,;=:]|%[0-9A-F]{2})*))(\3)@)?(?=(\[[0-9A-F:.]{2,}]|(?:[a-z0-9-._~!$&'()*+,;=]|%[0-9A-F]{2})*))\5(?::(?=(\d*))\6)?)(\/(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*))\8)?|(\/?(?!\/)(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*))\10)?)(?:\?(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9A-F]{2})*))\11)?(?:#(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9A-F]{2})*))\12)?$/i;
    const uri = control.value;
    if (regexUri.test(uri)) {
      return null;
    } else {
      return { custom: { invalid: true, message: 'conference.error.serverNameInvalid' } };
    }
  }

  static ExternalURL(control: AbstractControl): ValidationErrors {
    // tslint:disable-next-line: max-line-length
    const regexUri = /^([a-z][a-z0-9+.-]*):(?:\/\/((?:(?=((?:[a-z0-9-._~!$&'()*+,;=:]|%[0-9A-F]{2})*))(\3)@)?(?=(\[[0-9A-F:.]{2,}]|(?:[a-z0-9-._~!$&'()*+,;=]|%[0-9A-F]{2})*))\5(?::(?=(\d*))\6)?)(\/(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*))\8)?|(\/?(?!\/)(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*))\10)?)(?:\?(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9A-F]{2})*))\11)?(?:#(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9A-F]{2})*))\12)?$/i;
    const uri = control.value;
    if (regexUri.test(uri)) {
      return null;
    } else {
      return { custom: { invalid: true, message: 'conference.error.externalLinkInvalid' } };
    }
  }

  static ResearchLink(control: AbstractControl): ValidationErrors {
    // tslint:disable-next-line: max-line-length
    const regexUri = /^([a-z][a-z0-9+.-]*):(?:\/\/((?:(?=((?:[a-z0-9-._~!$&'()*+,;=:]|%[0-9A-F]{2})*))(\3)@)?(?=(\[[0-9A-F:.]{2,}]|(?:[a-z0-9-._~!$&'()*+,;=]|%[0-9A-F]{2})*))\5(?::(?=(\d*))\6)?)(\/(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*))\8)?|(\/?(?!\/)(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*))\10)?)(?:\?(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9A-F]{2})*))\11)?(?:#(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9A-F]{2})*))\12)?$/i;
    const uri = control.value;
    if (regexUri.test(uri)) {
      return null;
    } else {
      return { custom: { invalid: true, message: 'conference.error.researchLinkInvalid' } };
    }
  }

  static ChannelURL(control: AbstractControl): ValidationErrors {
    // tslint:disable-next-line: max-line-length
    const regexUri = /^([a-z][a-z0-9+.-]*):(?:\/\/((?:(?=((?:[a-z0-9-._~!$&'()*+,;=:]|%[0-9A-F]{2})*))(\3)@)?(?=(\[[0-9A-F:.]{2,}]|(?:[a-z0-9-._~!$&'()*+,;=]|%[0-9A-F]{2})*))\5(?::(?=(\d*))\6)?)(\/(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*))\8)?|(\/?(?!\/)(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/]|%[0-9A-F]{2})*))\10)?)(?:\?(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9A-F]{2})*))\11)?(?:#(?=((?:[a-z0-9-._~!$&'()*+,;=:@\/?]|%[0-9A-F]{2})*))\12)?$/i;
    const uri = control.value;
    if (regexUri.test(uri)) {
      return null;
    } else {
      return { custom: { invalid: true, message: 'conference.meeting.error.channelUrlInvalid' } };
    }
  }

  static DoesNotContainChannel(control: AbstractControl): ValidationErrors {
    return { custom: { invalid: true, message: 'conference.meeting.error.doesNotContainChannel' } };
  }

  static noWhitespaceValidator(control: FormControl) {
    const isWhitespace = control.value ? control.value.match(/^ *$/) !== null : true;
    return !isWhitespace ? null : {custom: {invalid: true, message: 'erro.field-cannot-be-empty'}};
  }

  static isStructureRegionalizationValidator(isStructureRegionalizable: boolean) {
    return (control: AbstractControl): ValidationErrors => {
      return isStructureRegionalizable ? null : { custom: { invalid: true, message: 'conference.error.plan-regionalizable' } };
    };
  }

  static onlyLettersAndSpaceValidator(control: FormControl) {
    const acceptable = control.value ? control.value.match(/^[A-Za-z0-9À-ÖØ-öø-ÿ\s]*$/) !== null : false;
    return acceptable ? null : {custom: {invalid: true, message: 'erro.field-must-contain-only-letters'}};
  }

}
