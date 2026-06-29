import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PaginationConfig } from '../../models/pagination.model';
import { PaginationComponent } from '../../pagination.component';

@Component({
    imports: [PaginationComponent, TranslateModule],
    selector: 'bey-pagination-style-guide',
    standalone: true,
    templateUrl: './pagination-style-guide.component.html'
})
export class PaginationStyleGuideComponent {
    compactConfig: PaginationConfig;
    defaultConfig: PaginationConfig;

    private readonly translateService = inject(TranslateService);

    constructor() {
        this.defaultConfig = this.buildConfig({ page: 4, pageSize: 25, totalItems: 240 });
        this.compactConfig = this.buildConfig({ page: 2, pageSize: 25, totalItems: 95 });
    }

    private buildConfig({
        page,
        pageSize,
        totalItems
    }: {
        page: number;
        pageSize: number;
        totalItems: number;
    }): PaginationConfig {
        return new PaginationConfig({
            onPageChange: config => {
                const message = this.translateService.instant('angular-components-style-guide.pagination.changed');

                // eslint-disable-next-line no-console
                console.log(message, { page: config.page, pageSize: config.pageSize, totalItems: config.totalItems });
            },
            onPageSizeChange: config => {
                const message = this.translateService.instant('angular-components-style-guide.pagination.changed');

                // eslint-disable-next-line no-console
                console.log(message, { page: config.page, pageSize: config.pageSize, totalItems: config.totalItems });
            },
            page,
            pageSize,
            totalItems
        });
    }
}
