import { isSignal, Signal } from '@angular/core';

import { FormRule, FormValue } from '../models/form-field.model';

export function resolveRule<T>(rule: FormRule<T>, value: FormValue): T {
    if (isSignal(rule)) {
        return (rule as Signal<T>)();
    }

    return typeof rule === 'function' ? (rule as (current: FormValue) => T)(value) : rule;
}
