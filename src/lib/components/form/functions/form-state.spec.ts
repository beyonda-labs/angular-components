import { FormControl, FormGroup, Validators } from '@angular/forms';

import { readState } from './form-state';

describe('form-state', () => {
    function buildGroup(): FormGroup {
        return new FormGroup({
            person: new FormGroup({
                code: new FormControl({ disabled: true, value: 'A-1' }),
                name: new FormControl('', Validators.required)
            })
        });
    }

    it('reads a pristine, invalid form with the value of its disabled controls too', () => {
        expect(readState(buildGroup())).toEqual({
            isDirty: false,
            isValid: false,
            value: { person: { code: 'A-1', name: '' } }
        });
    });

    it('reads a form the user changed into a valid one', () => {
        const group = buildGroup();

        group.get(['person', 'name'])?.setValue('Ada');
        group.markAsDirty();

        expect(readState(group)).toEqual({
            isDirty: true,
            isValid: true,
            value: { person: { code: 'A-1', name: 'Ada' } }
        });
    });
});
