import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../../../internal/button/models/button-config.model';
import { ToastService } from '../../services/toast.service';

@Component({
    imports: [ButtonComponent, TranslateModule],
    selector: 'bey-toast-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide.component.css', './toast-style-guide.component.css'],
    templateUrl: './toast-style-guide.component.html'
})
export class ToastStyleGuideComponent {
    private readonly toastService = inject(ToastService);

    get successButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.showSuccess(),
            label: 'angular-components-style-guide.toast.buttons.success',
            type: ButtonType.Primary
        });
    }

    get infoButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.showInfo(),
            label: 'angular-components-style-guide.toast.buttons.info',
            type: ButtonType.Secondary
        });
    }

    get warningButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.showWarning(),
            label: 'angular-components-style-guide.toast.buttons.warning',
            type: ButtonType.Secondary
        });
    }

    get errorButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.showError(),
            label: 'angular-components-style-guide.toast.buttons.error',
            type: ButtonType.Secondary
        });
    }

    showSuccess(): void {
        this.toastService.showSuccess({
            message: 'angular-components-style-guide.toast.examples.success.message',
            title: 'angular-components-style-guide.toast.examples.success.title'
        });
    }

    showInfo(): void {
        this.toastService.showInfo({
            message: 'angular-components-style-guide.toast.examples.info.message',
            title: 'angular-components-style-guide.toast.examples.info.title'
        });
    }

    showWarning(): void {
        this.toastService.showWarning({
            message: 'angular-components-style-guide.toast.examples.warning.message',
            title: 'angular-components-style-guide.toast.examples.warning.title'
        });
    }

    showError(): void {
        this.toastService.showError({
            message: 'angular-components-style-guide.toast.examples.error.message',
            title: 'angular-components-style-guide.toast.examples.error.title'
        });
    }
}
