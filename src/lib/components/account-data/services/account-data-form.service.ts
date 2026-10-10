import { Injectable } from '@angular/core';

import { AccountProfile, AccountProfileUpdate } from '../../../services/account/models/account.model';
import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { FormTextField } from '../../form/models/fields/form-text-field.model';
import { FormButton, FormButtonType, FormConfig, FormFooter, FormRow, FormSection } from '../../form/models/form.model';
import { FormField } from '../../form/models/form-field.model';
import {
    ACCOUNT_DATA_SECTION,
    AccountDataConfig,
    AccountDataEditableKey,
    AccountDataFormValue
} from '../models/account-data.model';
import { ACCOUNT_DATA_HINTED_FIELDS, AccountDataField, AccountDataFieldKey } from '../models/account-data-field.model';

const AUTOCOMPLETE: Readonly<Record<AccountDataEditableKey, string>> = {
    [AccountDataFieldKey.Name]: 'given-name',
    [AccountDataFieldKey.Surname]: 'family-name'
};
const ROW_COLUMNS = 12;

@Injectable({
    providedIn: 'root'
})
export class AccountDataFormService {
    buildForm(
        { fields, prefix }: Pick<AccountDataConfig, 'fields' | 'prefix'>,
        profile: AccountProfile,
        onSubmit: (value: AccountProfileUpdate) => void
    ): FormConfig<AccountDataFormValue> {
        const editableKeys = fields.map(field => field.key).filter(isEditable);

        return new FormConfig<AccountDataFormValue>({
            buttons:
                editableKeys.length > 0
                    ? [new FormButton({ label: `${prefix}.save`, type: FormButtonType.Submit })]
                    : [],
            footer: new FormFooter(),
            initialValue: {
                [ACCOUNT_DATA_SECTION]: Object.fromEntries(editableKeys.map(key => [key, profile[key] ?? '']))
            },
            onSubmit: value => onSubmit(trimEditable(value[ACCOUNT_DATA_SECTION], editableKeys)),
            prefix,
            sections: [
                new FormSection({
                    isTitleVisible: false,
                    key: ACCOUNT_DATA_SECTION,
                    rows: packRows(fields.map(field => buildField(field, profile, prefix)))
                })
            ]
        });
    }
}

function buildField(field: AccountDataField, profile: AccountProfile, prefix: string): FormField {
    const { columns, isRequired, key } = field;
    const hint = hintOf(field, prefix);

    if (isEditable(key)) {
        return new FormTextField({ autocomplete: AUTOCOMPLETE[key], columns, hint, isRequired, key });
    }

    return new FormInfoField({ columns, hint, items: [{ label: profile.email }], key });
}

function hintOf({ hint, key }: AccountDataField, prefix: string): string | undefined {
    const defaultHint = ACCOUNT_DATA_HINTED_FIELDS.has(key) ? `${prefix}.${ACCOUNT_DATA_SECTION}.${key}.hint` : '';

    return (hint ?? defaultHint) || undefined;
}

function isEditable(key: AccountDataFieldKey): key is AccountDataEditableKey {
    return key !== AccountDataFieldKey.Email;
}

function packRows(fields: FormField[]): FormRow[] {
    return fields
        .reduce<FormField[][]>((rows, field) => {
            const last = rows.at(-1);

            return last && widthOf(last) + field.columns <= ROW_COLUMNS
                ? [...rows.slice(0, -1), [...last, field]]
                : [...rows, [field]];
        }, [])
        .map(row => new FormRow({ fields: row }));
}

function trimEditable(
    value: AccountDataFormValue[typeof ACCOUNT_DATA_SECTION],
    keys: AccountDataEditableKey[]
): AccountProfileUpdate {
    return Object.fromEntries(keys.map(key => [key, (value[key] ?? '').trim()]));
}

function widthOf(fields: FormField[]): number {
    return fields.reduce((width, field) => width + field.columns, 0);
}
