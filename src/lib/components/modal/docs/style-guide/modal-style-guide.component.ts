import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../../../internal/button/models/button-config.model';
import { ModalService } from '../../services/modal.service';

@Component({
    imports: [ButtonComponent, TranslateModule],
    selector: 'bey-modal-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide.component.css', './modal-style-guide.component.css'],
    templateUrl: './modal-style-guide.component.html'
})
export class ModalStyleGuideComponent {
    private readonly modalService = inject(ModalService);

    get confirmationButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.openConfirmation(),
            label: 'angular-components-style-guide.modal.buttons.confirmation',
            type: ButtonType.Secondary
        });
    }

    get errorButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.openError(),
            label: 'angular-components-style-guide.modal.buttons.error',
            type: ButtonType.Secondary
        });
    }

    get infoButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.openInfo(),
            label: 'angular-components-style-guide.modal.buttons.info',
            type: ButtonType.Primary
        });
    }

    get warningButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.openWarning(),
            label: 'angular-components-style-guide.modal.buttons.warning',
            type: ButtonType.Secondary
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

    openWarning(): void {
        this.modalService.openWarning({
            message: 'angular-components-style-guide.modal.examples.warning.message',
            title: 'angular-components-style-guide.modal.examples.warning.title'
        });
    }
}