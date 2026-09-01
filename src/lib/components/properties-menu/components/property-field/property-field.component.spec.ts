import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyColorField } from '../../models/fields/property-color-field.model';
import { PropertyNumberField } from '../../models/fields/property-number-field.model';
import { PropertySegmentedField } from '../../models/fields/property-segmented-field.model';
import { PropertySelectField } from '../../models/fields/property-select-field.model';
import { PropertyTextField } from '../../models/fields/property-text-field.model';
import { PropertyToggleField } from '../../models/fields/property-toggle-field.model';
import { PropertyField } from '../../models/property-field.model';
import { PropertiesMenuService } from '../../services/properties-menu.service';
import { PropertyVariableService } from '../../services/property-variable.service';
import { PropertyFieldComponent } from './property-field.component';

describe('PropertyFieldComponent', () => {
    let component: PropertyFieldComponent;
    let fixture: ComponentFixture<PropertyFieldComponent>;
    let propertiesMenuService: PropertiesMenuService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyFieldComponent, TranslateModule.forRoot()],
            providers: [PropertiesMenuService, PropertyVariableService]
        }).compileComponents();

        fixture = TestBed.createComponent(PropertyFieldComponent);
        component = fixture.componentInstance;
        propertiesMenuService = TestBed.inject(PropertiesMenuService);
    });

    function renderField(field: PropertyField): void {
        component.field = field;
        fixture.detectChanges();
    }

    it('should render the text field for type "text"', () => {
        renderField(new PropertyTextField({ id: 'text' }));

        expect(fixture.nativeElement.querySelector('bey-property-text-field')).toBeTruthy();
    });

    it('should render the number field for type "number"', () => {
        renderField(new PropertyNumberField({ id: 'size' }));

        expect(fixture.nativeElement.querySelector('bey-property-number-field')).toBeTruthy();
    });

    it('should render the select field for type "select"', () => {
        renderField(new PropertySelectField({ id: 'font', options: [{ value: 'Inter' }] }));

        expect(fixture.nativeElement.querySelector('bey-property-select-field')).toBeTruthy();
    });

    it('should render the toggle field for type "toggle"', () => {
        renderField(new PropertyToggleField({ id: 'visible' }));

        expect(fixture.nativeElement.querySelector('bey-property-toggle-field')).toBeTruthy();
    });

    it('should render the color field for type "color"', () => {
        renderField(new PropertyColorField({ id: 'color' }));

        expect(fixture.nativeElement.querySelector('bey-property-color-field')).toBeTruthy();
    });

    it('should render the segmented field for type "segmented"', () => {
        renderField(new PropertySegmentedField({ id: 'alignment', options: [{ value: 'left' }] }));

        expect(fixture.nativeElement.querySelector('bey-property-segmented-field')).toBeTruthy();
    });

    it('should not render anything for a hidden field', () => {
        renderField(new PropertyTextField({ id: 'text', hidden: true }));

        expect(fixture.nativeElement.querySelector('.bey-property-field')).toBeFalsy();
    });

    it('should forward value changes to the menu service', () => {
        renderField(new PropertyTextField({ id: 'text', value: 'FACTURA' }));

        const updateSpy = jest.spyOn(propertiesMenuService, 'updateFieldValue');

        component.onValueChange('NUEVO');

        expect(updateSpy).toHaveBeenCalledWith('text', 'NUEVO');
    });

    it('should resolve a default field label into a prefixed translation key', () => {
        propertiesMenuService.setConfig({ prefix: 'app.properties-menu' });
        renderField(new PropertyTextField({ id: 'text' }));

        expect(component.labelKey).toBe('app.properties-menu.fields.text.label');
    });
});
