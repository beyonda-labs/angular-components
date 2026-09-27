import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BeyPaginationComponent, BeyPaginationConfig } from '@beyonda-labs/angular-components';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BeyPaginationComponent, TranslateModule],
    selector: 'bey-pagination-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css'],
    templateUrl: './pagination-style-guide.component.html'
})
export class PaginationStyleGuideComponent {
    readonly compactConfig = new BeyPaginationConfig({
        onPageChange: page => this.compactLastChange.set(`page ${page}`),
        onPageSizeChange: pageSize => this.compactLastChange.set(`size ${pageSize}`),
        page: 2,
        pageSize: 25,
        totalItems: 95
    });
    readonly compactLastChange = signal('');
    readonly defaultConfig = new BeyPaginationConfig({
        onPageChange: page => this.defaultLastChange.set(`page ${page}`),
        onPageSizeChange: pageSize => this.defaultLastChange.set(`size ${pageSize}`),
        page: 4,
        pageSize: 25,
        totalItems: 240
    });
    readonly defaultLastChange = signal('');
}
