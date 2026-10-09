import { AccountProfileUpdate } from '../../../services/account/models/account.model';
import { assertAccountDataFields } from '../functions/account-data-fields';
import { AccountDataField, AccountDataFieldKey } from './account-data-field.model';

export type AccountDataEditableKey = AccountDataFieldKey.Name | AccountDataFieldKey.Surname;

export interface AccountDataFormValue {
    profile: Pick<AccountProfileUpdate, 'name' | 'surname'>;
}

export interface AccountDataTexts {
    description: string;
    title: string;
}

export class AccountDataConfig {
    baseUrl: string;
    fields: AccountDataField[];
    prefix: string;

    constructor({
        baseUrl = '/account',
        fields = [
            new AccountDataField({ key: AccountDataFieldKey.Email }),
            new AccountDataField({ key: AccountDataFieldKey.Name }),
            new AccountDataField({ key: AccountDataFieldKey.Surname })
        ],
        prefix = 'angular-components.account-data'
    }: AccountDataConfigParameters = {}) {
        assertAccountDataFields(fields);

        this.baseUrl = baseUrl;
        this.fields = fields;
        this.prefix = prefix;
    }
}

export interface AccountDataConfigParameters {
    baseUrl?: string;
    fields?: AccountDataField[];
    prefix?: string;
}

export const ACCOUNT_DATA_SECTION = 'profile';
