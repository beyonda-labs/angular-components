import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { FormFooter, FormHandle } from '../../form/models/form.model';
import { FormField } from '../../form/models/form-field.model';
import { FormFieldCustomValidator } from '../../form/models/form-field-validator.model';
import { PasswordChangeFormValue } from '../models/password-change.model';
import { PasswordChangeFormService } from './password-change-form.service';

const PREFIX = 'demo.password-change';

describe('PasswordChangeFormService', () => {
    let service: PasswordChangeFormService;

    function fieldsOf(sections: { rows: { fields: FormField[] }[] }[]): FormField[] {
        return sections.flatMap(section => section.rows.flatMap(row => row.fields));
    }

    beforeEach(() => {
        service = TestBed.inject(PasswordChangeFormService);
    });

    it('builds an empty form of the current password, the new one and its confirmation', () => {
        const form = service.buildForm(PREFIX, jest.fn());

        expect(fieldsOf(form.sections).map(field => field.key)).toEqual(['currentPassword', 'password', 'password2']);
        expect(form.initialValue).toEqual({ password: { currentPassword: '', password: '', password2: '' } });
        expect(form.buttons.map(button => button.label)).toEqual([`${PREFIX}.save`]);
    });

    it('hints the minimum length under the new password and divides the button from the form', () => {
        const form = service.buildForm(PREFIX, jest.fn());

        expect(fieldsOf(form.sections).map(field => field.hint)).toEqual([
            undefined,
            `${PREFIX}.password.password.hint`,
            undefined
        ]);
        expect(form.footer).toEqual(new FormFooter({ isDivided: true }));
    });

    it('asks for a confirmation that matches the new password', () => {
        const form = service.buildForm(PREFIX, jest.fn());
        const confirmation = fieldsOf(form.sections).find(field => field.key === 'password2');
        const validate = (confirmation?.validators[0] as FormFieldCustomValidator).validatorFn;
        const group = new FormGroup({ password: new FormControl('new-secret'), password2: new FormControl('other') });

        expect(validate(group.controls.password2)).toEqual({
            mismatch: { messageKey: `${PREFIX}.password.password2.mismatch` }
        });

        group.controls.password2.setValue('new-secret');
        expect(validate(group.controls.password2)).toBeNull();
    });

    it('hands the passwords and the handle of the form to its submit', () => {
        const onSubmit = jest.fn();
        const form = service.buildForm(PREFIX, onSubmit);
        const value = { password: { currentPassword: 'old', password: 'new-secret', password2: 'new-secret' } };
        const handle = {} as FormHandle<PasswordChangeFormValue>;

        form.onSubmit?.(value, handle);

        expect(onSubmit).toHaveBeenCalledWith(value.password, handle);
    });
});
