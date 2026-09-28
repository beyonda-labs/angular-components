import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { queryAll, queryButton, renderComponent } from '@testing/dom';

import propertiesMenuEn from '../../../assets/properties-menu.en.json';
import { PropertyColorField } from '../../../models/fields/property-color-field.model';
import { PropertyFieldLabelling } from '../../../models/property-field-labelling.model';
import { PropertyColorFieldComponent } from './property-color-field.component';

const LABELLING: PropertyFieldLabelling = { controlId: 'fill', labelId: null, labelKey: 'Fill' };

describe('PropertyColorFieldComponent', () => {
    let fixture: ComponentFixture<PropertyColorFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyColorFieldComponent, TranslateModule.forRoot()]
        }).compileComponents();

        const translate = TestBed.inject(TranslateService);

        translate.setTranslation('en', propertiesMenuEn);
        translate.use('en');
    });

    async function render(value: string): Promise<void> {
        fixture = await renderComponent(PropertyColorFieldComponent, {
            field: new PropertyColorField({ id: 'fill', value }),
            labelling: LABELLING
        });
    }

    function hexInput(): HTMLInputElement {
        const [found] = queryAll<HTMLInputElement>(fixture, '[aria-label="Fill hex value"]');

        return found;
    }

    it('shows no clear button when the value is unset', async () => {
        await render('');

        expect(hexInput().value).toBe('');
        expect(queryButton(fixture, 'Clear')).toBeNull();
    });

    it('shows the value and a clear button once a value is set', async () => {
        await render('#ff0000');

        expect(hexInput().value).toBe('#ff0000');
        expect(queryButton(fixture, 'Clear')).not.toBeNull();
    });

    it('emits an empty string when the clear button is clicked', async () => {
        await render('#ff0000');
        const emitted: string[] = [];

        fixture.componentInstance.valueChange.subscribe(value => emitted.push(value));
        queryButton(fixture, 'Clear')?.click();

        expect(emitted).toEqual(['']);
    });

    it('emits the colour typed as a hex value', async () => {
        await render('#ff0000');
        const emitted: string[] = [];

        fixture.componentInstance.valueChange.subscribe(value => emitted.push(value));
        hexInput().value = '#00ff00';
        hexInput().dispatchEvent(new Event('change'));

        expect(emitted).toEqual(['#00ff00']);
    });
});
