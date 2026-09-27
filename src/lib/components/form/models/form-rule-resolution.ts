import { FormRule, FormValue } from './form-field.model';

export function resolveRule<T>(rule: FormRule<T>, value: FormValue): T {
    return typeof rule === 'function' ? (rule as (current: FormValue) => T)(value) : rule;
}
