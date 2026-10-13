import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { LoadingOverlayComponent } from './loading-overlay.component';
import { LoadingService } from './services/loading.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LoadingOverlayComponent],
    selector: 'bey-loading-container',
    standalone: true,
    templateUrl: './loading-container.component.html'
})
export class LoadingContainerComponent {
    protected readonly loadingService = inject(LoadingService);
}
