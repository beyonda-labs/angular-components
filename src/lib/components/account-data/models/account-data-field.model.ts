import { FormFieldColumn } from '../../form/models/form-field.model';

export enum AccountDataFieldKey {
    Email = 'email',
    Name = 'name',
    Surname = 'surname'
}

export class AccountDataField {
    columns: FormFieldColumn;
    isRequired: boolean;
    key: AccountDataFieldKey;

    constructor({ columns, isRequired = false, key }: AccountDataFieldParameters) {
        this.columns = columns ?? ACCOUNT_DATA_FIELD_COLUMNS[key];
        this.isRequired = isRequired;
        this.key = key;
    }
}

export interface AccountDataFieldParameters {
    key: AccountDataFieldKey;

    columns?: FormFieldColumn;
    isRequired?: boolean;
}

export const ACCOUNT_DATA_FIELD_COLUMNS: Readonly<Record<AccountDataFieldKey, FormFieldColumn>> = {
    [AccountDataFieldKey.Email]: 12,
    [AccountDataFieldKey.Name]: 6,
    [AccountDataFieldKey.Surname]: 6
};
