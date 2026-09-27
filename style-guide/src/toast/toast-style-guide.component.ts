import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BeyToastService } from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

import { StyleGuideButton } from '../models/style-guide-button.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule],
    selector: 'bey-toast-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css', './toast-style-guide.component.css'],
    templateUrl: './toast-style-guide.component.html'
})
export class ToastStyleGuideComponent {
    private readonly toastService = inject(BeyToastService);

    get errorButton(): StyleGuideButton {
        return {
            action: () => this.showError(),
            label: 'angular-components-style-guide.toast.buttons.error'
        };
    }

    get infoButton(): StyleGuideButton {
        return {
            action: () => this.showInfo(),
            label: 'angular-components-style-guide.toast.buttons.info'
        };
    }

    showError(): void {
        this.toastService.showError({
            message: 'angular-components-style-guide.toast.examples.error.message',
            title: 'angular-components-style-guide.toast.examples.error.title'
        });
    }

    showInfo(): void {
        this.toastService.showInfo({
            message: 'angular-components-style-guide.toast.examples.info.message',
            title: 'angular-components-style-guide.toast.examples.info.title'
        });
    }

    showSuccess(): void {
        this.toastService.showSuccess({
            message: 'angular-components-style-guide.toast.examples.success.message',
            title: 'angular-components-style-guide.toast.examples.success.title'
        });
    }

    showWarning(): void {
        this.toastService.showWarning({
            message: 'angular-components-style-guide.toast.examples.warning.message',
            title: 'angular-components-style-guide.toast.examples.warning.title'
        });
    }

    get successButton(): StyleGuideButton {
        return {
            action: () => this.showSuccess(),
            isPrimary: true,
            label: 'angular-components-style-guide.toast.buttons.success'
        };
    }

    get warningButton(): StyleGuideButton {
        return {
            action: () => this.showWarning(),
            label: 'angular-components-style-guide.toast.buttons.warning'
        };
    }
}
