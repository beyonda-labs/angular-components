import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { LoadingComponent } from './loading.component';
import { LoadingSize } from './models/loading.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LoadingComponent],
    selector: 'bey-loading-overlay',
    standalone: true,
    styleUrls: ['./loading-overlay.component.css'],
    templateUrl: './loading-overlay.component.html'
})
export class LoadingOverlayComponent {
    readonly isFullscreen = input(false);
    readonly size = input<LoadingSize | string>(LoadingSize.Lg);
}
