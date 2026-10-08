import { ValidationErrors } from '@angular/forms';

import { FormFieldError } from '../models/form-field-validator.model';

export function fieldErrorOf(errors: ValidationErrors | null): FormFieldError | null {
    return Object.values(errors ?? {}).find(isFieldError) ?? null;
}

function isFieldError(error: unknown): error is FormFieldError {
    return typeof error === 'object' && error !== null && typeof (error as FormFieldError).messageKey === 'string';
}
