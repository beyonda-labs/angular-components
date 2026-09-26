import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BeyModalService } from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

import { StyleGuideButton } from '../models/style-guide-button.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule],
    selector: 'bey-modal-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css', './modal-style-guide.component.css'],
    templateUrl: './modal-style-guide.component.html'
})
export class ModalStyleGuideComponent {
    private readonly modalService = inject(BeyModalService);

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

    get warningButton(): StyleGuideButton {
        return {
            action: () => this.openWarning(),
            label: 'angular-components-style-guide.modal.buttons.warning'
        };
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

    openWarning(): void {
        this.modalService.openWarning({
            message: 'angular-components-style-guide.modal.examples.warning.message',
            title: 'angular-components-style-guide.modal.examples.warning.title'
        });
    }
}
