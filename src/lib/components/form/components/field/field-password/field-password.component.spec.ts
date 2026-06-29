import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { mock, MockProxy } from 'jest-mock-extended';

import { FormPasswordField } from '../../../models/fields/form-password-field.model';
import { FormConfig, FormSection } from '../../../models/form.model';
import { FormService } from '../../../services/form.service';
import { FormPasswordFieldComponent } from './field-password.component';

describe('FormPasswordFieldComponent', () => {
    let component: FormPasswordFieldComponent;
    let fixture: ComponentFixture<FormPasswordFieldComponent>;
    let formServiceMock: MockProxy<FormService>;

    beforeEach(async () => {
        formServiceMock = mock<FormService>();
        formServiceMock.getSectionGroup.mockReturnValue(new FormGroup({}));
        formServiceMock.getFieldControl.mockReturnValue(new FormControl(''));
        formServiceMock.getFieldPrefix.mockReturnValue('prefix');

        await TestBed.configureTestingModule({
            imports: [FormPasswordFieldComponent, TranslateModule.forRoot()],
            providers: [{ provide: FormService, useValue: formServiceMock }]
        }).compileComponents();

        fixture = TestBed.createComponent(FormPasswordFieldComponent);
        component = fixture.componentInstance;

        component.formConfig = {} as FormConfig;
        component.section = { key: 'section1' } as FormSection;
        component.field = new FormPasswordField({ key: 'password1' });

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getPlaceholder should return translated key', () => {
        expect(component.getPlaceholder()).toBe('prefix.placeholder');
    });

    it('should start with password hidden', () => {
        expect(component.isVisible).toBe(false);
    });

    it('toggleVisibility should switch isVisible', () => {
        component.toggleVisibility();
        expect(component.isVisible).toBe(true);

        component.toggleVisibility();
        expect(component.isVisible).toBe(false);
    });
});
