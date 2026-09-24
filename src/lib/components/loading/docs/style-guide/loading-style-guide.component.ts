import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../../../internal/button/models/button-config.model';
import { LoadingComponent } from '../../loading.component';
import { LoadingContainerComponent } from '../../loading-container.component';
import { LoadingOverlayComponent } from '../../loading-overlay.component';
import { LoadingSize } from '../../models/loading.model';
import { LoadingService } from '../../services/loading.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonComponent, LoadingComponent, LoadingContainerComponent, LoadingOverlayComponent, TranslateModule],
    selector: 'bey-loading-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide-shared.css', './loading-style-guide.component.css'],
    templateUrl: './loading-style-guide.component.html'
})
export class LoadingStyleGuideComponent {
    readonly LoadingSize = LoadingSize;
    readonly showFullscreenOverlay = signal(false);

    private readonly loadingService = inject(LoadingService);

    get toggleFullscreenButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.toggleFullscreen(),
            label: 'angular-components-style-guide.loading.toggle-fullscreen',
            type: ButtonType.Secondary
        });
    }

    get toggleServiceButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.toggleService(),
            label: 'angular-components-style-guide.loading.toggle-service',
            type: ButtonType.Secondary
        });
    }

    toggleFullscreen(): void {
        this.showFullscreenOverlay.update(isOpen => !isOpen);

        if (this.showFullscreenOverlay()) {
            setTimeout(() => this.showFullscreenOverlay.set(false), 3000);
        }
    }

    toggleService(): void {
        this.loadingService.show();

        setTimeout(() => this.loadingService.hide(), 3000);
    }
}
