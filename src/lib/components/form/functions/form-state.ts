import { FormGroup } from '@angular/forms';

import { FormValue } from '../models/form-field.model';
import { FormState } from '../models/form-state.model';

export function readState(formGroup: FormGroup): FormState {
    return { isDirty: formGroup.dirty, isValid: formGroup.valid, value: formGroup.getRawValue() as FormValue };
}
