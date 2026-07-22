import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';

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
    imports: [
        BreadcrumbComponent,
        HeaderComponent,
        LoadingOverlayComponent,
        PaginationComponent,
        SearchComponent,
        TableComponent,
        TabsComponent,
        TranslateModule
    ],
    providers: [PageService],
    selector: 'bey-page',
    standalone: true,
    styleUrls: ['./page.component.css'],
    templateUrl: './page.component.html'
})
export class PageComponent implements OnInit, OnDestroy {
    @Input({ required: true }) config!: PageConfig;

    readonly service = inject(PageService);

    private readonly destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.service.init(this.config);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get showPagination(): boolean {
        return this.config.tableConfig?.showPagination ?? false;
    }
}
