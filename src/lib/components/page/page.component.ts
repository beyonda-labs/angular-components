import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';

import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { HeaderComponent } from '../header/header.component';
import { LoadingOverlayComponent } from '../loading/loading-overlay.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { SearchComponent } from '../search/search.component';
import { TableComponent } from '../table/table.component';
import { TabsComponent } from '../tabs/tabs.component';
import { PageConfig } from './models/page.model';
import { PageItem } from './models/page-item.model';
import { PageService } from './services/page.service';
import { PageLinkService } from './services/page-link.service';
import { PageListService } from './services/page-list.service';
import { PageOrganizationsService } from './services/page-organizations.service';
import { PageOwnersService } from './services/page-owners.service';
import { PageSelectionService } from './services/page-selection.service';
import { PageViewService } from './services/page-view.service';

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
    providers: [
        PageLinkService,
        PageListService,
        PageOrganizationsService,
        PageOwnersService,
        PageSelectionService,
        PageService,
        PageViewService
    ],
    selector: 'bey-page',
    standalone: true,
    styleUrls: ['./page.component.css'],
    templateUrl: './page.component.html'
})
export class PageComponent<
    TValue = unknown,
    TItem extends PageItem = PageItem,
    TCategory extends PageItem = TItem,
    TCategoryValue = unknown
> {
    private readonly pageLinkService = inject(PageLinkService);
    readonly service = inject(PageService);

    readonly config = input.required<PageConfig<TValue, TItem, TCategory, TCategoryValue>>();

    readonly hasToolbar = computed(() => Boolean(this.service.viewToggleConfig() || this.service.searchConfig()));
    readonly isFilled = computed(() => !this.service.tableConfig()?.height);
    readonly isLoading = computed(() => this.service.loading() || this.pageLinkService.isPending());

    constructor() {
        effect(() => {
            const config = this.config();

            untracked(() => this.service.setConfig(config));
        });
    }
}
