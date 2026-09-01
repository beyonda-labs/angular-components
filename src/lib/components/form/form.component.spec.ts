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

    it('should never disable buttons with a custom action', () => {
        component.config = new FormConfig({
            i18nPrefix: 'test.form',
            sections: []
        });

        const buttonConfig = component.getFormButton(
            new FormButton({ action: () => {}, label: 'cancel', type: FormButtonType.Cancel })
        );

        expect(buttonConfig.isDisabled).toBe(false);
    });

    describe('submit button', () => {
        it('should disable it while the form is pristine, even when valid', () => {
            component.config = new FormConfig({
                i18nPrefix: 'test.form',
                sections: []
            });

            const buttonConfig = component.getFormButton(new FormButton({ label: 'submit', type: FormButtonType.Submit }));

            expect(buttonConfig.isDisabled).toBe(true);
            expect(buttonConfig.tooltip).toBe('angular-components.form.submit.without-changes');
        });

        it('should enable it once the form is dirty and valid', () => {
            component.config = new FormConfig({
                i18nPrefix: 'test.form',
                sections: []
            });
            component.config.formGroup?.markAsDirty();

            const button = new FormButton({ label: 'submit', tooltip: 'custom', type: FormButtonType.Submit });
            const buttonConfig = component.getFormButton(button);

            expect(buttonConfig.isDisabled).toBe(false);
            expect(buttonConfig.tooltip).toBe('custom');
        });

        it('should keep it disabled with the invalid tooltip when dirty but invalid', () => {
            formServiceMock.initFieldControl.mockReturnValue(new FormControl('', { validators: () => ({ required: true }) }));

            component.config = new FormConfig({
                i18nPrefix: 'test.form',
                sections: [
                    new FormSection({
                        key: 'section1',
                        rows: [new FormRow({ fields: [new FormTextField({ isRequired: true, key: 'text1' })] })]
                    })
                ]
            });
            component.config.formGroup?.markAsDirty();

            const buttonConfig = component.getFormButton(new FormButton({ label: 'submit', type: FormButtonType.Submit }));

            expect(buttonConfig.isDisabled).toBe(true);
            expect(buttonConfig.tooltip).toBe('angular-components.form.submit.invalid');
        });

        it('should enable it while pristine when allowSubmitWithoutChanges is set', () => {
            component.config = new FormConfig({
                allowSubmitWithoutChanges: true,
                i18nPrefix: 'test.form',
                sections: []
            });

            const button = new FormButton({ label: 'submit', tooltip: 'custom', type: FormButtonType.Submit });
            const buttonConfig = component.getFormButton(button);

            expect(buttonConfig.isDisabled).toBe(false);
            expect(buttonConfig.tooltip).toBe('custom');
        });

        it('should still block submit when invalid even with allowSubmitWithoutChanges set', () => {
            formServiceMock.initFieldControl.mockReturnValue(new FormControl('', { validators: () => ({ required: true }) }));

            component.config = new FormConfig({
                allowSubmitWithoutChanges: true,
                i18nPrefix: 'test.form',
                sections: [
                    new FormSection({
                        key: 'section1',
                        rows: [new FormRow({ fields: [new FormTextField({ isRequired: true, key: 'text1' })] })]
                    })
                ]
            });

            const buttonConfig = component.getFormButton(new FormButton({ label: 'submit', type: FormButtonType.Submit }));

            expect(buttonConfig.isDisabled).toBe(true);
            expect(buttonConfig.tooltip).toBe('angular-components.form.submit.invalid');
        });
    });
});
