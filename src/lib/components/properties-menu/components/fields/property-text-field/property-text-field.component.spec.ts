import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { buttonByName, queryAll, queryButton, renderComponent, settle } from '@testing/dom';

import propertiesMenuEn from '../../../assets/properties-menu.en.json';
import { PropertyTextField } from '../../../models/fields/property-text-field.model';
import { PropertyFieldLabelling } from '../../../models/property-field-labelling.model';
import { PropertyVariable } from '../../../models/property-variable.model';
import { PropertiesMenuService } from '../../../services/properties-menu.service';
import { PropertyTextFieldComponent } from './property-text-field.component';

const LABELLING: PropertyFieldLabelling = { controlId: 'title', labelId: null, labelKey: 'Title' };

describe('PropertyTextFieldComponent', () => {
    let fixture: ComponentFixture<PropertyTextFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyTextFieldComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService]
        }).compileComponents();

        const translate = TestBed.inject(TranslateService);

        translate.setTranslation('en', propertiesMenuEn);
        translate.use('en');
    });

    async function render(field: PropertyTextField): Promise<void> {
        fixture = await renderComponent(PropertyTextFieldComponent, { field, labelling: LABELLING });
    }

    function input(): HTMLInputElement {
        const [found] = queryAll<HTMLInputElement>(fixture, '[aria-label="Title"]');

        return found;
    }

    it('hides the variable trigger without acceptsVariable', async () => {
        await render(new PropertyTextField({ id: 'title', acceptsVariable: false }));

        expect(queryButton(fixture, 'Insert variable')).toBeNull();
    });

    it('shows the variable trigger with acceptsVariable', async () => {
        await render(new PropertyTextField({ id: 'title', acceptsVariable: true }));

        expect(queryButton(fixture, 'Insert variable')).not.toBeNull();
    });

    it('emits what is typed', async () => {
        await render(new PropertyTextField({ id: 'title', value: '' }));
        const emitted: string[] = [];

        fixture.componentInstance.valueChange.subscribe(value => emitted.push(value));
        input().value = 'INVOICE';
        input().dispatchEvent(new Event('input'));

        expect(emitted).toEqual(['INVOICE']);
    });

    it('appends the picked variable at the end when no cursor position is known', async () => {
        const variable = new PropertyVariable({ id: 'customer-name', label: 'Customer name', path: 'customer.name' });
        const inserted: unknown[] = [];

        TestBed.inject(PropertiesMenuService).setVariables([variable]);
        await render(new PropertyTextField({ id: 'title', acceptsVariable: true, value: 'INVOICE' }));
        fixture.componentInstance.variableInserted.subscribe(insertion => inserted.push(insertion));

        buttonByName(fixture, 'Insert variable').click();
        await settle(fixture);
        queryAll(document.body, '[role="option"]')
            .find(option => option.textContent?.includes('Customer name'))
            ?.click();
        await settle(fixture);

        expect(inserted).toEqual([{ value: 'INVOICE{{ customer.name }}', variable }]);
        expect(buttonByName(fixture, 'Insert variable').getAttribute('aria-expanded')).toBe('false');
    });
});
