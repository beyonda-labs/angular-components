import { ChangeDetectionStrategy, Component, forwardRef, inject, viewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { ModalService } from '../../../../modal/services/modal.service';
import { FormComponent } from '../../../form.component';
import { FORM_HOST, FormHost } from '../../../models/form-host.model';
import {
    MODAL_FORM_CLOSE_CONFIRMATION_MESSAGE,
    MODAL_FORM_CLOSE_CONFIRMATION_TITLE,
    ModalFormConfig
} from '../models/modal-form.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, FormComponent, TranslateModule],
    providers: [{ provide: FORM_HOST, useExisting: forwardRef(() => ModalFormDialogComponent) }],
    selector: 'bey-modal-form-dialog',
    standalone: true,
    styleUrls: ['./modal-form-dialog.component.css'],
    templateUrl: './modal-form-dialog.component.html'
})
export class ModalFormDialogComponent implements FormHost {
    private readonly bsModalReference: BsModalRef<ModalFormDialogComponent> = inject(BsModalRef);
    private readonly modalService = inject(ModalService);

    config!: ModalFormConfig;
    readonly icon = faPenToSquare;
    readonly typeLabel = 'angular-components.form.modal.type';

    private readonly form = viewChild(FormComponent);

    close(): void {
        this.bsModalReference.hide();
    }

    isDirty(): boolean {
        return this.form()?.handle.isDirty() ?? false;
    }

    requestClose(): void {
        if (!this.isDirty()) {
            this.close();

            return;
        }

        this.modalService
            .openConfirmation({
                message: MODAL_FORM_CLOSE_CONFIRMATION_MESSAGE,
                title: MODAL_FORM_CLOSE_CONFIRMATION_TITLE
            })
            .subscribe(confirmed => {
                if (confirmed) {
                    this.close();
                }
            });
    }
}
