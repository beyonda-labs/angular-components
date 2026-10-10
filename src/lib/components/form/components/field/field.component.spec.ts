import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
    accessibleDescription,
    accessibleName,
    controlByName,
    queryAll,
    renderComponent,
    settle,
    textsOf
} from '@testing/dom';
import { of } from 'rxjs';

import { PasswordPolicy } from '../../../../services/password-policy/models/password-policy.model';
import { FormFieldState } from '../../form.component';
import { FormAutocompleteField } from '../../models/fields/form-autocomplete-field.model';
import { FormCheckboxField } from '../../models/fields/form-checkbox-field.model';
import { FormCheckboxGroupField } from '../../models/fields/form-checkbox-group-field.model';
import { FormChipsField } from '../../models/fields/form-chips-field.model';
import { FormDateField } from '../../models/fields/form-date-field.model';
import { FormFileField } from '../../models/fields/form-file-field.model';
import { FormInfoField } from '../../models/fields/form-info-field.model';
import { FormListField } from '../../models/fields/form-list-field.model';
import { FormNumberField } from '../../models/fields/form-number-field.model';
import { FormPasswordField } from '../../models/fields/form-password-field.model';
import { FormRadioField } from '../../models/fields/form-radio-field.model';
import { FormSelectField } from '../../models/fields/form-select-field.model';
import { FormTextField } from '../../models/fields/form-text-field.model';
import { FormTextVariableField } from '../../models/fields/form-text-variable-field.model';
import { FormTextareaField } from '../../models/fields/form-textarea-field.model';
import { FormField, FormFieldOption } from '../../models/form-field.model';
import {
    FormFieldAsyncValidator,
    FormFieldCustomValidator,
    FormFieldLengthValidator,
    FormFieldPatternValidator,
    FormFieldValidatorType
} from '../../models/form-field-validator.model';
import { FormService } from '../../services/form.service';
import { FormFieldComponent } from './field.component';

const VALID: FormFieldState = { isDisabled: false, isHidden: false, isRequired: false, isValid: true, options: [] };

describe('FormFieldComponent', () => {
    let fixture: ComponentFixture<FormFieldComponent>;

    async function render(field: FormField, state: FormFieldState = VALID): Promise<void> {
        fixture = await renderComponent(FormFieldComponent, {
            control: new FormControl(''),
            field,
            prefix: 'demo.contact',
            state
        });
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('labels the input from the prefix and marks a required field until it is valid', async () => {
        await render(new FormTextField({ key: 'name', isRequired: true }), {
            ...VALID,
            isRequired: true,
            isValid: false
        });
        const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;

        expect(label.textContent?.trim()).toBe('demo.contact.name.label');
        expect(label.htmlFor).toBe('name');
        expect(fixture.nativeElement.textContent).toContain('*');
    });

    it('reads the texts of a camelCase key from its kebab-case segment and keeps the key as the control id', async () => {
        await render(new FormTextField({ key: 'valueString', isLabelTooltipVisible: true }));
        const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

        expect(label.textContent?.trim()).toBe('demo.contact.value-string.label');
        expect(label.htmlFor).toBe('valueString');
        expect(input.placeholder).toBe('demo.contact.value-string.placeholder');
    });

    it('shows the label the field is given instead of the one of its prefix', async () => {
        await render(new FormTextField({ key: 'clientName', label: 'client_name' }));
        const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;

        expect(label.textContent?.trim()).toBe('client_name');
        expect(label.htmlFor).toBe('clientName');
    });

    it('labels a checkbox with the label it is given', async () => {
        await render(new FormCheckboxField({ key: 'subscribed', label: 'is_subscribed' }));

        expect(fixture.nativeElement.querySelector('label')?.textContent?.trim()).toBe('is_subscribed');
    });

    it('keeps a placeholder given in the config as it is', async () => {
        await render(new FormTextField({ key: 'valueString', placeholder: 'app.shared.typeHere' }));
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

        expect(input.placeholder).toBe('app.shared.typeHere');
    });

    it('leaves the label to the checkbox itself', async () => {
        await render(new FormCheckboxField({ key: 'subscribed' }));

        expect(fixture.nativeElement.querySelectorAll('label')).toHaveLength(1);
        expect(fixture.nativeElement.querySelector('input[type="checkbox"]')).not.toBeNull();
    });

    it('names a checkbox group by its label, and holds a required one back until an option is checked', async () => {
        const field = new FormCheckboxGroupField({ isRequired: true, key: 'roles' });
        const control = TestBed.inject(FormService).initFieldControl(field) as FormControl<string[]>;
        fixture = await renderComponent(FormFieldComponent, {
            control,
            field,
            prefix: 'demo.contact',
            state: { ...VALID, isRequired: true, options: [{ label: 'Admin', value: 'admin' }] }
        });

        expect(controlByName(fixture, 'demo.contact.roles.label').getAttribute('role')).toBe('group');
        expect(control.valid).toBe(false);

        controlByName(fixture, 'Admin').click();
        await settle(fixture);

        expect(control.value).toEqual(['admin']);
        expect(control.valid).toBe(true);
    });

    describe('hint', () => {
        const HINT = 'demo.contact.secret.hint';
        const LABEL = 'demo.contact.secret.label';

        async function renderHinted(field: FormField, options: FormFieldOption[] = []): Promise<void> {
            fixture = await renderComponent(FormFieldComponent, {
                control: TestBed.inject(FormService).initFieldControl(field),
                field,
                prefix: 'demo.contact',
                state: { ...VALID, options }
            });
        }

        function text(): string {
            return fixture.nativeElement.textContent;
        }

        it.each<[string, FormField]>([
            ['text', new FormTextField({ hint: HINT, key: 'secret' })],
            ['textarea', new FormTextareaField({ hint: HINT, key: 'secret' })],
            ['password', new FormPasswordField({ hint: HINT, key: 'secret' })],
            ['number', new FormNumberField({ hint: HINT, key: 'secret' })],
            ['date', new FormDateField({ hint: HINT, key: 'secret' })],
            ['select', new FormSelectField({ hint: HINT, key: 'secret' })],
            ['autocomplete', new FormAutocompleteField({ hint: HINT, key: 'secret' })],
            ['text variable', new FormTextVariableField({ hint: HINT, key: 'secret' })],
            ['chips', new FormChipsField({ hint: HINT, key: 'secret' })],
            ['file', new FormFileField({ hint: HINT, key: 'secret' })],
            ['checkbox', new FormCheckboxField({ hint: HINT, key: 'secret' })],
            ['checkbox group', new FormCheckboxGroupField({ hint: HINT, key: 'secret' })]
        ])('shows the hint of a %s field under it and describes the control with it', async (_type, field) => {
            await renderHinted(field);

            expect(text()).toContain(HINT);
            expect(accessibleDescription(controlByName(fixture, LABEL))).toBe(HINT);
        });

        it('describes the group of a radio field with its hint', async () => {
            await renderHinted(new FormRadioField({ hint: HINT, key: 'secret' }), [{ label: 'Yes', value: 'yes' }]);
            const [group] = queryAll(fixture, '[role="radiogroup"]');

            expect(accessibleDescription(group)).toBe(HINT);
        });

        it('shows the hint of a read-only info or list field under it and describes what it shows with it', async () => {
            await renderHinted(
                new FormInfoField({ hint: HINT, items: [{ label: 'ada@example.test' }], key: 'secret' })
            );
            const [info] = queryAll(fixture, '[aria-describedby]');

            expect(text()).toContain(HINT);
            expect(info.textContent).toContain('ada@example.test');
            expect(accessibleDescription(info)).toBe(HINT);

            await renderHinted(new FormListField({ hint: HINT, items: ['Invoice'], key: 'secret' }));
            const [list] = queryAll(fixture, '[aria-describedby]');

            expect(accessibleName(list)).toBe(LABEL);
            expect(accessibleDescription(list)).toBe(HINT);
        });

        it('shows the error instead of the hint while it fails, and describes the control with what is shown', async () => {
            await renderHinted(
                new FormPasswordField({
                    hint: HINT,
                    key: 'secret',
                    validators: [
                        new FormFieldCustomValidator(current =>
                            current.value === 'secret'
                                ? { obvious: { messageKey: 'demo.contact.secret.obvious' } }
                                : null
                        )
                    ]
                })
            );
            const input = controlByName(fixture, LABEL);

            input.value = 'secret';
            input.dispatchEvent(new Event('input'));
            input.dispatchEvent(new Event('blur'));
            await settle(fixture);

            expect(text()).not.toContain(HINT);
            expect(accessibleDescription(input)).toBe('demo.contact.secret.obvious');

            input.value = 'long enough';
            input.dispatchEvent(new Event('input'));
            await settle(fixture);

            expect(text()).toContain(HINT);
            expect(accessibleDescription(input)).toBe(HINT);
        });

        it('keeps the hint while a validator without a message fails', async () => {
            await renderHinted(
                new FormPasswordField({
                    hint: HINT,
                    key: 'secret',
                    validators: [new FormFieldLengthValidator(8, FormFieldValidatorType.MinLength)]
                })
            );
            const input = controlByName(fixture, LABEL);

            input.value = 'short';
            input.dispatchEvent(new Event('input'));
            input.dispatchEvent(new Event('blur'));
            await settle(fixture);

            expect(input.getAttribute('aria-invalid')).toBe('true');
            expect(accessibleDescription(input)).toBe(HINT);
        });

        it('describes a field without a hint by nothing until it shows an error', async () => {
            await renderHinted(
                new FormTextField({
                    key: 'secret',
                    validators: [
                        new FormFieldCustomValidator(current =>
                            current.value ? null : { empty: { messageKey: 'demo.contact.secret.empty' } }
                        )
                    ]
                })
            );
            const input = controlByName(fixture, LABEL);

            expect(input.hasAttribute('aria-describedby')).toBe(false);

            input.dispatchEvent(new Event('blur'));
            await settle(fixture);

            expect(accessibleDescription(input)).toBe('demo.contact.secret.empty');
        });
    });

    describe('password policy', () => {
        const HINT = 'demo.contact.secret.hint';
        const LABEL = 'demo.contact.secret.label';
        const RULE = 'angular-components.form.password-field.policy';

        async function renderPolicy(policy: PasswordPolicy): Promise<void> {
            const field = new FormPasswordField({ hint: HINT, isRequired: true, key: 'secret', policy });

            fixture = await renderComponent(FormFieldComponent, {
                control: TestBed.inject(FormService).initFieldControl(field),
                field,
                prefix: 'demo.contact',
                state: { ...VALID, isRequired: true }
            });
        }

        async function type(value: string): Promise<void> {
            const input = controlByName(fixture, LABEL);

            input.value = value;
            input.dispatchEvent(new Event('input'));
            await settle(fixture);
        }

        async function leave(): Promise<void> {
            controlByName(fixture, LABEL).dispatchEvent(new Event('blur'));
            await settle(fixture);
        }

        it('lists the rules of the policy instead of the hint and describes the control with them', async () => {
            await renderPolicy(new PasswordPolicy({ isDigitRequired: true }));
            const description = accessibleDescription(controlByName(fixture, LABEL));

            expect(fixture.nativeElement.textContent).not.toContain(HINT);
            expect(description).toContain(`${RULE}.length`);
            expect(description).toContain(`${RULE}.digit`);
        });

        it('flags a password that breaks its policy only once touched, and keeps the rules instead of an error', async () => {
            await renderPolicy(new PasswordPolicy({ isDigitRequired: true }));
            const input = controlByName(fixture, LABEL);

            await type('short');
            expect(input.hasAttribute('aria-invalid')).toBe(false);

            await leave();
            expect(input.getAttribute('aria-invalid')).toBe('true');
            expect(queryAll(fixture, '[role="alert"]')).toEqual([]);
            expect(accessibleDescription(input)).toContain(`${RULE}.digit`);

            await type('long enough 1');
            expect(input.hasAttribute('aria-invalid')).toBe(false);
        });

        it('says when a password is longer than the policy allows, next to the rules', async () => {
            await renderPolicy(new PasswordPolicy({ maxLength: 10 }));

            await type('much too long');
            await leave();
            const description = accessibleDescription(controlByName(fixture, LABEL));

            expect(textsOf(queryAll(fixture, '[role="alert"]'))).toEqual([`${RULE}.too-long`]);
            expect(description).toContain(`${RULE}.too-long`);
            expect(description).toContain(`${RULE}.length`);
        });
    });

    describe('validators of each field type', () => {
        async function renderValidated(field: FormField, options: FormFieldOption[] = []): Promise<void> {
            fixture = await renderComponent(FormFieldComponent, {
                control: TestBed.inject(FormService).initFieldControl(field),
                field,
                prefix: 'demo.contact',
                state: { ...VALID, options }
            });
        }

        function control(): HTMLInputElement {
            return fixture.nativeElement.querySelector('#secret');
        }

        function alert(): HTMLElement | null {
            return fixture.nativeElement.querySelector('[role="alert"]');
        }

        function isFlaggedInvalid(): boolean {
            return fixture.nativeElement.querySelector('[aria-invalid="true"]') !== null;
        }

        async function addChip(value: string): Promise<void> {
            await type(value);
            control().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            await settle(fixture);
        }

        async function choose(file: File): Promise<void> {
            Object.defineProperty(control(), 'files', { configurable: true, value: [file] });
            control().dispatchEvent(new Event('change'));
            await settle(fixture);
        }

        async function pick(label: string): Promise<void> {
            control().dispatchEvent(new Event('focus'));
            await settle(fixture);
            queryAll(document.body, '[role="option"]')
                .find(option => option.textContent?.trim() === label)
                ?.dispatchEvent(new MouseEvent('mousedown'));
            await settle(fixture);
        }

        async function type(value: string): Promise<void> {
            control().value = value;
            control().dispatchEvent(new Event('input'));
            await settle(fixture);
        }

        it('flags a password that fails its length validator', async () => {
            await renderValidated(
                new FormPasswordField({
                    key: 'secret',
                    validators: [new FormFieldLengthValidator(8, FormFieldValidatorType.MinLength)]
                })
            );

            await type('short');
            control().dispatchEvent(new Event('blur'));
            await settle(fixture);
            expect(isFlaggedInvalid()).toBe(true);

            await type('long enough');
            expect(isFlaggedInvalid()).toBe(false);
        });

        it('flags an autocomplete whose picked value fails its pattern', async () => {
            await renderValidated(
                new FormAutocompleteField({
                    key: 'secret',
                    validators: [new FormFieldPatternValidator(/^[a-z]{3}$/u)]
                }),
                [
                    { label: 'Madrid', value: 'mad' },
                    { label: 'Paris', value: 'paris' }
                ]
            );

            await pick('Paris');
            expect(isFlaggedInvalid()).toBe(true);

            await pick('Madrid');
            expect(isFlaggedInvalid()).toBe(false);
        });

        it('flags a chips list that fails its custom validator', async () => {
            await renderValidated(
                new FormChipsField({
                    key: 'secret',
                    validators: [
                        new FormFieldCustomValidator(current =>
                            ((current.value as string[] | null) ?? []).some(tag => tag !== tag.toLowerCase())
                                ? { lowercase: true }
                                : null
                        )
                    ]
                })
            );

            await addChip('angular');
            expect(isFlaggedInvalid()).toBe(false);

            await addChip('Jest');
            expect(isFlaggedInvalid()).toBe(true);
        });

        it('flags a file that fails its custom validator and still enforces its size limit', async () => {
            await renderValidated(
                new FormFileField({
                    key: 'secret',
                    maxSizeBytes: 1024,
                    validators: [
                        new FormFieldCustomValidator(current =>
                            (current.value as File | null)?.name.startsWith('draft') ? { draft: true } : null
                        )
                    ]
                })
            );

            await choose(new File(['pdf'], 'draft.pdf'));
            expect(isFlaggedInvalid()).toBe(true);

            await choose(new File(['x'.repeat(2048)], 'report.pdf'));
            expect(fixture.nativeElement.textContent).toContain('angular-components.form.file-field.too-large');

            await choose(new File(['pdf'], 'report.pdf'));
            expect(isFlaggedInvalid()).toBe(false);
        });

        it('shows the message of a failing validator once the field is touched', async () => {
            await renderValidated(
                new FormPasswordField({
                    key: 'secret',
                    validators: [
                        new FormFieldCustomValidator(current =>
                            current.value === 'secret'
                                ? { obvious: { messageKey: 'demo.contact.secret.obvious' } }
                                : null
                        )
                    ]
                })
            );

            await type('secret');
            expect(alert()).toBeNull();

            control().dispatchEvent(new Event('blur'));
            await settle(fixture);
            expect(alert()?.textContent?.trim()).toBe('demo.contact.secret.obvious');

            await type('long enough');
            expect(alert()).toBeNull();
        });

        it('shows the message of a failing async validator on a file instead of its size hint', async () => {
            await renderValidated(
                new FormFileField({
                    key: 'secret',
                    asyncValidators: [
                        new FormFieldAsyncValidator(() => of({ duplicate: { messageKey: 'demo.files.duplicate' } }))
                    ],
                    maxSizeBytes: 1024
                })
            );

            await choose(new File(['pdf'], 'report.pdf'));

            expect(alert()?.textContent?.trim()).toBe('demo.files.duplicate');
            expect(fixture.nativeElement.textContent).not.toContain('angular-components.form.file-field.max-size');
        });
    });
});
