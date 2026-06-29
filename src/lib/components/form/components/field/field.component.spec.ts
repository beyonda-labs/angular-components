import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { mock, MockProxy } from 'jest-mock-extended';

import { FormConfig, FormSection } from '../../models/form.model';
import { FormField } from '../../models/form-field.model';
import { FormService } from '../../services/form.service';
import { FormFieldComponent } from './field.component';

describe('FormFieldComponent', () => {
    let component: FormFieldComponent;
    let fixture: ComponentFixture<FormFieldComponent>;
    let formServiceMock: MockProxy<FormService>;

    const prefixMock = 'prefix';

    beforeEach(async () => {
        formServiceMock = mock<FormService>();
        formServiceMock.getSectionGroup.mockReturnValue(new FormGroup({}));
        formServiceMock.getFieldControl.mockReturnValue(new FormControl());
        formServiceMock.getFieldPrefix.mockReturnValue(prefixMock);

        await TestBed.configureTestingModule({
            imports: [FormFieldComponent, TranslateModule.forRoot()],
            providers: [{ provide: FormService, useValue: formServiceMock }]
        }).compileComponents();

        fixture = TestBed.createComponent(FormFieldComponent);
        component = fixture.componentInstance;

        component.formConfig = {} as FormConfig;
        component.section = {} as FormSection;
        component.field = {} as FormField;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getFieldLabel', () => {
        // Act
        const result = component.getFieldLabel();

        // Assert
        expect(result).toBe(`${prefixMock}.label`);
    });

    it('getFieldTooltip', () => {
        // Act
        const result = component.getFieldTooltip();

        // Assert
        expect(result).toBe(`${prefixMock}.tooltip`);
    });

    it('isFieldValid', () => {
        // Arrange
        const control: MockProxy<FormControl> = mock<FormControl>({
            valid: true
        });
        formServiceMock.getFieldControl.mockReturnValue(control);

        // Act
        const result = component.isFieldValid();

        // Assert
        expect(result).toBe(true);
    });
});
