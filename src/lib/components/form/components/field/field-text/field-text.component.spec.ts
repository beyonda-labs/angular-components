import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { mock, MockProxy } from 'jest-mock-extended';

import { FormTextField } from '../../../models/fields/form-text-field.model';
import { FormConfig, FormSection } from '../../../models/form.model';
import { FormService } from '../../../services/form.service';
import { FormTextFieldComponent } from './field-text.component';

describe('FormTextFieldComponent', () => {
    let component: FormTextFieldComponent;
    let fixture: ComponentFixture<FormTextFieldComponent>;
    let formServiceMock: MockProxy<FormService>;

    const prefixMock = 'prefix';

    beforeEach(async () => {
        formServiceMock = mock<FormService>();
        formServiceMock.getSectionGroup.mockReturnValue(new FormGroup({}));
        formServiceMock.getFieldControl.mockReturnValue(new FormControl());
        formServiceMock.getFieldPrefix.mockReturnValue(prefixMock);

        await TestBed.configureTestingModule({
            imports: [FormTextFieldComponent, TranslateModule.forRoot()],
            providers: [{ provide: FormService, useValue: formServiceMock }]
        }).compileComponents();

        fixture = TestBed.createComponent(FormTextFieldComponent);
        component = fixture.componentInstance;

        component.formConfig = {} as FormConfig;
        component.section = {} as FormSection;
        component.field = {} as FormTextField;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getPlaceholder', () => {
        // Act
        const result = component.getPlaceholder();

        // Assert
        expect(result).toBe(`${prefixMock}.placeholder`);
    });
});
