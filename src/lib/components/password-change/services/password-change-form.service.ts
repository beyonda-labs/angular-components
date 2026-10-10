import { Injectable } from '@angular/core';
import { ValidatorFn } from '@angular/forms';

import { AccountPasswordUpdate } from '../../../services/account/models/account.model';
import { FormPasswordField } from '../../form/models/fields/form-password-field.model';
import {
    FormButton,
    FormButtonType,
    FormConfig,
    FormFooter,
    FormHandle,
    FormRow,
    FormSection
} from '../../form/models/form.model';
import {
    FormFieldCustomValidator,
    FormFieldLengthValidator,
    FormFieldValidatorType
} from '../../form/models/form-field-validator.model';
import { PASSWORD_CHANGE_SECTION, PasswordChangeFormValue } from '../models/password-change.model';

const NEW_PASSWORD_FIELD = 'password';
const PASSWORD_MIN_LENGTH = 8;

@Injectable({
    providedIn: 'root'
})
export class PasswordChangeFormService {
    buildForm(
        prefix: string,
        onSubmit: (value: AccountPasswordUpdate, handle: FormHandle<PasswordChangeFormValue>) => void
    ): FormConfig<PasswordChangeFormValue> {
        return new FormConfig<PasswordChangeFormValue>({
            buttons: [new FormButton({ label: `${prefix}.save`, type: FormButtonType.Submit })],
            footer: new FormFooter({ note: `${prefix}.note` }),
            initialValue: { [PASSWORD_CHANGE_SECTION]: { currentPassword: '', password: '', password2: '' } },
            onSubmit: (value, handle) => onSubmit(value[PASSWORD_CHANGE_SECTION], handle),
            prefix,
            sections: [
                new FormSection({
                    isTitleVisible: false,
                    key: PASSWORD_CHANGE_SECTION,
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
                                    hint: `${prefix}.${PASSWORD_CHANGE_SECTION}.${NEW_PASSWORD_FIELD}.hint`,
                                    isRequired: true,
                                    key: NEW_PASSWORD_FIELD,
                                    validators: [
                                        new FormFieldLengthValidator(
                                            PASSWORD_MIN_LENGTH,
                                            FormFieldValidatorType.MinLength
                                        )
                                    ]
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
}

function matchingPassword(messageKey: string): ValidatorFn {
    return control => {
        const password: unknown = control.parent?.get(NEW_PASSWORD_FIELD)?.value;

        return control.value && control.value !== password ? { mismatch: { messageKey } } : null;
    };
}
