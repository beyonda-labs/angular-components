import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
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

    beforeEach(() => {
        show.mockReset();
        openConfirmation.mockReset();

        TestBed.configureTestingModule({
            providers: [
                ModalFormService,
                {
                    provide: BsModalService,
                    useValue: { show }
                },
                {
                    provide: ModalService,
                    useValue: { openConfirmation }
                }
            ]
        });

        service = TestBed.inject(ModalFormService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should open the modal form dialog with the provided config', () => {
        const modalReference = buildModalReference();
        show.mockReturnValue(modalReference);

        const config = buildConfig();
        const result = service.open(config);

        expect(result).toBe(modalReference);
        expect(show).toHaveBeenCalledWith(
            ModalFormDialogComponent,
            expect.objectContaining({
                class: 'modal-dialog-centered modal-lg',
                ignoreBackdropClick: true,
                initialState: { config },
                keyboard: false
            })
        );
    });

    it('should apply the configured size to the modal class', () => {
        show.mockReturnValue(buildModalReference());

        service.open(buildConfig(ModalFormSize.Small));

        expect(show).toHaveBeenCalledWith(
            ModalFormDialogComponent,
            expect.objectContaining({ class: 'modal-dialog-centered modal-sm' })
        );
    });

    it('should allow deactivation when there is no open modal form', () => {
        expect(service.canDeactivate()).toBe(true);
    });

    it('should close pristine modal forms and allow deactivation', () => {
        const modalReference = buildModalReference();
        show.mockReturnValue(modalReference);

        service.open(buildConfig());

        expect(service.canDeactivate()).toBe(true);
        expect(modalReference.hide).toHaveBeenCalled();
        expect(openConfirmation).not.toHaveBeenCalled();
    });

    it('should ask for confirmation and close dirty modal forms when confirmed', done => {
        openConfirmation.mockReturnValue(of(true));
        const modalReference = buildModalReference();
        show.mockReturnValue(modalReference);

        const config = buildConfig();
        service.open(config);
        markAsDirty(config);

        const result = service.canDeactivate() as Observable<boolean>;

        result.subscribe(allowed => {
            expect(allowed).toBe(true);
            expect(openConfirmation).toHaveBeenCalled();
            expect(modalReference.hide).toHaveBeenCalled();
            done();
        });
    });

    it('should block deactivation and keep dirty modal forms open when rejected', done => {
        openConfirmation.mockReturnValue(of(false));
        const modalReference = buildModalReference();
        show.mockReturnValue(modalReference);

        const config = buildConfig();
        service.open(config);
        markAsDirty(config);

        const result = service.canDeactivate() as Observable<boolean>;

        result.subscribe(allowed => {
            expect(allowed).toBe(false);
            expect(modalReference.hide).not.toHaveBeenCalled();
            done();
        });
    });
});

function buildConfig(size?: ModalFormSize): ModalFormConfig {
    return new ModalFormConfig({
        i18nPrefix: 'test.modal-form',
        sections: [
            new FormSection({
                key: 'section1',
                rows: [new FormRow({ fields: [new FormTextField({ key: 'text1' })] })]
            })
        ],
        size
    });
}

function buildModalReference(): BsModalRef<ModalFormDialogComponent> {
    return { hide: jest.fn() } as unknown as BsModalRef<ModalFormDialogComponent>;
}

function markAsDirty(config: ModalFormConfig): void {
    const formGroup = new FormGroup({});

    formGroup.markAsDirty();
    config.formGroup = formGroup;
}
