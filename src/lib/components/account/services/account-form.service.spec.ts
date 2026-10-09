import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { FormHandle } from '../../form/models/form.model';
import { FormField } from '../../form/models/form-field.model';
import { FormFieldCustomValidator } from '../../form/models/form-field-validator.model';
import { AccountPasswordFormValue, AccountProfileFormValue } from '../models/account.model';
import { AccountFormService } from './account-form.service';

const PREFIX = 'demo.account';

describe('AccountFormService', () => {
    let service: AccountFormService;

    function fieldsOf(sections: { rows: { fields: FormField[] }[] }[]): FormField[] {
        return sections.flatMap(section => section.rows.flatMap(row => row.fields));
    }

    beforeEach(() => {
        service = TestBed.inject(AccountFormService);
    });

    it('builds the profile form from the profile, with the email to read and the name and surname to edit', () => {
        const onSubmit = jest.fn();
        const form = service.buildProfileForm(
            PREFIX,
            { email: 'ada@example.test', hasPassword: true, id: 'u1', name: 'Ada', roles: [] },
            onSubmit
        );
        const [email, ...editable] = fieldsOf(form.sections);

        expect((email as FormInfoField).items).toEqual([{ label: 'ada@example.test' }]);
        expect(editable.map(field => field.key)).toEqual(['name', 'surname']);
        expect(form.initialValue).toEqual({ profile: { name: 'Ada', surname: '' } });

        form.onSubmit?.({ profile: { name: ' Ada ', surname: ' Byron ' } }, {} as FormHandle<AccountProfileFormValue>);

        expect(onSubmit).toHaveBeenCalledWith({ name: 'Ada', surname: 'Byron' });
    });

    it('builds the password form, whose confirmation must match the new password', () => {
        const onSubmit = jest.fn();
        const form = service.buildPasswordForm(PREFIX, onSubmit);
        const confirmation = fieldsOf(form.sections).find(field => field.key === 'password2');
        const validate = (confirmation?.validators[0] as FormFieldCustomValidator).validatorFn;
        const group = new FormGroup({ password: new FormControl('new'), password2: new FormControl('other') });
        const value = { password: { currentPassword: 'old', password: 'new', password2: 'new' } };
        const handle = {} as FormHandle<AccountPasswordFormValue>;

        expect(validate(group.controls.password2)).toEqual({
            mismatch: { messageKey: `${PREFIX}.password.password2.mismatch` }
        });

        group.controls.password2.setValue('new');
        expect(validate(group.controls.password2)).toBeNull();

        form.onSubmit?.(value, handle);
        expect(onSubmit).toHaveBeenCalledWith(value.password, handle);
    });
});
