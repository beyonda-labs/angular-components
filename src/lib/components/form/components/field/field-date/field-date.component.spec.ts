import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { mock, MockProxy } from 'jest-mock-extended';

import { FormDateField } from '../../../models/fields/form-date-field.model';
import { FormConfig, FormSection } from '../../../models/form.model';
import { DatepickerLocaleService } from '../../../services/datepicker-locale.service';
import { FormService } from '../../../services/form.service';
import { FormDateFieldComponent } from './field-date.component';

describe('FormDateFieldComponent', () => {
    let component: FormDateFieldComponent;
    let control: FormControl<string | null>;
    let datepickerLocaleServiceMock: MockProxy<DatepickerLocaleService>;
    let fixture: ComponentFixture<FormDateFieldComponent>;
    let formServiceMock: MockProxy<FormService>;
    let translateService: TranslateService;

    const createComponent = (field: Partial<FormDateField> = {}, initialValue = '2026-04-02'): void => {
        control = new FormControl<string | null>(initialValue);
        formServiceMock.getFieldControl.mockReturnValue(control);

        fixture = TestBed.createComponent(FormDateFieldComponent);
        component = fixture.componentInstance;

        component.formConfig = {} as FormConfig;
        component.section = { key: 'section1' } as FormSection;
        component.field = { key: 'date1', format: 'YYYY-MM-DD', ...field } as FormDateField;

        fixture.detectChanges();
    };

    beforeEach(async () => {
        datepickerLocaleServiceMock = mock<DatepickerLocaleService>();
        datepickerLocaleServiceMock.getLocale.mockImplementation(language => (language?.startsWith('es') ? 'es' : 'en-gb'));
        formServiceMock = mock<FormService>();
        formServiceMock.getSectionGroup.mockReturnValue(new FormGroup({}));

        await TestBed.configureTestingModule({
            imports: [FormDateFieldComponent, TranslateModule.forRoot()],
            providers: [
                { provide: DatepickerLocaleService, useValue: datepickerLocaleServiceMock },
                { provide: FormService, useValue: formServiceMock }
            ]
        }).compileComponents();

        translateService = TestBed.inject(TranslateService);
        translateService.setDefaultLang('en');
        translateService.use('es');
    });

    beforeEach(() => {
        createComponent();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should sync the string control value into the datepicker control', () => {
        expect(component.datepickerControl.value).toEqual(new Date(2026, 3, 2));
    });

    it('should sync the datepicker locale on init and language changes', () => {
        expect(datepickerLocaleServiceMock.use).toHaveBeenCalledWith('es');
        expect(component.datepickerConfig.locale).toBe('es');

        translateService.use('en');

        expect(datepickerLocaleServiceMock.use).toHaveBeenLastCalledWith('en');
        expect(component.datepickerConfig.locale).toBe('en-gb');
    });

    it('should hide week numbers in the datepicker config', () => {
        expect(component.datepickerConfig.showWeekNumbers).toBe(false);
    });

    it('should use the field format as default placeholder', () => {
        expect(component.getPlaceholder()).toBe('YYYY-MM-DD');
    });

    it('isInvalid should return false if control untouched', () => {
        expect(component.isInvalid()).toBe(false);
    });

    it('should sync the selected date back into the form control as yyyy-mm-dd', () => {
        component.datepickerControl.setValue(new Date(2026, 6, 15));

        expect(control.value).toBe('2026-07-15');
    });

    it('should honor a custom format for config, placeholder and value sync', () => {
        createComponent({ format: 'DD/MM/YYYY' }, '02/04/2026');

        expect(component.datepickerConfig.dateInputFormat).toBe('DD/MM/YYYY');
        expect(component.getPlaceholder()).toBe('DD/MM/YYYY');
        expect(component.datepickerControl.value).toEqual(new Date(2026, 3, 2));

        component.datepickerControl.setValue(new Date(2026, 6, 15));

        expect(control.value).toBe('15/07/2026');
    });

    it('should keep an explicit placeholder over the field format', () => {
        createComponent({ format: 'DD/MM/YYYY', placeholder: 'Seleccione una fecha' });

        expect(component.getPlaceholder()).toBe('Seleccione una fecha');
    });
});
