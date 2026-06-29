import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { LOADING_SIZE_MAP, LoadingSize } from './models/loading.model';

@Component({
    imports: [TranslateModule],
    selector: 'bey-loading',
    standalone: true,
    styleUrls: ['./loading.component.css'],
    templateUrl: './loading.component.html'
})
export class LoadingComponent {
    @Input() size: LoadingSize | string = LoadingSize.Md;

    get sizeValue(): string {
        return LOADING_SIZE_MAP[this.size as LoadingSize] ?? this.size;
    }
}
