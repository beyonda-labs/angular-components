import { AccountDataConfig } from './account-data.model';
import { AccountDataField, AccountDataFieldKey } from './account-data-field.model';

describe('AccountDataConfig', () => {
    it('shows the email over the name and the surname, none of them required, by default', () => {
        const { baseUrl, fields, prefix } = new AccountDataConfig();

        expect(baseUrl).toBe('/account');
        expect(prefix).toBe('angular-components.account-data');
        expect(fields.map(({ columns, isRequired, key }) => ({ columns, isRequired, key }))).toEqual([
            { columns: 12, isRequired: false, key: AccountDataFieldKey.Email },
            { columns: 6, isRequired: false, key: AccountDataFieldKey.Name },
            { columns: 6, isRequired: false, key: AccountDataFieldKey.Surname }
        ]);
    });

    it('throws at construction for a field the account does not store', () => {
        expect(
            () => new AccountDataConfig({ fields: [new AccountDataField({ key: 'phone' as AccountDataFieldKey })] })
        ).toThrow('Unknown account data field: phone');
    });

    it('throws at construction for a field listed twice', () => {
        expect(
            () =>
                new AccountDataConfig({
                    fields: [
                        new AccountDataField({ key: AccountDataFieldKey.Email }),
                        new AccountDataField({ columns: 6, key: AccountDataFieldKey.Email })
                    ]
                })
        ).toThrow('Account data field listed twice: email');
    });
});
