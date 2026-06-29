import { Component, Input } from '@angular/core';

import { LoadingComponent } from './loading.component';
import { LoadingSize } from './models/loading.model';

@Component({
    imports: [LoadingComponent],
    selector: 'bey-loading-overlay',
    standalone: true,
    styleUrls: ['./loading-overlay.component.css'],
    templateUrl: './loading-overlay.component.html'
})
export class LoadingOverlayComponent {
    @Input() fullscreen = false;
    @Input() size: LoadingSize | string = LoadingSize.Lg;
}
