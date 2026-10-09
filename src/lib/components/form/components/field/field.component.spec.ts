import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { controlByName, queryAll, renderComponent, settle } from '@testing/dom';
import { of } from 'rxjs';

import { FormFieldState } from '../../form.component';
import { FormAutocompleteField } from '../../models/fields/form-autocomplete-field.model';
import { FormCheckboxField } from '../../models/fields/form-checkbox-field.model';
import { FormCheckboxGroupField } from '../../models/fields/form-checkbox-group-field.model';
import { FormChipsField } from '../../models/fields/form-chips-field.model';
import { FormFileField } from '../../models/fields/form-file-field.model';
import { FormPasswordField } from '../../models/fields/form-password-field.model';
import { FormTextField } from '../../models/fields/form-text-field.model';
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
