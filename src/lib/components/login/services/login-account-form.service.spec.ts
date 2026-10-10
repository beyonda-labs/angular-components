import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { PasswordPolicyService } from '../../../services/password-policy/password-policy.service';
import { FormPasswordField, FormPasswordPolicy } from '../../form/models/fields/form-password-field.model';
import { FormConfig, FormHandle } from '../../form/models/form.model';
import { FormService } from '../../form/services/form.service';
import { LoginAccountFormService } from './login-account-form.service';

const PREFIX = 'demo.login';

describe('LoginAccountFormService', () => {
    let service: LoginAccountFormService;

    function autofillHints<T>(config: FormConfig<T>): Record<string, string | undefined> {
        return Object.fromEntries(
            config.sections.flatMap(section =>
                section.rows.flatMap(row => row.fields.map(field => [field.key, field.autocomplete]))
            )
        );
    }

    function policies<T>(config: FormConfig<T>): Record<string, FormPasswordPolicy | undefined> {
        return Object.fromEntries(
            config.sections.flatMap(section =>
                section.rows.flatMap(row =>
                    row.fields
                        .filter(field => field instanceof FormPasswordField)
                        .map(field => [field.key, field.policy])
                )
            )
        );
    }

    function buildGroup<T>(config: FormConfig<T>): FormGroup {
        return TestBed.inject(FormService).buildFormGroup(config as FormConfig);
    }

    function submit<T>(config: FormConfig<T>, group: FormGroup): void {
        config.onSubmit?.(group.getRawValue() as T, {} as FormHandle<T>);
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });
        service = TestBed.inject(LoginAccountFormService);
    });

    it('asks for the email of a forgotten password and sends it', () => {
        const onSend = jest.fn();
        const config = service.buildForgotPassword(PREFIX, onSend);
        const group = buildGroup(config);

        group.patchValue({ 'forgot-password': { email: 'ada@example.com' } });
        submit(config, group);

        expect(autofillHints(config)).toEqual({ email: 'email' });
        expect(config.buttons[0].label).toBe('demo.login.forgot-password.button.send');
        expect(onSend).toHaveBeenCalledWith('ada@example.com');
    });

    it('asks for a new password twice and refuses a confirmation that differs', () => {
        const onSave = jest.fn();
        const config = service.buildResetPassword(PREFIX, onSave);
        const group = buildGroup(config);
        const confirmation = group.get(['reset-password', 'password2']);

        group.patchValue({ 'reset-password': { password: 'secret', password2: 'other' } });
        confirmation?.updateValueAndValidity();

        expect(autofillHints(config)).toEqual({ password: 'new-password', password2: 'new-password' });
        expect(confirmation?.errors).toEqual({
            passwordsNotMatch: { messageKey: 'demo.login.validation.passwords-not-match' }
        });

        group.patchValue({ 'reset-password': { password2: 'secret' } });
        submit(config, group);

        expect(onSave).toHaveBeenCalledWith({ password: 'secret', password2: 'secret' });
    });

    it('checks the new password of a reset and of an invitation against the policy, never its confirmation', () => {
        const { policy } = TestBed.inject(PasswordPolicyService);
        const invitation = service.buildAcceptInvitation(PREFIX, { email: 'ada@example.com' }, jest.fn());

        expect(policies(service.buildResetPassword(PREFIX, jest.fn()))).toEqual({
            password: policy,
            password2: undefined
        });
        expect(policies(invitation)).toEqual({ password: policy, password2: undefined });
    });

    it('prefills the invited name and sends only the names that are not blank', () => {
        const onAccept = jest.fn();
        const config = service.buildAcceptInvitation(
            PREFIX,
            { email: 'ada@example.com', name: 'Ada', surname: 'Lovelace' },
            onAccept
        );
        const group = buildGroup(config);

        expect(group.get('accept-invitation')?.value).toEqual({
            name: 'Ada',
            password: '',
            password2: '',
            surname: 'Lovelace'
        });
        expect(autofillHints(config)).toEqual({
            name: 'given-name',
            password: 'new-password',
            password2: 'new-password',
            surname: 'family-name'
        });

        group.patchValue({
            'accept-invitation': { name: ' Augusta ', password: 'secret', password2: 'secret', surname: ' ' }
        });
        submit(config, group);

        expect(onAccept).toHaveBeenCalledWith({ name: 'Augusta', password: 'secret', password2: 'secret' });
    });
});
