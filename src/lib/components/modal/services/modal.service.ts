import { inject, Injectable } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { map, Observable, of, take } from 'rxjs';

import { ModalDialogComponent } from '../internal/modal-dialog.component';
import {
    ConfirmationModalConfig,
    InternalModalConfig,
    ModalType,
    NotificationModalConfig
} from '../models/modal.model';

@Injectable({
    providedIn: 'root'
})
export class ModalService {
    static readonly CANCEL_LABEL = 'angular-components.modal.actions.cancel';
    static readonly CLOSE_LABEL = 'angular-components.modal.actions.close';
    static readonly CONFIRM_LABEL = 'angular-components.modal.actions.confirm';

    private readonly bsModalService = inject(BsModalService);

    openConfirmation(config: ConfirmationModalConfig): Observable<boolean> {
        const modalReference = this.open({
            closeOnBackdrop: config.closeOnBackdrop,
            message: config.message,
            messageParameters: config.messageParameters,
            primaryActionLabel: config.confirmLabel ?? ModalService.CONFIRM_LABEL,
            secondaryActionLabel: config.cancelLabel ?? ModalService.CANCEL_LABEL,
            title: config.title,
            type: ModalType.Confirmation
        });

        const { content } = modalReference;

        if (!content || !modalReference.onHidden) {
            return of(false);
        }

        return modalReference.onHidden.pipe(
            take(1),
            map(() => content.result)
        );
    }

    openError(config: NotificationModalConfig): BsModalRef<ModalDialogComponent> {
        return this.openNotification(config, ModalType.Error);
    }

    openInfo(config: NotificationModalConfig): BsModalRef<ModalDialogComponent> {
        return this.openNotification(config, ModalType.Info);
    }

    openWarning(config: NotificationModalConfig): BsModalRef<ModalDialogComponent> {
        return this.openNotification(config, ModalType.Warning);
    }

    private open(config: InternalModalConfig): BsModalRef<ModalDialogComponent> {
        const modalOptions: ModalOptions<ModalDialogComponent> = {
            animated: true,
            class: 'modal-dialog-centered',
            ignoreBackdropClick: config.closeOnBackdrop === false,
            initialState: { config },
            keyboard: config.closeOnBackdrop !== false
        };

        return this.bsModalService.show(ModalDialogComponent, modalOptions);
    }

    private openNotification(config: NotificationModalConfig, type: ModalType): BsModalRef<ModalDialogComponent> {
        return this.open({
            closeOnBackdrop: config.closeOnBackdrop,
            message: config.message,
            messageParameters: config.messageParameters,
            primaryActionLabel: config.closeLabel ?? ModalService.CLOSE_LABEL,
            title: config.title,
            type
        });
    }
}
