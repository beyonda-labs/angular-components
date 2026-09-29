import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { EMPTY, Observable, of } from 'rxjs';

import { FormTextField } from '../../../models/fields/form-text-field.model';
import { FormHandle, FormRow, FormSection } from '../../../models/form.model';
import { ModalFormDialogComponent } from '../internal/modal-form-dialog.component';
import { ModalFormConfig, ModalFormSize } from '../models/modal-form.model';
import { ModalFormService } from './modal-form.service';

describe('ModalFormService', () => {
    let modal: FakeModalService;
    let service: ModalFormService;
    const show = jest.fn();

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

        TestBed.configureTestingModule({
            providers: [provideBeyTesting(), ModalFormService, { provide: BsModalService, useValue: { show } }]
        });

        modal = TestBed.inject(FakeModalService);
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

    describe('a form with its own request', () => {
        const close = jest.fn();
        const handle = { close } as unknown as FormHandle;

        function openedConfig(): ModalFormConfig {
            return show.mock.calls[0][1].initialState.config as ModalFormConfig;
        }

        beforeEach(() => {
            close.mockReset();
            show.mockReturnValue(buildReference());
        });

        it('opens the form as it is and sends the submitted value through the request', () => {
            const submit = jest.fn(() => of(null));

            service.openWithRequest(new ModalFormConfig({ ...buildConfig(), submitLabel: 'custom.save' }), submit);
            openedConfig().onSubmit?.({ contact: { name: 'Ada' } }, handle);

            expect(openedConfig().buttons[1].label).toBe('custom.save');
            expect(submit).toHaveBeenCalledWith({ contact: { name: 'Ada' } });
        });

        it('closes the form once the request answers, and keeps it open when it answers nothing', () => {
            service.openWithRequest(buildConfig(), () => of(null));
            openedConfig().onSubmit?.({}, handle);
            show.mockClear();

            service.openWithRequest(buildConfig(), () => EMPTY);
            openedConfig().onSubmit?.({}, handle);

            expect(close).toHaveBeenCalledTimes(1);
        });
    });

    it('lets navigation through, closing the open forms, while none of them has changes', () => {
        const reference = buildReference();
        show.mockReturnValue(reference);

        expect(service.canDeactivate()).toBe(true);

        service.open(buildConfig());

        expect(service.canDeactivate()).toBe(true);
        expect(reference.hide).toHaveBeenCalled();
        expect(modal.confirmations()).toEqual([]);
    });

    it('asks before navigating away from a changed form, and only closes it when confirmed', done => {
        const reference = buildReference(true);
        show.mockReturnValue(reference);
        service.open(buildConfig());

        (service.canDeactivate() as Observable<boolean>).subscribe(rejected => {
            expect(rejected).toBe(false);
            expect(reference.hide).not.toHaveBeenCalled();

            modal.setConfirmationAnswer(true);
            (service.canDeactivate() as Observable<boolean>).subscribe(confirmed => {
                expect(confirmed).toBe(true);
                expect(reference.hide).toHaveBeenCalled();
                done();
            });
        });
    });
});
