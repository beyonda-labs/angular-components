import { Component, inject } from '@angular/core';

import { LoadingOverlayComponent } from './loading-overlay.component';
import { LoadingService } from './services/loading.service';

@Component({
    imports: [LoadingOverlayComponent],
    selector: 'bey-loading-container',
    standalone: true,
    template: `
        @if (loadingService.isLoading()) {
            <bey-loading-overlay [fullscreen]="true"></bey-loading-overlay>
        }
    `
})
export class LoadingContainerComponent {
    protected readonly loadingService = inject(LoadingService);
}
