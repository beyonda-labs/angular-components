import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { mock, MockProxy } from 'jest-mock-extended';

import { FormRadioField } from '../../../models/fields/form-radio-field.model';
import { FormConfig, FormSection } from '../../../models/form.model';
import { FormService } from '../../../services/form.service';
import { FormRadioFieldComponent } from './field-radio.component';

describe('FormRadioFieldComponent', () => {
    let component: FormRadioFieldComponent;
    let fixture: ComponentFixture<FormRadioFieldComponent>;
    let formServiceMock: MockProxy<FormService>;

    beforeEach(async () => {
        formServiceMock = mock<FormService>();
        formServiceMock.getSectionGroup.mockReturnValue(new FormGroup({}));
        formServiceMock.getFieldControl.mockReturnValue(new FormControl(''));

        await TestBed.configureTestingModule({
            imports: [FormRadioFieldComponent, TranslateModule.forRoot()],
            providers: [{ provide: FormService, useValue: formServiceMock }]
        }).compileComponents();

        fixture = TestBed.createComponent(FormRadioFieldComponent);
        component = fixture.componentInstance;

        component.formConfig = {} as FormConfig;
        component.section = { key: 'section1' } as FormSection;
        component.field = new FormRadioField({
            key: 'radio1',
            options: []
        });

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('isInvalid should return false if control untouched', () => {
        expect(component.isInvalid()).toBe(false);
    });
});
