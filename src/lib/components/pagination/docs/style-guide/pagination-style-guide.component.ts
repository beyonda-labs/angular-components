import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PaginationConfig } from '../../models/pagination.model';
import { PaginationComponent } from '../../pagination.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PaginationComponent, TranslateModule],
    selector: 'bey-pagination-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide-shared.css'],
    templateUrl: './pagination-style-guide.component.html'
})
export class PaginationStyleGuideComponent {
    readonly defaultLastChange = signal('');
    readonly compactLastChange = signal('');

    readonly defaultConfig = new PaginationConfig({
        onPageChange: page => this.defaultLastChange.set(`page ${page}`),
        onPageSizeChange: pageSize => this.defaultLastChange.set(`size ${pageSize}`),
        page: 4,
        pageSize: 25,
        totalItems: 240
    });

    readonly compactConfig = new PaginationConfig({
        onPageChange: page => this.compactLastChange.set(`page ${page}`),
        onPageSizeChange: pageSize => this.compactLastChange.set(`size ${pageSize}`),
        page: 2,
        pageSize: 25,
        totalItems: 95
    });
}
