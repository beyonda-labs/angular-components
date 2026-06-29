import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { mock, MockProxy } from 'jest-mock-extended';

import { FormCheckboxField } from '../../../models/fields/form-checkbox-field.model';
import { FormConfig, FormSection } from '../../../models/form.model';
import { FormService } from '../../../services/form.service';
import { FormCheckboxFieldComponent } from './field-checkbox.component';

describe('FormCheckboxFieldComponent', () => {
    let component: FormCheckboxFieldComponent;
    let fixture: ComponentFixture<FormCheckboxFieldComponent>;
    let formServiceMock: MockProxy<FormService>;

    beforeEach(async () => {
        formServiceMock = mock<FormService>();
        formServiceMock.getSectionGroup.mockReturnValue(new FormGroup({}));
        formServiceMock.getFieldControl.mockReturnValue(new FormControl(false));
        formServiceMock.getFieldPrefix.mockReturnValue('prefix');

        await TestBed.configureTestingModule({
            imports: [FormCheckboxFieldComponent, TranslateModule.forRoot()],
            providers: [{ provide: FormService, useValue: formServiceMock }]
        }).compileComponents();

        fixture = TestBed.createComponent(FormCheckboxFieldComponent);
        component = fixture.componentInstance;

        component.formConfig = {} as FormConfig;
        component.section = { key: 'section1' } as FormSection;
        component.field = { key: 'check1' } as FormCheckboxField;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getLabel should return translated key', () => {
        expect(component.getLabel()).toBe('prefix.label');
    });
});
