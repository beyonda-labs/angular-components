import { Component, inject, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPenToSquare, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { ModalService } from '../../../../modal/services/modal.service';
import { FormComponent } from '../../../form.component';
import {
    MODAL_FORM_CLOSE_CONFIRMATION_MESSAGE,
    MODAL_FORM_CLOSE_CONFIRMATION_TITLE,
    ModalFormConfig
} from '../models/modal-form.model';

@Component({
    imports: [FontAwesomeModule, FormComponent, TranslateModule],
    selector: 'bey-modal-form-dialog',
    standalone: true,
    styleUrls: ['./modal-form-dialog.component.css'],
    templateUrl: './modal-form-dialog.component.html'
})
export class ModalFormDialogComponent implements OnInit {
    config!: ModalFormConfig;

    private readonly bsModalReference: BsModalRef<ModalFormDialogComponent> = inject(BsModalRef);
    private readonly modalService = inject(ModalService);

    ngOnInit(): void {
        this.bindModalActions();
    }

    dismiss(): void {
        this.requestClose();
    }

    getIcon(): IconDefinition {
        return faPenToSquare;
    }

    getTitle(): string {
        return this.config.getTitle();
    }

    getTypeLabel(): string {
        return 'angular-components.form.modal.type';
    }

    private bindModalActions(): void {
        this.config.closeHandler = () => this.bsModalReference.hide();
        this.config.closeRequestHandler = () => this.requestClose();
    }

    private requestClose(): void {
        if (!this.config.isDirty()) {
            this.bsModalReference.hide();

            return;
        }

        this.modalService
            .openConfirmation({
                message: MODAL_FORM_CLOSE_CONFIRMATION_MESSAGE,
                title: MODAL_FORM_CLOSE_CONFIRMATION_TITLE
            })
            .subscribe(confirmed => {
                if (confirmed) {
                    this.bsModalReference.hide();
                }
            });
    }
}
