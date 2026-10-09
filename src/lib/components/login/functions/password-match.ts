import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const PASSWORD_KEY = 'password';

export function passwordsMatchValidator(messageKey: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const password = control.parent?.get(PASSWORD_KEY)?.value as unknown;

        return control.value && control.value !== password ? { passwordsNotMatch: { messageKey } } : null;
    };
}
