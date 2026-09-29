import { signal } from '@angular/core';

import { FormValue } from './form-field.model';
import { resolveRule } from './form-rule-resolution';

describe('resolveRule', () => {
    const value: FormValue = { account: { plan: 'pro' } };

    it('returns a fixed rule as it is', () => {
        expect(resolveRule(true, value)).toBe(true);
    });

    it('evaluates a rule function against the current form value', () => {
        expect(resolveRule(current => current['account']['plan'] === 'pro', value)).toBe(true);
        expect(resolveRule(current => current['account']['plan'] === 'free', value)).toBe(false);
    });

    it('reads the current value of a signal rule', () => {
        const isRequired = signal(false);

        expect(resolveRule(isRequired, value)).toBe(false);

        isRequired.set(true);
        expect(resolveRule(isRequired, value)).toBe(true);
    });
});
