import { Injectable } from '@angular/core';

import { FormPasswordField } from '../../form/models/fields/form-password-field.model';
import { FormTextField } from '../../form/models/fields/form-text-field.model';
import { FormButton, FormButtonType, FormConfig, FormRow, FormSection } from '../../form/models/form.model';
import { FormFieldCustomValidator, FormFieldEmailValidator } from '../../form/models/form-field-validator.model';
import { passwordsMatchValidator } from '../functions/password-match';
import {
    AcceptInvitationFormValue,
    AcceptInvitationRequest,
    ForgotPasswordFormValue,
    Invitation,
    NewPassword,
    NewPasswordFormValue,
    ResetPasswordFormValue
} from '../models/login.model';

const ACCEPT_INVITATION = 'accept-invitation';
const FORGOT_PASSWORD = 'forgot-password';
const RESET_PASSWORD = 'reset-password';

@Injectable({ providedIn: 'root' })
export class LoginAccountFormService {
    buildAcceptInvitation(
        prefix: string,
        invitation: Invitation,
        onAccept: (details: Omit<AcceptInvitationRequest, 'token'>) => void
    ): FormConfig<AcceptInvitationFormValue> {
        return new FormConfig<AcceptInvitationFormValue>({
            buttonLayout: 'stretch',
            buttons: [submitButton(`${prefix}.${ACCEPT_INVITATION}.button.accept`)],
            initialValue: {
                [ACCEPT_INVITATION]: {
                    name: invitation.name ?? '',
                    password: '',
                    password2: '',
                    surname: invitation.surname ?? ''
                }
            },
            onSubmit: value => {
                const { name, surname, ...password } = value[ACCEPT_INVITATION];

                onAccept({ ...toNewPassword(password), name: optionalText(name), surname: optionalText(surname) });
            },
            prefix,
            sections: [
                buildSection(ACCEPT_INVITATION, [
                    new FormRow({ fields: [new FormTextField({ autocomplete: 'given-name', key: 'name' })] }),
                    new FormRow({ fields: [new FormTextField({ autocomplete: 'family-name', key: 'surname' })] }),
                    ...buildNewPasswordRows(prefix)
                ])
            ]
        });
    }

    buildForgotPassword(prefix: string, onSend: (email: string) => void): FormConfig<ForgotPasswordFormValue> {
        return new FormConfig<ForgotPasswordFormValue>({
            buttonLayout: 'stretch',
            buttons: [submitButton(`${prefix}.${FORGOT_PASSWORD}.button.send`)],
            onSubmit: value => onSend(value[FORGOT_PASSWORD].email ?? ''),
            prefix,
            sections: [
                buildSection(FORGOT_PASSWORD, [
                    new FormRow({
                        fields: [
                            new FormTextField({
                                autocomplete: 'email',
                                isRequired: true,
                                key: 'email',
                                validators: [new FormFieldEmailValidator()]
                            })
                        ]
                    })
                ])
            ]
        });
    }

    buildResetPassword(prefix: string, onSave: (password: NewPassword) => void): FormConfig<ResetPasswordFormValue> {
        return new FormConfig<ResetPasswordFormValue>({
            buttonLayout: 'stretch',
            buttons: [submitButton(`${prefix}.${RESET_PASSWORD}.button.save`)],
            onSubmit: value => onSave(toNewPassword(value[RESET_PASSWORD])),
            prefix,
            sections: [buildSection(RESET_PASSWORD, buildNewPasswordRows(prefix))]
        });
    }
}

function buildNewPasswordRows(prefix: string): FormRow[] {
    return [
        new FormRow({
            fields: [new FormPasswordField({ autocomplete: 'new-password', isRequired: true, key: 'password' })]
        }),
        new FormRow({
            fields: [
                new FormPasswordField({
                    autocomplete: 'new-password',
                    isRequired: true,
                    key: 'password2',
                    validators: [
                        new FormFieldCustomValidator(
                            passwordsMatchValidator(`${prefix}.validation.passwords-not-match`)
                        )
                    ]
                })
            ]
        })
    ];
}

function buildSection(key: string, rows: FormRow[]): FormSection {
    return new FormSection({ isTitleVisible: false, key, rows });
}

function optionalText(value: string | null): string | undefined {
    return value?.trim() || undefined;
}

function submitButton(label: string): FormButton {
    return new FormButton({ label, type: FormButtonType.Submit });
}

function toNewPassword({ password, password2 }: NewPasswordFormValue): NewPassword {
    return { password: password ?? '', password2: password2 ?? '' };
}
