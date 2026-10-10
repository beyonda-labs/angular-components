import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { accessibleDescription, queryAll, renderComponent, settle, textsOf } from '@testing/dom';

import { PasswordPolicy } from '../../../../../services/password-policy/models/password-policy.model';
import { FormPasswordField } from '../../../models/fields/form-password-field.model';
import { FormPasswordFieldComponent } from './field-password.component';

const RULE = 'angular-components.form.password-field.policy';
const STRICT = new PasswordPolicy({
    isDigitRequired: true,
    isLowercaseRequired: true,
    isSymbolRequired: true,
    isUppercaseRequired: true
});

describe('FormPasswordFieldComponent', () => {
    let fixture: ComponentFixture<FormPasswordFieldComponent>;

    async function render(field: FormPasswordField = new FormPasswordField({ key: 'password' })): Promise<void> {
        fixture = await renderComponent(FormPasswordFieldComponent, {
            control: new FormControl(''),
            field,
            prefix: 'demo.login.password'
        });
    }

    function input(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }

    function rules(): string[] {
        return textsOf(queryAll(fixture, 'li'));
    }

    async function type(value: string): Promise<void> {
        input().value = value;
        input().dispatchEvent(new Event('input'));
        await settle(fixture);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormPasswordFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('hides the password until the toggle reveals it', async () => {
        await render();
        expect(input().type).toBe('password');

        (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
        fixture.detectChanges();

        expect(input().type).toBe('text');
    });

    it('offers no toggle when the field opts out', async () => {
        await render(new FormPasswordField({ key: 'password', showToggle: false }));

        expect(fixture.nativeElement.querySelector('button')).toBeNull();
    });

    it('gives the browser the autofill hint of the field', async () => {
        await render(new FormPasswordField({ autocomplete: 'new-password', key: 'password' }));

        expect(input().getAttribute('autocomplete')).toBe('new-password');
    });

    describe('policy', () => {
        it('lists no rule without a policy', async () => {
            await render();

            expect(rules()).toEqual([]);
            expect(input().hasAttribute('aria-describedby')).toBe(false);
        });

        it('lists the length rule alone under the library defaults', async () => {
            await render(new FormPasswordField({ key: 'password', policy: new PasswordPolicy() }));

            expect(rules()).toEqual([`${RULE}.length ${RULE}.unmet`]);
        });

        it('lists the length and every rule the policy turns on, each one not met yet', async () => {
            await render(new FormPasswordField({ key: 'password', policy: STRICT }));

            expect(rules()).toEqual([
                `${RULE}.length ${RULE}.unmet`,
                `${RULE}.uppercase ${RULE}.unmet`,
                `${RULE}.lowercase ${RULE}.unmet`,
                `${RULE}.digit ${RULE}.unmet`,
                `${RULE}.symbol ${RULE}.unmet`
            ]);
        });

        it('marks each rule met as the user types', async () => {
            await render(new FormPasswordField({ key: 'password', policy: STRICT }));

            await type('a1');
            expect(rules()).toEqual([
                `${RULE}.length ${RULE}.unmet`,
                `${RULE}.uppercase ${RULE}.unmet`,
                `${RULE}.lowercase ${RULE}.met`,
                `${RULE}.digit ${RULE}.met`,
                `${RULE}.symbol ${RULE}.unmet`
            ]);

            await type('Abcdef1!');
            expect(rules()).toEqual([
                `${RULE}.length ${RULE}.met`,
                `${RULE}.uppercase ${RULE}.met`,
                `${RULE}.lowercase ${RULE}.met`,
                `${RULE}.digit ${RULE}.met`,
                `${RULE}.symbol ${RULE}.met`
            ]);
        });

        it('states the minimum length of the policy in the length rule', async () => {
            const translate = TestBed.inject(TranslateService);
            translate.setTranslation('en', {
                'angular-components': {
                    form: { 'password-field': { policy: { length: 'At least {{min}} characters', unmet: 'not met' } } }
                }
            });
            translate.use('en');
            await render(new FormPasswordField({ key: 'password', policy: new PasswordPolicy({ minLength: 12 }) }));

            expect(rules()).toEqual(['At least 12 characters not met']);
        });

        it('describes the control with the rules, read politely as they change', async () => {
            await render(new FormPasswordField({ key: 'password', policy: STRICT }));
            const description = accessibleDescription(input());
            const [list] = queryAll(fixture, '[aria-live="polite"]');

            expect(description).toContain(`${RULE}.length`);
            expect(description).toContain(`${RULE}.symbol`);
            expect(list.textContent).toContain(`${RULE}.uppercase`);
        });

        it('follows a policy given as a signal', async () => {
            const policy = signal(new PasswordPolicy());
            await render(new FormPasswordField({ key: 'password', policy }));

            policy.set(new PasswordPolicy({ isDigitRequired: true }));
            await settle(fixture);

            expect(rules()).toEqual([`${RULE}.length ${RULE}.unmet`, `${RULE}.digit ${RULE}.unmet`]);
        });
    });
});
