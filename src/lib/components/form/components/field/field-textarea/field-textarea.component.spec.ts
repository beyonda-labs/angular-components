import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { mock, MockProxy } from 'jest-mock-extended';

import { FormTextareaField } from '../../../models/fields/form-textarea-field.model';
import { FormConfig, FormSection } from '../../../models/form.model';
import { FormService } from '../../../services/form.service';
import { FormTextareaFieldComponent } from './field-textarea.component';

describe('FormTextareaFieldComponent', () => {
    let component: FormTextareaFieldComponent;
    let fixture: ComponentFixture<FormTextareaFieldComponent>;
    let formServiceMock: MockProxy<FormService>;

    beforeEach(async () => {
        formServiceMock = mock<FormService>();
        formServiceMock.getSectionGroup.mockReturnValue(new FormGroup({}));
        formServiceMock.getFieldControl.mockReturnValue(new FormControl(''));
        formServiceMock.getFieldPrefix.mockReturnValue('prefix');

        await TestBed.configureTestingModule({
            imports: [FormTextareaFieldComponent, TranslateModule.forRoot()],
            providers: [{ provide: FormService, useValue: formServiceMock }]
        }).compileComponents();

        fixture = TestBed.createComponent(FormTextareaFieldComponent);
        component = fixture.componentInstance;

        component.formConfig = {} as FormConfig;
        component.section = { key: 'section1' } as FormSection;
        component.field = { key: 'textarea1', rows: 3 } as FormTextareaField;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getPlaceholder should return translated key', () => {
        expect(component.getPlaceholder()).toBe('prefix.placeholder');
    });
});
