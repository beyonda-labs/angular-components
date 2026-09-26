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
    let fixture: ComponentFixture<ModalFormDialogComponent>;
    const hide = jest.fn();
    const openConfirmation = jest.fn();

    async function settle(): Promise<void> {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    async function type(value: string): Promise<void> {
        const input = fixture.nativeElement.querySelector('#name') as HTMLInputElement;

        input.value = value;
        input.dispatchEvent(new Event('input'));
        await settle();
    }

    function button(label: string): HTMLButtonElement {
        const found = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button')].find(
            element => element.textContent?.includes(label)
        );

        if (!found) {
            throw new Error(`No button ${label}`);
        }

        return found;
    }

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
        await settle();
    });

    it('shows the title and the form', () => {
        expect(fixture.nativeElement.textContent).toContain('demo.modal-form.title');
        expect(fixture.nativeElement.querySelector('#name')).not.toBeNull();
    });

    it('closes straight away while the form has no changes', () => {
        button('demo.modal-form.buttons.cancel').click();

        expect(openConfirmation).not.toHaveBeenCalled();
        expect(hide).toHaveBeenCalled();
    });

    it('asks before closing a changed form, from the cancel button or the cross', async () => {
        openConfirmation.mockReturnValueOnce(of(false)).mockReturnValueOnce(of(true));
        await type('Ada');

        button('demo.modal-form.buttons.cancel').click();
        expect(hide).not.toHaveBeenCalled();

        (
            fixture.nativeElement.querySelector(
                '[aria-label="angular-components.modal.actions.close"]'
            ) as HTMLButtonElement
        ).click();
        expect(hide).toHaveBeenCalled();
    });

    it('lets the submit callback close the dialog through the handle', async () => {
        await type('Ada');

        button('demo.modal-form.buttons.submit').click();

        expect(openConfirmation).not.toHaveBeenCalled();
        expect(hide).toHaveBeenCalled();
    });
});
