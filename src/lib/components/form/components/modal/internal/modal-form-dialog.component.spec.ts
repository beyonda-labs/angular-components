import { ComponentFixture, TestBed } from '@angular/core/testing';
import { buttonByName, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { FormTextField } from '../../../models/fields/form-text-field.model';
import { FormRow, FormSection } from '../../../models/form.model';
import { ModalFormConfig } from '../models/modal-form.model';
import { ModalFormDialogComponent } from './modal-form-dialog.component';

describe('ModalFormDialogComponent', () => {
    let fixture: ComponentFixture<ModalFormDialogComponent>;
    let modal: FakeModalService;
    const hide = jest.fn();

    async function type(value: string): Promise<void> {
        const input = fixture.nativeElement.querySelector('#name') as HTMLInputElement;

        input.value = value;
        input.dispatchEvent(new Event('input'));
        await settle(fixture);
    }

    beforeEach(async () => {
        hide.mockReset();

        await TestBed.configureTestingModule({
            imports: [ModalFormDialogComponent],
            providers: [provideBeyTesting(), { provide: BsModalRef, useValue: { hide } }]
        }).compileComponents();

        modal = TestBed.inject(FakeModalService);

        fixture = TestBed.createComponent(ModalFormDialogComponent);
        fixture.componentInstance.config = new ModalFormConfig({
            onSubmit: (_value, handle) => handle.close(),
            prefix: 'demo.modal-form',
            sections: [
                new FormSection({
                    key: 'contact',
                    rows: [new FormRow({ fields: [new FormTextField({ key: 'name' })] })]
                })
            ]
        });
        await settle(fixture);
    });

    it('shows the title and the form', () => {
        expect(fixture.nativeElement.textContent).toContain('demo.modal-form.title');
        expect(fixture.nativeElement.querySelector('#name')).not.toBeNull();
    });

    it('closes straight away while the form has no changes', () => {
        buttonByName(fixture, 'demo.modal-form.buttons.cancel').click();

        expect(modal.confirmations()).toEqual([]);
        expect(hide).toHaveBeenCalled();
    });

    it('asks before closing a changed form, from the cancel button or the cross', async () => {
        await type('Ada');

        buttonByName(fixture, 'demo.modal-form.buttons.cancel').click();
        expect(hide).not.toHaveBeenCalled();

        modal.setConfirmationAnswer(true);
        buttonByName(fixture, 'angular-components.modal.actions.close').click();
        expect(hide).toHaveBeenCalled();
        expect(modal.confirmations()).toHaveLength(2);
    });

    it('lets the submit callback close the dialog through the handle', async () => {
        await type('Ada');

        buttonByName(fixture, 'demo.modal-form.buttons.submit').click();

        expect(modal.confirmations()).toEqual([]);
        expect(hide).toHaveBeenCalled();
    });
});
