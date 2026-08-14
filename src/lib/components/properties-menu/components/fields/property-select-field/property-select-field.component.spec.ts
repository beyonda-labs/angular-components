import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PropertySelectField } from '../../../models/fields/property-select-field.model';
import { PropertySelectFieldComponent } from './property-select-field.component';

const buildField = (searchable: boolean): PropertySelectField =>
    new PropertySelectField({
        id: 'templateId',
        searchable,
        value: 'b',
        options: [{ label: 'Invoice', value: 'a' }, { label: 'Letterhead', value: 'b' }, { label: 'Report', value: 'c' }]
    });

describe('PropertySelectFieldComponent', () => {
    let component: PropertySelectFieldComponent;
    let fixture: ComponentFixture<PropertySelectFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertySelectFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertySelectFieldComponent);
        component = fixture.componentInstance;
    });

    describe('as a plain select', () => {
        beforeEach(() => {
            component.field = buildField(false);
            fixture.detectChanges();
        });

        it('renders a native select and no filter box', () => {
            const element = fixture.nativeElement as HTMLElement;

            expect(element.querySelector('select')).not.toBeNull();
            expect(element.querySelector('input')).toBeNull();
        });
    });

    describe('as a searchable select', () => {
        beforeEach(() => {
            component.field = buildField(true);
            fixture.detectChanges();
        });

        it('renders a filter box instead of a native select', () => {
            const element = fixture.nativeElement as HTMLElement;

            expect(element.querySelector('input')).not.toBeNull();
            expect(element.querySelector('select')).toBeNull();
        });

        it('shows the current selection while closed, and the query once open', () => {
            expect(component.inputValue).toBe('Letterhead');

            component.onFocus();
            component.query = 'rep';

            expect(component.inputValue).toBe('rep');
        });

        it('filters options by their translated label, case-insensitively', () => {
            component.query = 'LETTER';

            expect(component.filteredOptions.map(option => option.value)).toEqual(['b']);
        });

        it('returns every option for an empty query', () => {
            component.query = '   ';

            expect(component.filteredOptions).toHaveLength(3);
        });

        it('emits the option value and closes when one is picked', () => {
            const emitted: unknown[] = [];

            component.valueChange.subscribe(value => emitted.push(value));
            component.onFocus();
            component.onOptionPicked(component.field.options[2], new MouseEvent('mousedown'));

            expect(emitted).toEqual(['c']);
            expect(component.isOpen).toBe(false);
        });

        it('ignores a disabled option', () => {
            const emitted: unknown[] = [];

            component.field.options[0].disabled = true;
            component.valueChange.subscribe(value => emitted.push(value));
            component.onOptionPicked(component.field.options[0], new MouseEvent('mousedown'));

            expect(emitted).toEqual([]);
        });

        it('picks the first enabled match on Enter', () => {
            const emitted: unknown[] = [];

            component.valueChange.subscribe(value => emitted.push(value));
            component.query = 'e';
            component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

            expect(emitted).toEqual(['a']);
        });

        it('closes without emitting on Escape', () => {
            const emitted: unknown[] = [];

            component.valueChange.subscribe(value => emitted.push(value));
            component.onFocus();
            component.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));

            expect(component.isOpen).toBe(false);
            expect(emitted).toEqual([]);
        });
    });
});
