import { ComponentFixture, TestBed } from '@angular/core/testing';
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { queryButton, renderComponent, settle } from '@testing/dom';

import { PropertyColorField } from '../../models/fields/property-color-field.model';
import { PropertyNumberField } from '../../models/fields/property-number-field.model';
import { PropertySegmentedField } from '../../models/fields/property-segmented-field.model';
import { PropertySelectField } from '../../models/fields/property-select-field.model';
import { PropertyTextField } from '../../models/fields/property-text-field.model';
import { PropertyToggleField } from '../../models/fields/property-toggle-field.model';
import { PropertiesMenuConfig } from '../../models/properties-menu-config.model';
import { PropertyField } from '../../models/property-field.model';
import { PropertyOption } from '../../models/property-option.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { PropertyFieldComponent } from './property-field.component';

describe('PropertyFieldComponent', () => {
    let component: PropertyFieldComponent;
    let fixture: ComponentFixture<PropertyFieldComponent>;
    let propertiesMenuService: PropertiesMenuService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyFieldComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService]
        }).compileComponents();

        propertiesMenuService = TestBed.inject(PropertiesMenuService);
    });

    async function renderField(field: PropertyField): Promise<void> {
        fixture = await renderComponent(PropertyFieldComponent, { field });
        component = fixture.componentInstance;
    }

    it('should render the text field for type "text"', async () => {
        await renderField(new PropertyTextField({ id: 'text' }));

        expect(fixture.nativeElement.querySelector('bey-property-text-field')).toBeTruthy();
    });

    it('should render the number field for type "number"', async () => {
        await renderField(new PropertyNumberField({ id: 'size' }));

        expect(fixture.nativeElement.querySelector('bey-property-number-field')).toBeTruthy();
    });

    it('should render the select field for type "select"', async () => {
        await renderField(new PropertySelectField({ id: 'font', options: [new PropertyOption({ value: 'Inter' })] }));

        expect(fixture.nativeElement.querySelector('bey-property-select-field')).toBeTruthy();
    });

    it('should render the toggle field for type "toggle"', async () => {
        await renderField(new PropertyToggleField({ id: 'visible' }));

        expect(fixture.nativeElement.querySelector('bey-property-toggle-field')).toBeTruthy();
    });

    it('should render the color field for type "color"', async () => {
        await renderField(new PropertyColorField({ id: 'color' }));

        expect(fixture.nativeElement.querySelector('bey-property-color-field')).toBeTruthy();
    });

    it('should render the segmented field for type "segmented"', async () => {
        await renderField(
            new PropertySegmentedField({ id: 'alignment', options: [new PropertyOption({ value: 'left' })] })
        );

        expect(fixture.nativeElement.querySelector('bey-property-segmented-field')).toBeTruthy();
    });

    it('should not render anything for a hidden field', async () => {
        await renderField(new PropertyTextField({ id: 'text', hidden: true }));

        expect(fixture.nativeElement.querySelector('bey-property-text-field')).toBeNull();
        expect(fixture.nativeElement.textContent?.trim()).toBe('');
    });

    it('should forward value changes to the menu service', async () => {
        await renderField(new PropertyTextField({ id: 'text', value: 'FACTURA' }));

        const updateSpy = jest.spyOn(propertiesMenuService, 'updateFieldValue');

        component.onValueChange('NUEVO');

        expect(updateSpy).toHaveBeenCalledWith('text', 'NUEVO');
    });

    it('should resolve a default field label into a prefixed translation key', async () => {
        propertiesMenuService.setConfig(new PropertiesMenuConfig({ prefix: 'app.properties-menu' }));
        await renderField(new PropertyTextField({ id: 'text' }));

        expect(component.labelKey()).toBe('app.properties-menu.fields.text.label');
    });

    it('reads the label and action button texts of a camelCase field id from its kebab-case segment', async () => {
        propertiesMenuService.setConfig(new PropertiesMenuConfig({ prefix: 'app.properties-menu' }));
        await renderField(
            new PropertyTextField({ actionButton: { icon: faWandMagicSparkles }, id: 'pageTitle', value: 'Invoice' })
        );
        const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

        input.setSelectionRange(0, 3);
        input.dispatchEvent(new Event('select'));
        await settle(fixture);

        expect(fixture.nativeElement.querySelector('label').textContent.trim()).toBe(
            'app.properties-menu.fields.page-title.label'
        );
        expect(queryButton(fixture, 'app.properties-menu.fields.page-title.action-button.tooltip')).not.toBeNull();
    });
});
