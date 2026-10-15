import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { buttonByName, queryAll, queryButton, renderComponent, settle, textsOf } from '@testing/dom';
import { of, throwError } from 'rxjs';

import {
    FormAutocompleteField,
    FormAutocompleteFieldParameters
} from '../../../models/fields/form-autocomplete-field.model';
import { FormFieldOption } from '../../../models/form-field.model';
import { FormAutocompleteFieldComponent } from './field-autocomplete.component';

const PEOPLE: FormFieldOption[] = [
    { label: 'Nora Lectora (nora@empresa.com)', value: 'u1' },
    { label: 'Íñigo Ruiz (inigo@empresa.com)', value: 'u2' },
    { label: 'Ada Lovelace (ada@empresa.com)', value: 'u3' }
];

describe('FormAutocompleteFieldComponent', () => {
    let fixture: ComponentFixture<FormAutocompleteFieldComponent>;
    let control: FormControl<string | null>;

    function input(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }

    function panelOptions(): HTMLButtonElement[] {
        return queryAll<HTMLButtonElement>(document.body, '[role="option"]');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormAutocompleteFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();

        control = new FormControl<string | null>('');
        fixture = await renderComponent(FormAutocompleteFieldComponent, {
            control,
            field: new FormAutocompleteField({ key: 'city' }),
            options: [
                { label: 'Madrid', value: 'mad' },
                { label: 'Malaga', value: 'agp' },
                { label: 'Bilbao', value: 'bio', isDisabled: true }
            ],
            prefix: 'demo.trip.city'
        });
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('filters the options by the typed text and writes the picked one', async () => {
        input().dispatchEvent(new Event('focus'));
        await settle(fixture);
        expect(textsOf(panelOptions())).toEqual(['Madrid', 'Malaga', 'Bilbao']);

        input().value = 'ma';
        input().dispatchEvent(new Event('input'));
        await settle(fixture);
        expect(textsOf(panelOptions())).toEqual(['Madrid', 'Malaga']);

        panelOptions()[1].dispatchEvent(new MouseEvent('mousedown'));
        await settle(fixture);

        expect(control.value).toBe('agp');
        expect(input().value).toBe('Malaga');
        expect(panelOptions()).toHaveLength(0);
    });

    it('walks the options with the keyboard and picks with Enter', async () => {
        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        await settle(fixture);

        expect(control.value).toBe('agp');
    });

    it('clears the value from the clear button', async () => {
        control.setValue('mad');
        await settle(fixture);

        buttonByName(fixture, 'angular-components.form.autocomplete-field.clear').dispatchEvent(
            new MouseEvent('mousedown')
        );
        await settle(fixture);

        expect(control.value).toBe('');
    });

    describe('with free text', () => {
        beforeEach(async () => {
            fixture.destroy();
            control = new FormControl<string | null>('Sales');
            fixture = await renderComponent(FormAutocompleteFieldComponent, {
                control,
                field: new FormAutocompleteField({ key: 'section', isFreeTextAllowed: true }),
                options: [
                    { label: 'Sales', value: 'Sales' },
                    { label: 'Support', value: 'Support' },
                    { label: 'Billing', value: 'Billing' }
                ],
                prefix: 'demo.variable.section'
            });
        });

        it('keeps the current value to edit and suggests every option until something is typed', async () => {
            input().dispatchEvent(new Event('focus'));
            await settle(fixture);

            expect(input().value).toBe('Sales');
            expect(textsOf(panelOptions())).toEqual(['Sales', 'Support', 'Billing']);
        });

        it('takes the typed text as the value, suggesting the options that match it', async () => {
            input().dispatchEvent(new Event('focus'));
            input().value = 'Su';
            input().dispatchEvent(new Event('input'));
            await settle(fixture);

            expect(control.value).toBe('Su');
            expect(textsOf(panelOptions())).toEqual(['Support']);

            input().value = 'Suppliers';
            input().dispatchEvent(new Event('input'));
            input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            await settle(fixture);

            expect(control.value).toBe('Suppliers');
            expect(input().value).toBe('Suppliers');
            expect(panelOptions()).toHaveLength(0);
        });

        it('shows no panel while no option matches the typed text', async () => {
            input().dispatchEvent(new Event('focus'));
            input().value = 'Suppliers';
            input().dispatchEvent(new Event('input'));
            await settle(fixture);

            expect(document.body.querySelector('[role="listbox"]')).toBeNull();
        });
    });

    describe('as a picker of people', () => {
        let onSelect: jest.Mock;

        beforeEach(() => {
            onSelect = jest.fn();
        });

        async function renderPicker(
            overrides: Partial<FormAutocompleteFieldParameters> = {},
            excludedValues: string[] = []
        ): Promise<void> {
            fixture.destroy();
            control = new FormControl<string | null>('');
            fixture = await renderComponent(FormAutocompleteFieldComponent, {
                control,
                excludedValues,
                field: new FormAutocompleteField({ isClearedOnSelect: true, key: 'member', onSelect, ...overrides }),
                options: PEOPLE,
                prefix: 'demo.group.member'
            });
        }

        async function type(text: string): Promise<void> {
            input().dispatchEvent(new Event('focus'));
            input().value = text;
            input().dispatchEvent(new Event('input'));
            await settle(fixture);
        }

        it.each([
            ['nora', ['Nora Lectora (nora@empresa.com)']],
            ['nora lec', ['Nora Lectora (nora@empresa.com)']],
            ['NORA@', ['Nora Lectora (nora@empresa.com)']],
            ['inigo', ['Íñigo Ruiz (inigo@empresa.com)']],
            ['empresa', PEOPLE.map(({ label }) => label)]
        ])('finds %p by name, surname or email, whatever its case and accents', async (text, labels) => {
            await renderPicker();

            await type(text);

            expect(textsOf(panelOptions())).toEqual(labels);
        });

        it('leaves out the options already chosen', async () => {
            await renderPicker({}, ['u1']);

            await type('empresa');

            expect(textsOf(panelOptions())).toEqual([
                'Íñigo Ruiz (inigo@empresa.com)',
                'Ada Lovelace (ada@empresa.com)'
            ]);
        });

        it('matches with the filter of the field when it has one', async () => {
            await renderPicker({ filter: (option, text) => option.value === text });

            await type('u3');

            expect(textsOf(panelOptions())).toEqual(['Ada Lovelace (ada@empresa.com)']);
        });

        it('hands the picked option to onSelect and clears the input, leaving the value empty', async () => {
            await renderPicker();

            await type('nora');
            panelOptions()[0].dispatchEvent(new MouseEvent('mousedown'));
            await settle(fixture);

            expect(onSelect).toHaveBeenCalledWith(PEOPLE[0]);
            expect(input().value).toBe('');
            expect(control.value).toBe('');
            expect(panelOptions()).toHaveLength(0);
        });

        it('asks the search for the first options on focus, with the values left out, instead of the options', async () => {
            const search = jest.fn(() => of([PEOPLE[2]]));
            await renderPicker({ search }, ['u1']);

            input().dispatchEvent(new Event('focus'));
            await settle(fixture);

            expect(search).toHaveBeenCalledWith('', ['u1']);
            expect(textsOf(panelOptions())).toEqual(['Ada Lovelace (ada@empresa.com)']);
        });

        it('says at the end of the suggestions that there are more matches when the search answers so', async () => {
            await renderPicker({ search: () => of({ hasMore: true, options: [PEOPLE[0], PEOPLE[2]] }) });

            await type('empresa');

            expect(textsOf(panelOptions())).toEqual([
                'Nora Lectora (nora@empresa.com)',
                'Ada Lovelace (ada@empresa.com)'
            ]);
            expect(document.body.querySelector('[role="listbox"]')?.textContent).toContain(
                'angular-components.form.autocomplete-field.more'
            );
        });

        it.each([
            ['a list of options', of([PEOPLE[0]])],
            ['no more matches', of({ hasMore: false, options: [PEOPLE[0]] })]
        ])('says nothing about more matches when the search answers %s', async (_, answer) => {
            await renderPicker({ search: () => answer });

            await type('nora');

            expect(textsOf(panelOptions())).toEqual(['Nora Lectora (nora@empresa.com)']);
            expect(document.body.querySelector('[role="listbox"]')?.textContent).not.toContain(
                'angular-components.form.autocomplete-field.more'
            );
        });

        it('says there are more matches instead of none when every option it answers is left out', async () => {
            await renderPicker({ search: () => of({ hasMore: true, options: [PEOPLE[0]] }) }, ['u1']);

            await type('nora');
            const panel = document.body.querySelector('[role="listbox"]')?.textContent;

            expect(panel).toContain('angular-components.form.autocomplete-field.more');
            expect(panel).not.toContain('angular-components.form.autocomplete-field.empty');
        });

        it('says nothing matches when the search fails', async () => {
            await renderPicker({ search: () => throwError(() => new Error('offline')) });

            await type('nora');

            expect(document.body.querySelector('[role="listbox"]')?.textContent).toContain(
                'angular-components.form.autocomplete-field.empty'
            );
        });
    });

    describe('as a typeahead', () => {
        beforeEach(async () => {
            fixture.destroy();
            control = new FormControl<string | null>('');
            fixture = await renderComponent(FormAutocompleteFieldComponent, {
                control,
                field: new FormAutocompleteField({ isTypeahead: true, key: 'member' }),
                options: PEOPLE,
                prefix: 'demo.group.member'
            });
        });

        async function type(text: string): Promise<void> {
            input().value = text;
            input().dispatchEvent(new Event('input'));
            await settle(fixture);
        }

        it('offers no toggle and suggests nothing until something is typed', async () => {
            input().dispatchEvent(new Event('focus'));
            input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
            input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            await settle(fixture);

            expect(queryButton(fixture, 'angular-components.form.autocomplete-field.toggle')).toBeNull();
            expect(document.body.querySelector('[role="listbox"]')).toBeNull();
            expect(control.value).toBe('');

            await type('nora');

            expect(textsOf(panelOptions())).toEqual(['Nora Lectora (nora@empresa.com)']);

            await type(' ');

            expect(document.body.querySelector('[role="listbox"]')).toBeNull();
        });

        it('takes only a picked option: typing over it empties the value, and leaving drops the typed text', async () => {
            input().dispatchEvent(new Event('focus'));
            await type('ada');
            panelOptions()[0].dispatchEvent(new MouseEvent('mousedown'));
            await settle(fixture);

            expect(control.value).toBe('u3');
            expect(input().value).toBe('Ada Lovelace (ada@empresa.com)');

            await type('Ada Lovelace');

            expect(control.value).toBe('');

            input().dispatchEvent(new Event('blur'));
            await settle(fixture);

            expect(input().value).toBe('');
            expect(control.value).toBe('');
            expect(control.touched).toBe(true);
        });
    });

    it('moves the panel to the body while open and takes it away on close', async () => {
        input().dispatchEvent(new Event('focus'));
        await settle(fixture);
        expect(document.body.querySelector('[role="listbox"]')).not.toBeNull();

        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        await settle(fixture);

        expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    });

    it('points the input at its options only while they are there', async () => {
        expect(input().hasAttribute('aria-controls')).toBe(false);

        input().dispatchEvent(new Event('focus'));
        await settle(fixture);

        const listId = input().getAttribute('aria-controls');

        expect(textsOf(queryAll(document.body, `#${listId} [role="option"]`))).toEqual(['Madrid', 'Malaga', 'Bilbao']);

        input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        await settle(fixture);

        expect(input().hasAttribute('aria-controls')).toBe(false);
    });
});

describe('FormAutocompleteFieldComponent with a server search', () => {
    let fixture: ComponentFixture<FormAutocompleteFieldComponent>;

    function input(): HTMLInputElement {
        return fixture.nativeElement.querySelector('input');
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormAutocompleteFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('waits until typing settles to search, and shows what it answers but the values left out', fakeAsync(() => {
        const search = jest.fn(() => of(PEOPLE));
        fixture = TestBed.createComponent(FormAutocompleteFieldComponent);
        fixture.componentRef.setInput('control', new FormControl<string | null>(''));
        fixture.componentRef.setInput('excludedValues', ['u2']);
        fixture.componentRef.setInput('field', new FormAutocompleteField({ key: 'member', search }));
        fixture.componentRef.setInput('prefix', 'demo.group.member');
        fixture.detectChanges();

        input().value = 'empresa';
        input().dispatchEvent(new Event('input'));
        tick(299);

        expect(search).not.toHaveBeenCalled();

        tick(1);
        fixture.detectChanges();

        expect(search).toHaveBeenCalledWith('empresa', ['u2']);
        expect(textsOf(queryAll(document.body, '[role="option"]'))).toEqual([
            'Nora Lectora (nora@empresa.com)',
            'Ada Lovelace (ada@empresa.com)'
        ]);
    }));

    it('asks a typeahead search for the typed text once typing settles, and never for an empty one', fakeAsync(() => {
        const search = jest.fn(() => of({ hasMore: true, options: [PEOPLE[0]] }));
        fixture = TestBed.createComponent(FormAutocompleteFieldComponent);
        fixture.componentRef.setInput('control', new FormControl<string | null>(''));
        fixture.componentRef.setInput('field', new FormAutocompleteField({ isTypeahead: true, key: 'member', search }));
        fixture.componentRef.setInput('prefix', 'demo.group.member');
        fixture.detectChanges();

        input().dispatchEvent(new Event('focus'));
        tick(300);

        expect(search).not.toHaveBeenCalled();

        input().value = 'nora';
        input().dispatchEvent(new Event('input'));
        tick(300);
        fixture.detectChanges();

        expect(search).toHaveBeenCalledWith('nora', []);
        expect(textsOf(queryAll(document.body, '[role="option"]'))).toEqual(['Nora Lectora (nora@empresa.com)']);
        expect(document.body.querySelector('[role="listbox"]')?.textContent).toContain(
            'angular-components.form.autocomplete-field.more'
        );

        input().value = '';
        input().dispatchEvent(new Event('input'));
        tick(300);
        fixture.detectChanges();

        expect(search).toHaveBeenCalledTimes(1);
        expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    }));
});
