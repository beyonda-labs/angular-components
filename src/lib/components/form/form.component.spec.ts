import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { mock, MockProxy } from 'jest-mock-extended';

import { FormComponent } from './form.component';
import { FormTextField } from './models/fields/form-text-field.model';
import { FormButton, FormButtonType, FormConfig, FormRow, FormSection } from './models/form.model';
import { FormService } from './services/form.service';

describe('FormComponent', () => {
    let component: FormComponent;
    let fixture: ComponentFixture<FormComponent>;
    let formServiceMock: MockProxy<FormService>;

    beforeEach(async () => {
        formServiceMock = mock<FormService>();
        formServiceMock.initFieldControl.mockReturnValue(new FormControl(''));

        await TestBed.configureTestingModule({
            imports: [FormComponent, TranslateModule.forRoot()],
            providers: [{ provide: FormService, useValue: formServiceMock }]
        }).compileComponents();

        fixture = TestBed.createComponent(FormComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should build form when config is set', () => {
        component.config = new FormConfig({
            i18nPrefix: 'test.form',
            sections: [
                new FormSection({
                    key: 'section1',
                    rows: [
                        new FormRow({
                            fields: [new FormTextField({ key: 'text1' })]
                        })
                    ]
                })
            ]
        });

        expect(component.formGroup).toBeTruthy();
        expect(component.config.formGroup).toBeTruthy();
    });

    it('should map submit button type as primary', () => {
        component.config = new FormConfig({
            i18nPrefix: 'test.form',
            sections: [],
            buttons: [new FormButton({ label: 'submit', type: FormButtonType.Submit })]
        });

        const buttonConfig = component.getFormButton(new FormButton({ label: 'submit', type: FormButtonType.Submit }));

        expect(buttonConfig).toBeTruthy();
    });
});
