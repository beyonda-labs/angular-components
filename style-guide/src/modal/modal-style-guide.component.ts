import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BeyModalFormService, BeyModalService, BeyUnsavedChangesService } from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';
import { isObservable, of } from 'rxjs';

import { StyleGuideButton } from '../models/style-guide-button.model';
import { buildLongForm, LONG_FORM_PREFIX } from './modal-style-guide.long-form';

const UNSAVED_CHANGES = 'angular-components-style-guide.modal.unsaved-changes';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule],
    selector: 'bey-modal-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css', './modal-style-guide.component.css'],
    templateUrl: './modal-style-guide.component.html'
})
export class ModalStyleGuideComponent {
    private readonly modalFormService = inject(BeyModalFormService);
    private readonly modalService = inject(BeyModalService);
    private readonly unsavedChangesService = inject(BeyUnsavedChangesService);

    readonly hasChanges = signal(false);
    readonly isLongFormSent = signal(false);
    readonly longFormButton: StyleGuideButton = {
        action: () => this.openLongForm(),
        label: `${LONG_FORM_PREFIX}.open`
    };

    constructor() {
        this.unsavedChangesService.track(this.hasChanges);
    }

    get confirmationButton(): StyleGuideButton {
        return {
            action: () => this.openConfirmation(),
            label: 'angular-components-style-guide.modal.buttons.confirmation'
        };
    }

    get errorButton(): StyleGuideButton {
        return {
            action: () => this.openError(),
            label: 'angular-components-style-guide.modal.buttons.error'
        };
    }

    get infoButton(): StyleGuideButton {
        return {
            action: () => this.openInfo(),
            isPrimary: true,
            label: 'angular-components-style-guide.modal.buttons.info'
        };
    }

    leave(): void {
        const answer = this.unsavedChangesService.canDeactivate();

        (isObservable(answer) ? answer : of(answer)).subscribe(hasLeft => {
            const outcome = hasLeft ? 'left' : 'stayed';

            this.modalService.openInfo({
                message: `${UNSAVED_CHANGES}.${outcome}.message`,
                title: `${UNSAVED_CHANGES}.${outcome}.title`
            });
        });
    }

    openConfirmation(): void {
        this.modalService
            .openConfirmation({
                message: 'angular-components-style-guide.modal.examples.confirmation.message',
                title: 'angular-components-style-guide.modal.examples.confirmation.title'
            })
            .subscribe(confirmed => {
                if (confirmed) {
                    this.modalService.openInfo({
                        message: 'angular-components-style-guide.modal.feedback.confirmed.message',
                        title: 'angular-components-style-guide.modal.feedback.confirmed.title'
                    });

                    return;
                }

                this.modalService.openWarning({
                    message: 'angular-components-style-guide.modal.feedback.canceled.message',
                    title: 'angular-components-style-guide.modal.feedback.canceled.title'
                });
            });
    }

    openError(): void {
        this.modalService.openError({
            message: 'angular-components-style-guide.modal.examples.error.message',
            title: 'angular-components-style-guide.modal.examples.error.title'
        });
    }

    openInfo(): void {
        this.modalService.openInfo({
            message: 'angular-components-style-guide.modal.examples.info.message',
            title: 'angular-components-style-guide.modal.examples.info.title'
        });
    }

    openLongForm(): void {
        this.modalFormService.open(buildLongForm(() => this.isLongFormSent.set(true)));
    }

    openWarning(): void {
        this.modalService.openWarning({
            message: 'angular-components-style-guide.modal.examples.warning.message',
            title: 'angular-components-style-guide.modal.examples.warning.title'
        });
    }

    toggleChanges(): void {
        this.hasChanges.update(hasChanges => !hasChanges);
    }

    get warningButton(): StyleGuideButton {
        return {
            action: () => this.openWarning(),
            label: 'angular-components-style-guide.modal.buttons.warning'
        };
    }
}
