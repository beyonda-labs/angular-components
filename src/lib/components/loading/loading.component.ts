import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { LOADING_SIZE_MAP, LoadingSize } from './models/loading.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateModule],
    selector: 'bey-loading',
    standalone: true,
    styleUrls: ['./loading.component.css'],
    templateUrl: './loading.component.html'
})
export class LoadingComponent {
    readonly size = input<LoadingSize | string>(LoadingSize.Md);

    readonly sizeValue = computed(() => LOADING_SIZE_MAP[this.size() as LoadingSize] ?? this.size());
}
