import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { mock, MockProxy } from 'jest-mock-extended';

import { FormNumberField } from '../../../models/fields/form-number-field.model';
import { FormConfig, FormSection } from '../../../models/form.model';
import { FormService } from '../../../services/form.service';
import { FormNumberFieldComponent } from './field-number.component';

describe('FormNumberFieldComponent', () => {
    let component: FormNumberFieldComponent;
    let fixture: ComponentFixture<FormNumberFieldComponent>;
    let formServiceMock: MockProxy<FormService>;

    beforeEach(async () => {
        formServiceMock = mock<FormService>();
        formServiceMock.getSectionGroup.mockReturnValue(new FormGroup({}));
        formServiceMock.getFieldControl.mockReturnValue(new FormControl(0));
        formServiceMock.getFieldPrefix.mockReturnValue('prefix');

        await TestBed.configureTestingModule({
            imports: [FormNumberFieldComponent, TranslateModule.forRoot()],
            providers: [{ provide: FormService, useValue: formServiceMock }]
        }).compileComponents();

        fixture = TestBed.createComponent(FormNumberFieldComponent);
        component = fixture.componentInstance;

        component.formConfig = {} as FormConfig;
        component.section = { key: 'section1' } as FormSection;
        component.field = { key: 'number1' } as FormNumberField;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getPlaceholder should return translated key', () => {
        expect(component.getPlaceholder()).toBe('prefix.placeholder');
    });
});
