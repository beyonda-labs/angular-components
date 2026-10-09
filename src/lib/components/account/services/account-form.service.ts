import { Injectable } from '@angular/core';
import { ValidatorFn } from '@angular/forms';

import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { FormPasswordField } from '../../form/models/fields/form-password-field.model';
import { FormTextField } from '../../form/models/fields/form-text-field.model';
import { FormButton, FormButtonType, FormConfig, FormHandle, FormRow, FormSection } from '../../form/models/form.model';
import { FormFieldCustomValidator } from '../../form/models/form-field-validator.model';
import {
    ACCOUNT_PASSWORD_SECTION,
    ACCOUNT_PROFILE_SECTION,
    AccountPasswordFormValue,
    AccountPasswordUpdate,
    AccountProfile,
    AccountProfileFormValue,
    AccountProfileUpdate
} from '../models/account.model';

const NEW_PASSWORD_FIELD = 'password';

@Injectable({
    providedIn: 'root'
})
export class AccountFormService {
    buildPasswordForm(
        prefix: string,
        onSubmit: (value: AccountPasswordUpdate, handle: FormHandle<AccountPasswordFormValue>) => void
    ): FormConfig<AccountPasswordFormValue> {
        return new FormConfig<AccountPasswordFormValue>({
            buttons: [new FormButton({ label: `${prefix}.password.save`, type: FormButtonType.Submit })],
            initialValue: { [ACCOUNT_PASSWORD_SECTION]: { currentPassword: '', password: '', password2: '' } },
            onSubmit: (value, handle) => onSubmit(value[ACCOUNT_PASSWORD_SECTION], handle),
            prefix,
            sections: [
                new FormSection({
                    isTitleVisible: false,
                    key: ACCOUNT_PASSWORD_SECTION,
                    rows: [
                        new FormRow({
                            fields: [
                                new FormPasswordField({
                                    autocomplete: 'current-password',
                                    isRequired: true,
                                    key: 'currentPassword'
                                })
                            ]
                        }),
                        new FormRow({
                            fields: [
                                new FormPasswordField({
                                    autocomplete: 'new-password',
                                    columns: 6,
                                    isRequired: true,
                                    key: NEW_PASSWORD_FIELD
                                }),
                                new FormPasswordField({
                                    autocomplete: 'new-password',
                                    columns: 6,
                                    isRequired: true,
                                    key: 'password2',
                                    validators: [
                                        new FormFieldCustomValidator(
                                            matchingPassword(`${prefix}.password.password2.mismatch`)
                                        )
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        });
    }

    buildProfileForm(
        prefix: string,
        profile: AccountProfile,
        onSubmit: (value: AccountProfileUpdate) => void
    ): FormConfig<AccountProfileFormValue> {
        return new FormConfig<AccountProfileFormValue>({
            buttons: [
                new FormButton({ label: `${prefix}.profile.cancel`, type: FormButtonType.Cancel }),
                new FormButton({ label: `${prefix}.profile.save`, type: FormButtonType.Submit })
            ],
            initialValue: { [ACCOUNT_PROFILE_SECTION]: { name: profile.name ?? '', surname: profile.surname ?? '' } },
            onSubmit: value => onSubmit(trimProfile(value[ACCOUNT_PROFILE_SECTION])),
            prefix,
            sections: [
                new FormSection({
                    isTitleVisible: false,
                    key: ACCOUNT_PROFILE_SECTION,
                    rows: [
                        new FormRow({
                            fields: [new FormInfoField({ items: [{ label: profile.email }], key: 'email' })]
                        }),
                        new FormRow({
                            fields: [
                                new FormTextField({ autocomplete: 'given-name', columns: 6, key: 'name' }),
                                new FormTextField({ autocomplete: 'family-name', columns: 6, key: 'surname' })
                            ]
                        })
                    ]
                })
            ]
        });
    }
}

function matchingPassword(messageKey: string): ValidatorFn {
    return control => {
        const password: unknown = control.parent?.get(NEW_PASSWORD_FIELD)?.value;

        return control.value && control.value !== password ? { mismatch: { messageKey } } : null;
    };
}

function trimProfile({ name, surname }: AccountProfileUpdate): AccountProfileUpdate {
    return { name: name.trim(), surname: surname.trim() };
}
