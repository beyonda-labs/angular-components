import { inject, Injectable } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { map, Observable, take } from 'rxjs';

import { ModalService } from '../../../../modal/services/modal.service';
import { ModalFormDialogComponent } from '../internal/modal-form-dialog.component';
import {
    MODAL_FORM_CLOSE_CONFIRMATION_MESSAGE,
    MODAL_FORM_CLOSE_CONFIRMATION_TITLE,
    ModalFormConfig
} from '../models/modal-form.model';

interface OpenModalForm {
    config: ModalFormConfig;
    reference: BsModalRef<ModalFormDialogComponent>;
}

@Injectable({
    providedIn: 'root'
})
export class ModalFormService {
    private readonly bsModalService = inject(BsModalService);
    private readonly modalService = inject(ModalService);

    private openModalForms: OpenModalForm[] = [];

    canDeactivate(): Observable<boolean> | boolean {
        if (this.openModalForms.length === 0) {
            return true;
        }

        if (!this.hasDirtyForm()) {
            this.closeAll();

            return true;
        }

        return this.modalService
            .openConfirmation({
                message: MODAL_FORM_CLOSE_CONFIRMATION_MESSAGE,
                title: MODAL_FORM_CLOSE_CONFIRMATION_TITLE
            })
            .pipe(
                map(confirmed => {
                    if (confirmed) {
                        this.closeAll();
                    }

                    return confirmed;
                })
            );
    }

    open<TValue>(config: ModalFormConfig<TValue>): BsModalRef<ModalFormDialogComponent> {
        const modalOptions: ModalOptions<ModalFormDialogComponent> = {
            animated: true,
            class: `modal-dialog-centered ${config.size}`.trim(),
            ignoreBackdropClick: true,
            initialState: { config: config as ModalFormConfig },
            keyboard: false
        };

        const reference = this.bsModalService.show(ModalFormDialogComponent, modalOptions);
        const openModalForm: OpenModalForm = { config: config as ModalFormConfig, reference };

        this.openModalForms = [...this.openModalForms, openModalForm];

        reference.onHidden?.pipe(take(1)).subscribe(() => {
            this.openModalForms = this.openModalForms.filter(current => current !== openModalForm);
        });

        return reference;
    }

    private closeAll(): void {
        this.openModalForms.forEach(current => current.reference.hide());
        this.openModalForms = [];
    }

    private hasDirtyForm(): boolean {
        return this.openModalForms.some(current => current.config.isDirty());
    }
}
