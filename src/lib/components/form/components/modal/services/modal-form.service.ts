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

@Injectable({
    providedIn: 'root'
})
export class ModalFormService {
    private readonly bsModalService = inject(BsModalService);
    private readonly modalService = inject(ModalService);

    private openDialogs: BsModalRef<ModalFormDialogComponent>[] = [];

    canDeactivate(): Observable<boolean> | boolean {
        if (this.openDialogs.length === 0) {
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

        this.openDialogs = [...this.openDialogs, reference];

        reference.onHidden?.pipe(take(1)).subscribe(() => {
            this.openDialogs = this.openDialogs.filter(current => current !== reference);
        });

        return reference;
    }

    openWithRequest<TValue>(
        config: ModalFormConfig<TValue>,
        submit: (value: TValue) => Observable<unknown>
    ): BsModalRef<ModalFormDialogComponent> {
        return this.open(
            new ModalFormConfig<TValue>({
                ...config,
                onSubmit: (value, handle) =>
                    submit(value)
                        .pipe(take(1))
                        .subscribe(() => handle.close())
            })
        );
    }

    private closeAll(): void {
        this.openDialogs.forEach(reference => reference.hide());
        this.openDialogs = [];
    }

    private hasDirtyForm(): boolean {
        return this.openDialogs.some(reference => reference.content?.isDirty() ?? false);
    }
}
