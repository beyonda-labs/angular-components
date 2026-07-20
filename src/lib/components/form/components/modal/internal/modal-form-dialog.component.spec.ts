import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';

import { ModalService } from '../../../../modal/services/modal.service';
import { FormTextField } from '../../../models/fields/form-text-field.model';
import { FormRow, FormSection } from '../../../models/form.model';
import { ModalFormConfig } from '../models/modal-form.model';
import { ModalFormDialogComponent } from './modal-form-dialog.component';

describe('ModalFormDialogComponent', () => {
    let component: ModalFormDialogComponent;
    let fixture: ComponentFixture<ModalFormDialogComponent>;

    const hide = jest.fn();
    const openConfirmation = jest.fn();

    beforeEach(async () => {
        hide.mockReset();
        openConfirmation.mockReset();

        await TestBed.configureTestingModule({
            imports: [ModalFormDialogComponent, TranslateModule.forRoot()],
            providers: [
                { provide: BsModalRef, useValue: { hide } },
                { provide: ModalService, useValue: { openConfirmation } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ModalFormDialogComponent);
        component = fixture.componentInstance;
        component.config = buildConfig();

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render the form inside the modal', () => {
        const form = fixture.nativeElement.querySelector('bey-form');

        expect(form).toBeTruthy();
    });

    it('should expose the title key built from the i18n prefix', () => {
        expect(component.getTitle()).toBe('test.modal-form.title');
    });

    it('should hide the modal on dismiss when the form has no changes', () => {
        component.dismiss();

        expect(openConfirmation).not.toHaveBeenCalled();
        expect(hide).toHaveBeenCalled();
    });

    it('should ask for confirmation on dismiss when the form has changes and hide when confirmed', () => {
        openConfirmation.mockReturnValue(of(true));
        component.config.formGroup?.markAsDirty();

        component.dismiss();

        expect(openConfirmation).toHaveBeenCalled();
        expect(hide).toHaveBeenCalled();
    });

    it('should keep the modal open when the close confirmation is rejected', () => {
        openConfirmation.mockReturnValue(of(false));
        component.config.formGroup?.markAsDirty();

        component.dismiss();

        expect(openConfirmation).toHaveBeenCalled();
        expect(hide).not.toHaveBeenCalled();
    });

    it('should request a guarded close when the cancel button is clicked', () => {
        component.config.buttons[0].action?.();

        expect(hide).toHaveBeenCalled();
    });

    it('should not hide the modal on submit', () => {
        const onSubmit = jest.fn();
        const config = buildConfig(onSubmit);

        component.config = config;
        component.ngOnInit();

        const currentValue = { section1: { text1: 'value' } };
        config.onSubmit?.(currentValue, config);

        expect(onSubmit).toHaveBeenCalledWith(currentValue, config);
        expect(hide).not.toHaveBeenCalled();
    });

    it('should hide the modal when the config close method is called', () => {
        component.config.close();

        expect(hide).toHaveBeenCalled();
    });
});

function buildConfig(onSubmit?: (currentValue: unknown, form: ModalFormConfig) => void): ModalFormConfig {
    return new ModalFormConfig({
        i18nPrefix: 'test.modal-form',
        onSubmit,
        sections: [
            new FormSection({
                key: 'section1',
                rows: [new FormRow({ fields: [new FormTextField({ key: 'text1' })] })]
            })
        ]
    });
}
