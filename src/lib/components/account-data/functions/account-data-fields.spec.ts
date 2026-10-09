import { AccountDataFieldKey } from '../models/account-data-field.model';
import { assertAccountDataFields } from './account-data-fields';

describe('assertAccountDataFields', () => {
    it('accepts every field the account stores, each listed once, in any order', () => {
        expect(() =>
            assertAccountDataFields([
                { key: AccountDataFieldKey.Surname },
                { key: AccountDataFieldKey.Email },
                { key: AccountDataFieldKey.Name }
            ])
        ).not.toThrow();
    });

    it('refuses a field the account does not store', () => {
        expect(() => assertAccountDataFields([{ key: 'phone' as AccountDataFieldKey }])).toThrow(
            'Unknown account data field: phone'
        );
    });

    it('refuses a field listed twice', () => {
        expect(() =>
            assertAccountDataFields([{ key: AccountDataFieldKey.Name }, { key: AccountDataFieldKey.Name }])
        ).toThrow('Account data field listed twice: name');
    });
});
