import { TestBed } from '@angular/core/testing';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable, of } from 'rxjs';

import { ModalService } from '../../../../modal/services/modal.service';
import { FormTextField } from '../../../models/fields/form-text-field.model';
import { FormRow, FormSection } from '../../../models/form.model';
import { ModalFormDialogComponent } from '../internal/modal-form-dialog.component';
import { ModalFormConfig, ModalFormSize } from '../models/modal-form.model';
import { ModalFormService } from './modal-form.service';

describe('ModalFormService', () => {
    let service: ModalFormService;
    const show = jest.fn();
    const openConfirmation = jest.fn();

    function buildConfig(size?: ModalFormSize): ModalFormConfig {
        return new ModalFormConfig({
            prefix: 'demo.modal-form',
            sections: [
                new FormSection({
                    key: 'contact',
                    rows: [new FormRow({ fields: [new FormTextField({ key: 'name' })] })]
                })
            ],
            size
        });
    }

    function buildReference(isDirty = false): BsModalRef<ModalFormDialogComponent> {
        return {
            content: { isDirty: () => isDirty },
            hide: jest.fn()
        } as unknown as BsModalRef<ModalFormDialogComponent>;
    }

    beforeEach(() => {
        show.mockReset();
        openConfirmation.mockReset();

        TestBed.configureTestingModule({
            providers: [
                { provide: BsModalService, useValue: { show } },
                { provide: ModalService, useValue: { openConfirmation } }
            ]
        });

        service = TestBed.inject(ModalFormService);
    });

    it('opens the dialog centred, sized by the config and immune to the backdrop and Escape', () => {
        const reference = buildReference();
        show.mockReturnValue(reference);
        const config = buildConfig(ModalFormSize.Small);

        expect(service.open(config)).toBe(reference);
        expect(show).toHaveBeenCalledWith(ModalFormDialogComponent, {
            animated: true,
            class: 'modal-dialog-centered modal-sm',
            ignoreBackdropClick: true,
            initialState: { config },
            keyboard: false
        });
    });

    it('lets navigation through, closing the open forms, while none of them has changes', () => {
        const reference = buildReference();
        show.mockReturnValue(reference);

        expect(service.canDeactivate()).toBe(true);

        service.open(buildConfig());

        expect(service.canDeactivate()).toBe(true);
        expect(reference.hide).toHaveBeenCalled();
        expect(openConfirmation).not.toHaveBeenCalled();
    });

    it('asks before navigating away from a changed form, and only closes it when confirmed', done => {
        const reference = buildReference(true);
        show.mockReturnValue(reference);
        openConfirmation.mockReturnValueOnce(of(false)).mockReturnValueOnce(of(true));
        service.open(buildConfig());

        (service.canDeactivate() as Observable<boolean>).subscribe(rejected => {
            expect(rejected).toBe(false);
            expect(reference.hide).not.toHaveBeenCalled();

            (service.canDeactivate() as Observable<boolean>).subscribe(confirmed => {
                expect(confirmed).toBe(true);
                expect(reference.hide).toHaveBeenCalled();
                done();
            });
        });
    });
});
