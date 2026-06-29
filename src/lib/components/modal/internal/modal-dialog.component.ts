import { Component, OnDestroy } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
    faCircleInfo,
    faCircleQuestion,
    faCircleXmark,
    faTriangleExclamation,
    IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ReplaySubject } from 'rxjs';

import { ButtonComponent } from '../../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../../internal/button/models/button-config.model';
import { InternalModalConfig, ModalType } from '../models/modal.model';

@Component({
    imports: [ButtonComponent, FontAwesomeModule, TranslateModule],
    selector: 'bey-modal-dialog',
    standalone: true,
    styleUrls: ['./modal-dialog.component.css'],
    templateUrl: './modal-dialog.component.html'
})
export class ModalDialogComponent implements OnDestroy {
    config!: InternalModalConfig;
    result = false;

    readonly closed = new ReplaySubject<boolean>(1);

    private resolved = false;

    constructor(private readonly bsModalReference: BsModalRef<ModalDialogComponent>) {}

    ngOnDestroy(): void {
        if (!this.resolved) {
            this.resolve(this.isConfirmation() ? false : true, false);
        }
    }

    dismiss(): void {
        this.resolve(this.isConfirmation() ? false : true);
    }

    getIcon(): IconDefinition {
        switch (this.config.type) {
            case ModalType.Error:
                return faCircleXmark;
            case ModalType.Warning:
                return faTriangleExclamation;
            case ModalType.Confirmation:
                return faCircleQuestion;
            case ModalType.Info:
            default:
                return faCircleInfo;
        }
    }

    getPrimaryButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.onPrimaryAction(),
            label: this.config.primaryActionLabel,
            type: ButtonType.Primary
        });
    }

    getTypeLabel(): string {
        return `angular-components.modal.types.${this.config.type}`;
    }

    getSecondaryButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.onSecondaryAction(),
            label: this.getSecondaryActionLabel(),
            type: ButtonType.Secondary
        });
    }

    hasSecondaryAction(): boolean {
        return this.isConfirmation() && Boolean(this.config.secondaryActionLabel);
    }

    getSecondaryActionLabel(): string {
        return this.config.secondaryActionLabel ?? '';
    }

    onPrimaryAction(): void {
        this.resolve(true);
    }

    onSecondaryAction(): void {
        this.resolve(false);
    }

    private isConfirmation(): boolean {
        return this.config.type === ModalType.Confirmation;
    }

    private resolve(value: boolean, hide = true): void {
        if (this.resolved) {
            return;
        }

        this.resolved = true;
        this.result = value;
        this.closed.next(value);
        this.closed.complete();

        if (hide) {
            this.bsModalReference.hide();
        }
    }
}
