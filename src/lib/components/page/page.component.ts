import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';

import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { HeaderComponent } from '../header/header.component';
import { LoadingOverlayComponent } from '../loading/loading-overlay.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { SearchComponent } from '../search/search.component';
import { TableComponent } from '../table/table.component';
import { TabsComponent } from '../tabs/tabs.component';
import { PageConfig } from './models/page.model';
import { PageService } from './services/page.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        BreadcrumbComponent,
        HeaderComponent,
        LoadingOverlayComponent,
        PaginationComponent,
        SearchComponent,
        TableComponent,
        TabsComponent
    ],
    providers: [PageService],
    selector: 'bey-page',
    standalone: true,
    styleUrls: ['./page.component.css'],
    templateUrl: './page.component.html'
})
export class PageComponent<TValue = unknown> {
    readonly config = input.required<PageConfig<TValue>>();

    readonly service = inject(PageService);

    readonly hasToolbar = computed(() => Boolean(this.service.viewToggleConfig() || this.service.searchConfig()));

    constructor() {
        effect(() => {
            const config = this.config();

            untracked(() => this.service.setConfig(config));
        });
    }
}
