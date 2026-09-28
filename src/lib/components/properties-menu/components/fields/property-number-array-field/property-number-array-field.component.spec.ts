import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { buttonByName, queryAll, queryButton, renderComponent } from '@testing/dom';

import propertiesMenuEn from '../../../assets/properties-menu.en.json';
import {
    PropertyNumberArrayField,
    PropertyNumberArrayFieldParameters
} from '../../../models/fields/property-number-array-field.model';
import { PropertyFieldLabelling } from '../../../models/property-field-labelling.model';
import { PropertyNumberArrayFieldComponent } from './property-number-array-field.component';

const LABELLING: PropertyFieldLabelling = { controlId: 'widths', labelId: null, labelKey: 'Widths' };

describe('PropertyNumberArrayFieldComponent', () => {
    let fixture: ComponentFixture<PropertyNumberArrayFieldComponent>;
    let emitted: number[][];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyNumberArrayFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();

        const translate = TestBed.inject(TranslateService);

        translate.setTranslation('en', propertiesMenuEn);
        translate.use('en');
    });

    async function render(parameters: Omit<PropertyNumberArrayFieldParameters, 'id'>): Promise<void> {
        emitted = [];
        fixture = await renderComponent(PropertyNumberArrayFieldComponent, {
            field: new PropertyNumberArrayField({ id: 'widths', ...parameters }),
            labelling: LABELLING
        });
        fixture.componentInstance.valueChange.subscribe(value => emitted.push(value));
    }

    function entry(position: number): HTMLInputElement {
        const [found] = queryAll<HTMLInputElement>(fixture, `[aria-label="Widths, entry ${position}"]`);

        return found;
    }

    it('renders one input per entry, named by its position', async () => {
        await render({ value: [1, 2, 3, 4] });

        expect([1, 2, 3, 4].map(position => entry(position).value)).toEqual(['1', '2', '3', '4']);
    });

    it('emits the array with the new entry appended when "add" is clicked', async () => {
        await render({ entryDefaultValue: 1, value: [1, 1] });

        buttonByName(fixture, 'Add').click();

        expect(emitted).toEqual([[1, 1, 1]]);
    });

    it('emits the array without that entry when its remove button is clicked', async () => {
        await render({ value: [1, 2, 3] });

        buttonByName(fixture, 'Remove Widths, entry 2').click();

        expect(emitted).toEqual([[1, 3]]);
    });

    it('offers no remove button at minLength', async () => {
        await render({ minLength: 1, value: [1] });

        expect(queryButton(fixture, 'Remove Widths, entry 1')).toBeNull();
    });

    it('hides the add button once maxLength is reached', async () => {
        await render({ maxLength: 2, value: [1, 1] });

        expect(queryButton(fixture, 'Add')).toBeNull();
    });

    it('emits the updated entry value on input', async () => {
        await render({ value: [1, 2] });

        entry(2).value = '5';
        entry(2).dispatchEvent(new Event('input'));

        expect(emitted).toEqual([[1, 5]]);
    });
});
