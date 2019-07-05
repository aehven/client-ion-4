import { FormGroup } from '@angular/forms';

export class MyValidators {
  static mailFormat(control: any) {
      if(control.value == null) {
        return null;
      }

      var EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

      if (control.value != "" && (control.value.length <= 5 || !EMAIL_REGEXP.test(control.value))) {
          return { "mailFormat": true };
      }

      return null;
  }

  static matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
    return (group: FormGroup): {[key: string]: any} => {
      let password = group.controls[passwordKey];
      let confirmPassword = group.controls[confirmPasswordKey];

      if (password.value !== confirmPassword.value) {
        console.log("password mismatch");
        return {
          mismatchedPasswords: true
        };
      }
    }
  }
}
