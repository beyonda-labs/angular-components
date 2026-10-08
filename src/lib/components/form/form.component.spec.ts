import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { buttonByName, renderComponent, settle } from '@testing/dom';

import { FormComponent } from './form.component';
import { FormAutocompleteField } from './models/fields/form-autocomplete-field.model';
import { FormRadioField } from './models/fields/form-radio-field.model';
import { FormSelectField } from './models/fields/form-select-field.model';
import { FormTextField } from './models/fields/form-text-field.model';
import {
    FormButton,
    FormButtonType,
    FormConfig,
    FormConfigParameters,
    FormHandle,
    FormRow,
    FormSection,
    FormStep
} from './models/form.model';
import { FormField, FormFieldOption, FormRule } from './models/form-field.model';
import { FormFieldCustomValidator } from './models/form-field-validator.model';
import { FORM_HOST, FormHost } from './models/form-host.model';

interface DemoValue {
    contact: { email: string | null; name: string | null };
}

describe('FormComponent', () => {
    let fixture: ComponentFixture<FormComponent<DemoValue>>;
    let host: FormHost;

    function buildConfig(overrides: Partial<FormConfigParameters<DemoValue>> = {}): FormConfig<DemoValue> {
        return new FormConfig<DemoValue>({
            buttons: [
                new FormButton({ label: 'demo.cancel', type: FormButtonType.Cancel }),
                new FormButton({ label: 'demo.submit', type: FormButtonType.Submit })
            ],
            prefix: 'demo',
            sections: [
                new FormSection({
                    key: 'contact',
                    rows: [
                        new FormRow({
                            fields: [
                                new FormTextField({ key: 'name', isRequired: true }),
                                new FormTextField({ key: 'email' })
                            ]
                        })
                    ]
                })
            ],
            ...overrides
        });
    }

    function buildContactConfig(
        fields: FormField[],
        overrides: Partial<FormConfigParameters<DemoValue>> = {}
    ): FormConfig<DemoValue> {
        return buildConfig({
            sections: [new FormSection({ key: 'contact', rows: [new FormRow({ fields })] })],
            ...overrides
        });
    }

    async function render(config: FormConfig<DemoValue> = buildConfig()): Promise<void> {
        fixture = await renderComponent(FormComponent<DemoValue>, { config });
    }

    function input(id: string): HTMLInputElement | null {
        return fixture.nativeElement.querySelector(`#${id}`);
    }

    async function type(id: string, value: string): Promise<void> {
        const field = input(id);

        if (!field) {
            throw new Error(`No field ${id}`);
        }

        field.value = value;
        field.dispatchEvent(new Event('input'));
        await settle(fixture);
    }

    function button(label: string): HTMLButtonElement {
        return buttonByName(fixture, label);
    }

    function text(): string {
        return fixture.nativeElement.textContent;
    }

    beforeEach(async () => {
        host = { close: jest.fn(), requestClose: jest.fn() };

        await TestBed.configureTestingModule({
            imports: [FormComponent, TranslateModule.forRoot()],
            providers: [{ provide: FORM_HOST, useValue: host }]
        }).compileComponents();
    });

    it('renders the sections and fields with their texts resolved from the prefix', async () => {
        await render();

        expect(text()).toContain('demo.contact.label');
        expect(text()).toContain('demo.contact.name.label');
        expect(input('name')?.placeholder).toBe('demo.contact.name.placeholder');
        expect(input('email')).not.toBeNull();
    });

    it('starts from the initial value and reports it as ready', async () => {
        const onReady = jest.fn();
        await render(buildConfig({ initialValue: { contact: { email: 'ada@example.com', name: 'Ada' } }, onReady }));

        expect(input('name')?.value).toBe('Ada');
        expect(onReady).toHaveBeenCalledTimes(1);
        expect((onReady.mock.calls[0][0] as FormHandle<DemoValue>).value()).toEqual({
            contact: { email: 'ada@example.com', name: 'Ada' }
        });
    });

    it('keeps submit disabled until the form is both changed and valid', async () => {
        await render();
        expect(button('demo.submit').disabled).toBe(true);

        await type('email', 'ada@example.com');
        expect(button('demo.submit').disabled).toBe(true);

        await type('name', 'Ada');
        expect(button('demo.submit').disabled).toBe(false);
    });

    it('lets a valid form be submitted without changes when the config allows it', async () => {
        await render(
            buildConfig({ allowSubmitWithoutChanges: true, initialValue: { contact: { email: '', name: 'Ada' } } })
        );

        expect(button('demo.submit').disabled).toBe(false);
    });

    it('submits the whole value with the handle', async () => {
        const onSubmit = jest.fn();
        await render(buildConfig({ onSubmit }));

        await type('name', 'Ada');
        button('demo.submit').click();

        expect(onSubmit).toHaveBeenCalledWith({ contact: { email: '', name: 'Ada' } }, expect.anything());
    });

    it('reports every change with the current value', async () => {
        const onValueChange = jest.fn();
        await render(buildConfig({ onValueChange }));

        await type('name', 'Ada');

        expect(onValueChange).toHaveBeenLastCalledWith({ contact: { email: '', name: 'Ada' } }, expect.anything());
    });

    it('cancels back to the initial value and reports it', async () => {
        const onCancel = jest.fn();
        await render(buildConfig({ initialValue: { contact: { email: '', name: 'Ada' } }, onCancel }));
        expect(button('demo.cancel').disabled).toBe(true);

        await type('name', 'Grace');
        button('demo.cancel').click();
        await settle(fixture);

        expect(input('name')?.value).toBe('Ada');
        expect(onCancel).toHaveBeenCalled();
    });

    it('runs the action of a custom button with the handle', async () => {
        const action = jest.fn();
        await render(
            buildConfig({ buttons: [new FormButton({ action, label: 'demo.other', type: FormButtonType.Secondary })] })
        );

        button('demo.other').click();

        expect(action).toHaveBeenCalledWith(expect.objectContaining({ patchValue: expect.any(Function) }));
    });

    it('lets the handle patch the value and close its host', async () => {
        const onReady = jest.fn();
        await render(buildConfig({ onReady }));
        const handle = onReady.mock.calls[0][0] as FormHandle<DemoValue>;

        handle.patchValue({ contact: { email: 'ada@example.com', name: 'Ada' } });
        await settle(fixture);
        handle.close();
        handle.requestClose();

        expect(input('name')?.value).toBe('Ada');
        expect(host.close).toHaveBeenCalled();
        expect(host.requestClose).toHaveBeenCalled();
    });

    describe('rules', () => {
        it('hides a field, and frees the form from its validation, while its rule says so', async () => {
            await render(
                buildConfig({
                    sections: [
                        new FormSection({
                            key: 'contact',
                            rows: [
                                new FormRow({
                                    fields: [
                                        new FormTextField({ key: 'name' }),
                                        new FormTextField({
                                            key: 'email',
                                            isHidden: value => value['contact']['name'] !== 'Ada',
                                            isRequired: true
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            );
            expect(input('email')).toBeNull();

            await type('name', 'Grace');
            expect(input('email')).toBeNull();
            expect(button('demo.submit').disabled).toBe(false);

            await type('name', 'Ada');
            expect(input('email')).not.toBeNull();
            expect(button('demo.submit').disabled).toBe(true);
        });

        it('disables a field while its rule says so', async () => {
            await render(
                buildConfig({
                    sections: [
                        new FormSection({
                            key: 'contact',
                            rows: [
                                new FormRow({
                                    fields: [
                                        new FormTextField({ key: 'name' }),
                                        new FormTextField({
                                            key: 'email',
                                            isDisabled: value => !value['contact']['name']
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            );
            expect(input('email')?.disabled).toBe(true);

            await type('name', 'Ada');
            expect(input('email')?.disabled).toBe(false);
        });

        it('resolves the options of a field from the value', async () => {
            await render(
                buildConfig({
                    sections: [
                        new FormSection({
                            key: 'contact',
                            rows: [
                                new FormRow({
                                    fields: [
                                        new FormTextField({ key: 'name' }),
                                        new FormSelectField({
                                            key: 'email',
                                            options: value => [
                                                { label: `${value['contact']['name']}@example.com`, value: 'work' }
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            );

            await type('name', 'ada');

            expect(text()).toContain('ada@example.com');
        });

        it('hides a whole section while its rule says so', async () => {
            await render(
                buildConfig({
                    sections: [
                        new FormSection({
                            key: 'contact',
                            rows: [new FormRow({ fields: [new FormTextField({ key: 'name' })] })]
                        }),
                        new FormSection({
                            isHidden: value => !value['contact']['name'],
                            key: 'extra',
                            rows: [new FormRow({ fields: [new FormTextField({ key: 'email' })] })]
                        })
                    ]
                })
            );
            expect(text()).not.toContain('demo.extra.label');

            await type('name', 'Ada');
            expect(text()).toContain('demo.extra.label');
        });
    });

    describe('required rules', () => {
        it('requires a field, and marks it as required, only while its rule says so', async () => {
            await render(
                buildContactConfig([
                    new FormTextField({ key: 'name' }),
                    new FormTextField({ key: 'email', isRequired: value => value['contact']['name'] === 'Ada' })
                ])
            );

            await type('name', 'Grace');
            expect(input('email')?.getAttribute('aria-required')).toBeNull();
            expect(text()).not.toContain('*');
            expect(button('demo.submit').disabled).toBe(false);

            await type('name', 'Ada');
            expect(input('email')?.getAttribute('aria-required')).toBe('true');
            expect(text()).toContain('*');
            expect(button('demo.submit').disabled).toBe(true);

            await type('email', 'ada@example.com');
            expect(button('demo.submit').disabled).toBe(false);
        });

        it('follows a required rule given as a signal', async () => {
            const isRequired = signal(false);
            await render(
                buildContactConfig([
                    new FormTextField({ key: 'name', isRequired }),
                    new FormTextField({ key: 'email' })
                ])
            );

            await type('email', 'ada@example.com');
            expect(button('demo.submit').disabled).toBe(false);

            isRequired.set(true);
            await settle(fixture);

            expect(input('name')?.getAttribute('aria-required')).toBe('true');
            expect(button('demo.submit').disabled).toBe(true);
        });
    });

    describe('data that arrives after the config', () => {
        it('shows the options a signal delivers once they arrive', async () => {
            const catalog = signal<FormFieldOption[]>([]);
            await render(
                buildContactConfig([
                    new FormTextField({ key: 'name' }),
                    new FormSelectField({
                        key: 'email',
                        options: value => catalog().filter(option => option.value !== value['contact']['name'])
                    })
                ])
            );
            expect(text()).not.toContain('Work address');

            catalog.set([{ label: 'Work address', value: 'work' }]);
            await settle(fixture);

            expect(text()).toContain('Work address');
        });

        it('validates a field again when a signal its custom validator reads changes', async () => {
            const takenNames = signal(new Set<string>());
            await render(
                buildContactConfig([
                    new FormTextField({
                        key: 'name',
                        validators: [
                            new FormFieldCustomValidator(control =>
                                takenNames().has(control.value as string) ? { taken: true } : null
                            )
                        ]
                    }),
                    new FormTextField({ key: 'email' })
                ])
            );

            await type('name', 'Ada');
            expect(button('demo.submit').disabled).toBe(false);

            takenNames.set(new Set(['Ada']));
            await settle(fixture);
            expect(button('demo.submit').disabled).toBe(true);

            takenNames.set(new Set());
            await settle(fixture);
            expect(button('demo.submit').disabled).toBe(false);
        });

        it('keeps what was typed when a signal a validator reads changes', async () => {
            const takenNames = signal(new Set<string>());
            await render(
                buildContactConfig([
                    new FormTextField({
                        key: 'name',
                        validators: [
                            new FormFieldCustomValidator(control =>
                                takenNames().has(control.value as string) ? { taken: true } : null
                            )
                        ]
                    })
                ])
            );

            await type('name', 'Ada');
            takenNames.set(new Set(['Grace']));
            await settle(fixture);

            expect(input('name')?.value).toBe('Ada');
            expect(button('demo.cancel').disabled).toBe(false);
        });

        it('validates a field again when another field its custom validator reads changes', async () => {
            await render(
                buildContactConfig([
                    new FormTextField({ key: 'name' }),
                    new FormTextField({
                        key: 'email',
                        validators: [
                            new FormFieldCustomValidator(control =>
                                control.value && control.value === control.parent?.get('name')?.value
                                    ? { sameAsName: true }
                                    : null
                            )
                        ]
                    })
                ])
            );

            await type('name', 'ada');
            await type('email', 'grace');
            expect(button('demo.submit').disabled).toBe(false);

            await type('name', 'grace');
            expect(button('demo.submit').disabled).toBe(true);
        });
    });

    describe('options that change', () => {
        const WORK: FormFieldOption = { label: 'Work', value: 'work' };
        const HOME: FormFieldOption = { label: 'Home', value: 'home' };
        const optionsByName: FormRule<FormFieldOption[]> = value =>
            value['contact']['name'] === 'Ada' ? [WORK, HOME] : [WORK];

        it.each([
            { kind: 'a select', field: new FormSelectField({ key: 'email', options: optionsByName }) },
            { kind: 'a radio', field: new FormRadioField({ key: 'email', options: optionsByName }) },
            { kind: 'an autocomplete', field: new FormAutocompleteField({ key: 'email', options: optionsByName }) }
        ])('drops the value of $kind field once its options no longer list it', async ({ field }) => {
            const onReady = jest.fn();
            const onValueChange = jest.fn();
            await render(
                buildContactConfig([new FormTextField({ key: 'name' }), field], {
                    initialValue: { contact: { email: 'home', name: 'Ada' } },
                    onReady,
                    onValueChange
                })
            );

            await type('name', 'Grace');

            expect((onReady.mock.calls[0][0] as FormHandle<DemoValue>).value()).toEqual({
                contact: { email: '', name: 'Grace' }
            });
            expect(onValueChange).toHaveBeenLastCalledWith(
                { contact: { email: '', name: 'Grace' } },
                expect.anything()
            );
        });

        it('keeps the value of an autocomplete that allows free text, listed or not', async () => {
            const onReady = jest.fn();
            await render(
                buildContactConfig(
                    [
                        new FormTextField({ key: 'name' }),
                        new FormAutocompleteField({ key: 'email', isFreeTextAllowed: true, options: optionsByName })
                    ],
                    { initialValue: { contact: { email: 'home', name: 'Ada' } }, onReady }
                )
            );

            await type('name', 'Grace');

            expect((onReady.mock.calls[0][0] as FormHandle<DemoValue>).value().contact.email).toBe('home');
        });

        it('keeps a value its new options still list', async () => {
            const onReady = jest.fn();
            await render(
                buildContactConfig(
                    [new FormTextField({ key: 'name' }), new FormSelectField({ key: 'email', options: optionsByName })],
                    { initialValue: { contact: { email: 'work', name: 'Ada' } }, onReady }
                )
            );

            await type('name', 'Grace');

            expect((onReady.mock.calls[0][0] as FormHandle<DemoValue>).value().contact.email).toBe('work');
        });

        it('keeps the initial value while the options that list it are still loading', async () => {
            const catalog = signal<FormFieldOption[]>([]);
            const onReady = jest.fn();
            await render(
                buildContactConfig(
                    [new FormTextField({ key: 'name' }), new FormSelectField({ key: 'email', options: catalog })],
                    { initialValue: { contact: { email: 'home', name: 'Ada' } }, onReady }
                )
            );
            const handle = onReady.mock.calls[0][0] as FormHandle<DemoValue>;
            expect(handle.value().contact.email).toBe('home');

            catalog.set([WORK, HOME]);
            await settle(fixture);
            expect(handle.value().contact.email).toBe('home');

            catalog.set([WORK]);
            await settle(fixture);
            expect(handle.value().contact.email).toBe('');
        });
    });

    describe('steps', () => {
        function buildSteppedConfig(overrides: Partial<FormConfigParameters<DemoValue>> = {}): FormConfig<DemoValue> {
            return buildConfig({
                sections: [
                    new FormSection({
                        key: 'contact',
                        rows: [new FormRow({ fields: [new FormTextField({ key: 'name', isRequired: true })] })]
                    }),
                    new FormSection({
                        key: 'extra',
                        rows: [new FormRow({ fields: [new FormTextField({ key: 'email' })] })]
                    })
                ],
                steps: [
                    new FormStep({ key: 'who', sections: ['contact'] }),
                    new FormStep({ key: 'how', sections: ['extra'] })
                ],
                ...overrides
            });
        }

        it('shows one step at a time and only lets the next one open once the current is valid', async () => {
            const onStepChange = jest.fn();
            await render(buildSteppedConfig({ onStepChange }));

            expect(input('name')).not.toBeNull();
            expect(input('email')).toBeNull();
            expect(button('angular-components.form.steps.next').disabled).toBe(true);

            await type('name', 'Ada');
            button('angular-components.form.steps.next').click();
            await settle(fixture);

            expect(input('name')).toBeNull();
            expect(input('email')).not.toBeNull();
            expect(onStepChange).toHaveBeenCalledWith('how');
        });

        it('shows the form buttons only on the last step, and keeps the values when going back', async () => {
            const onSubmit = jest.fn();
            await render(buildSteppedConfig({ onSubmit }));
            expect(text()).not.toContain('demo.submit');

            await type('name', 'Ada');
            button('angular-components.form.steps.next').click();
            await settle(fixture);
            await type('email', 'ada@example.com');
            expect(button('demo.submit').disabled).toBe(false);

            button('angular-components.form.steps.back').click();
            await settle(fixture);
            expect(input('name')?.value).toBe('Ada');

            button('angular-components.form.steps.next').click();
            await settle(fixture);
            button('demo.submit').click();

            expect(onSubmit).toHaveBeenCalledWith(
                { contact: { name: 'Ada' }, extra: { email: 'ada@example.com' } },
                expect.anything()
            );
        });

        it('jumps to a step from the handle', async () => {
            const onReady = jest.fn();
            await render(buildSteppedConfig({ onReady }));

            (onReady.mock.calls[0][0] as FormHandle<DemoValue>).goToStep('how');
            await settle(fixture);

            expect(input('email')).not.toBeNull();
        });
    });

    it('rebuilds from a replaced config', async () => {
        const onReady = jest.fn();
        await render(buildConfig({ onReady }));
        await type('name', 'Ada');

        fixture.componentRef.setInput(
            'config',
            buildConfig({ initialValue: { contact: { email: '', name: 'Grace' } }, onReady })
        );
        await settle(fixture);

        expect(input('name')?.value).toBe('Grace');
        expect(button('demo.submit').disabled).toBe(true);
        expect(onReady).toHaveBeenCalledTimes(2);
    });
});
