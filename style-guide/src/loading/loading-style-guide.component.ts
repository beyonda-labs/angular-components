import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
    BeyLoadingComponent,
    BeyLoadingContainerComponent,
    BeyLoadingOverlayComponent,
    BeyLoadingService,
    BeyLoadingSize
} from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

import { StyleGuideButton } from '../models/style-guide-button.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyLoadingComponent, BeyLoadingContainerComponent, BeyLoadingOverlayComponent, TranslateModule],
    selector: 'bey-loading-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css', './loading-style-guide.component.css'],
    templateUrl: './loading-style-guide.component.html'
})
export class LoadingStyleGuideComponent {
    readonly LoadingSize = BeyLoadingSize;
    readonly showFullscreenOverlay = signal(false);

    private readonly loadingService = inject(BeyLoadingService);

    toggleFullscreen(): void {
        this.showFullscreenOverlay.update(isOpen => !isOpen);

        if (this.showFullscreenOverlay()) {
            setTimeout(() => this.showFullscreenOverlay.set(false), 3000);
        }
    }

    get toggleFullscreenButton(): StyleGuideButton {
        return {
            action: () => this.toggleFullscreen(),
            label: 'angular-components-style-guide.loading.toggle-fullscreen'
        };
    }

    toggleService(): void {
        this.loadingService.show();

        setTimeout(() => this.loadingService.hide(), 3000);
    }

    get toggleServiceButton(): StyleGuideButton {
        return {
            action: () => this.toggleService(),
            label: 'angular-components-style-guide.loading.toggle-service'
        };
    }
}
