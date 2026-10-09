import { TestBed } from '@angular/core/testing';

import { AccountProfile } from '../../../services/account/models/account.model';
import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { FormConfig, FormHandle } from '../../form/models/form.model';
import { AccountDataConfig, AccountDataFormValue } from '../models/account-data.model';
import { AccountDataField, AccountDataFieldKey } from '../models/account-data-field.model';
import { AccountDataFormService } from './account-data-form.service';

const PREFIX = 'demo.account-data';
const PROFILE: AccountProfile = { email: 'ada@example.test', hasPassword: true, id: 'u1', name: 'Ada', roles: [] };

describe('AccountDataFormService', () => {
    let service: AccountDataFormService;

    function build(fields?: AccountDataField[], onSubmit = jest.fn()): FormConfig<AccountDataFormValue> {
        return service.buildForm(new AccountDataConfig({ fields, prefix: PREFIX }), PROFILE, onSubmit);
    }

    function layoutOf(form: FormConfig<AccountDataFormValue>): string[][] {
        return form.sections[0].rows.map(row => row.fields.map(field => `${field.key}:${field.columns}`));
    }

    beforeEach(() => {
        service = TestBed.inject(AccountDataFormService);
    });

    it('builds the email to read over the name and the surname, side by side, by default', () => {
        const form = build();
        const [email] = form.sections[0].rows[0].fields;

        expect(layoutOf(form)).toEqual([['email:12'], ['name:6', 'surname:6']]);
        expect((email as FormInfoField).items).toEqual([{ label: 'ada@example.test' }]);
        expect(form.initialValue).toEqual({ profile: { name: 'Ada', surname: '' } });
        expect(form.buttons.map(button => button.label)).toEqual([`${PREFIX}.save`]);
    });

    it('lays the fields out in the order and the widths of the config, a row filling up to 12 columns', () => {
        const form = build([
            new AccountDataField({ columns: 4, key: AccountDataFieldKey.Surname }),
            new AccountDataField({ columns: 8, key: AccountDataFieldKey.Name }),
            new AccountDataField({ columns: 6, key: AccountDataFieldKey.Email })
        ]);

        expect(layoutOf(form)).toEqual([['surname:4', 'name:8'], ['email:6']]);
    });

    it('requires the fields the config requires, and never the email', () => {
        const form = build([
            new AccountDataField({ isRequired: true, key: AccountDataFieldKey.Email }),
            new AccountDataField({ isRequired: true, key: AccountDataFieldKey.Name }),
            new AccountDataField({ key: AccountDataFieldKey.Surname })
        ]);

        expect(form.sections[0].rows.flatMap(row => row.fields).map(field => field.isRequired)).toEqual([
            false,
            true,
            false
        ]);
    });

    it('submits only the editable fields of the config, trimmed', () => {
        const onSubmit = jest.fn();
        const form = build(
            [
                new AccountDataField({ key: AccountDataFieldKey.Email }),
                new AccountDataField({ key: AccountDataFieldKey.Name })
            ],
            onSubmit
        );

        form.onSubmit?.({ profile: { name: ' Augusta ', surname: 'Byron' } }, {} as FormHandle<AccountDataFormValue>);

        expect(form.initialValue).toEqual({ profile: { name: 'Ada' } });
        expect(onSubmit).toHaveBeenCalledWith({ name: 'Augusta' });
    });

    it('offers no button when the config shows only the email', () => {
        const form = build([new AccountDataField({ key: AccountDataFieldKey.Email })]);

        expect(form.buttons).toEqual([]);
    });
});
