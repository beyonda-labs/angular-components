import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { mock, MockProxy } from 'jest-mock-extended';

import { FormSelectField } from '../../../models/fields/form-select-field.model';
import { FormConfig, FormSection } from '../../../models/form.model';
import { FormService } from '../../../services/form.service';
import { FormSelectFieldComponent } from './field-select.component';

describe('FormSelectFieldComponent', () => {
    let component: FormSelectFieldComponent;
    let fixture: ComponentFixture<FormSelectFieldComponent>;
    let formServiceMock: MockProxy<FormService>;

    beforeEach(async () => {
        formServiceMock = mock<FormService>();
        formServiceMock.getSectionGroup.mockReturnValue(new FormGroup({}));
        formServiceMock.getFieldControl.mockReturnValue(new FormControl(''));
        formServiceMock.getFieldPrefix.mockReturnValue('prefix');

        await TestBed.configureTestingModule({
            imports: [FormSelectFieldComponent, TranslateModule.forRoot()],
            providers: [{ provide: FormService, useValue: formServiceMock }]
        }).compileComponents();

        fixture = TestBed.createComponent(FormSelectFieldComponent);
        component = fixture.componentInstance;

        component.formConfig = {} as FormConfig;
        component.section = { key: 'section1' } as FormSection;
        component.field = new FormSelectField({
            key: 'select1',
            options: []
        });

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getPlaceholder should return translated key', () => {
        expect(component.getPlaceholder()).toBe('prefix.placeholder');
    });
});
