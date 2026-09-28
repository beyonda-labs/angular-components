import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { queryAll, renderComponent, settle, textsOf } from '@testing/dom';

import propertiesMenuEn from '../../../assets/properties-menu.en.json';
import { PropertySelectField } from '../../../models/fields/property-select-field.model';
import { PropertyFieldLabelling } from '../../../models/property-field-labelling.model';
import { PropertyOption } from '../../../models/property-option.model';
import { PropertySelectFieldComponent } from './property-select-field.component';

const LABELLING: PropertyFieldLabelling = { controlId: 'template', labelId: null, labelKey: 'Template' };

function buildField(searchable: boolean, disabledValue?: string): PropertySelectField {
    return new PropertySelectField({
        id: 'templateId',
        options: [
            new PropertyOption({ disabled: disabledValue === 'a', label: 'app.templates.invoice', value: 'a' }),
            new PropertyOption({ label: 'app.templates.letterhead', value: 'b' }),
            new PropertyOption({ label: 'app.templates.report', value: 'c' })
        ],
        searchable,
        value: 'b'
    });
}

describe('PropertySelectFieldComponent', () => {
    let fixture: ComponentFixture<PropertySelectFieldComponent>;
    let emitted: unknown[];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertySelectFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();

        const translate = TestBed.inject(TranslateService);

        translate.setTranslation('en', propertiesMenuEn);
        translate.setTranslation(
            'en',
            { app: { templates: { invoice: 'Invoice', letterhead: 'Letterhead', report: 'Report' } } },
            true
        );
        translate.use('en');
    });

    async function render(field: PropertySelectField): Promise<void> {
        emitted = [];
        fixture = await renderComponent(PropertySelectFieldComponent, { field, labelling: LABELLING });
        fixture.componentInstance.valueChange.subscribe(value => emitted.push(value));
    }

    function control<T extends HTMLElement = HTMLInputElement>(): T {
        const [found] = queryAll<T>(fixture, '[aria-label="Template"]');

        return found;
    }

    function options(): HTMLElement[] {
        return queryAll(fixture, '[role="option"]');
    }

    function option(name: string): HTMLElement {
        const found = options().find(element => element.textContent?.trim() === name);

        if (!found) {
            throw new Error(`No option named ${name}`);
        }

        return found;
    }

    async function dispatch(event: Event, target: HTMLElement = control()): Promise<void> {
        target.dispatchEvent(event);
        await settle(fixture);
    }

    async function type(value: string): Promise<void> {
        control().value = value;
        await dispatch(new Event('input'));
    }

    describe('as a plain select', () => {
        beforeEach(async () => {
            await render(buildField(false));
        });

        it('selects the option that holds the value of the field', () => {
            expect(control<HTMLSelectElement>().value).toBe('b');
        });

        it('emits the value of the option picked', async () => {
            control<HTMLSelectElement>().value = 'c';
            await dispatch(new Event('change'));

            expect(emitted).toEqual(['c']);
        });
    });

    describe('as a searchable select', () => {
        beforeEach(async () => {
            await render(buildField(true));
        });

        it('renders a combobox', () => {
            expect(control().getAttribute('role')).toBe('combobox');
        });

        it('shows the current selection while closed, and the query once open', async () => {
            expect(control().value).toBe('Letterhead');

            await dispatch(new Event('focus'));
            await type('rep');

            expect(control().value).toBe('rep');
        });

        it('filters options by their translated label, case-insensitively', async () => {
            await dispatch(new Event('focus'));
            await type('LETTER');

            expect(textsOf(options())).toEqual(['Letterhead']);
        });

        it('lists every option for a blank query', async () => {
            await dispatch(new Event('focus'));
            await type('   ');

            expect(textsOf(options())).toEqual(['Invoice', 'Letterhead', 'Report']);
        });

        it('emits the option value and closes when one is picked', async () => {
            await dispatch(new Event('focus'));
            await dispatch(new MouseEvent('mousedown'), option('Report'));

            expect(emitted).toEqual(['c']);
            expect(control().getAttribute('aria-expanded')).toBe('false');
        });

        it('ignores a disabled option', async () => {
            await render(buildField(true, 'a'));
            await dispatch(new Event('focus'));
            await dispatch(new MouseEvent('mousedown'), option('Invoice'));

            expect(emitted).toEqual([]);
        });

        it('picks the first enabled match on Enter', async () => {
            await dispatch(new Event('focus'));
            await type('e');
            await dispatch(new KeyboardEvent('keydown', { key: 'Enter' }));

            expect(emitted).toEqual(['a']);
        });

        it('closes without emitting on Escape', async () => {
            await dispatch(new Event('focus'));
            await dispatch(new KeyboardEvent('keydown', { key: 'Escape' }));

            expect(control().getAttribute('aria-expanded')).toBe('false');
            expect(emitted).toEqual([]);
        });
    });
});
