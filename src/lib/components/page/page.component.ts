import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { HeaderComponent } from '../header/header.component';
import { LoadingOverlayComponent } from '../loading/loading-overlay.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { SearchComponent } from '../search/search.component';
import { TableComponent } from '../table/table.component';
import { PageConfig } from './models/page.model';
import { PageService } from './services/page.service';

@Component({
    imports: [
        HeaderComponent,
        LoadingOverlayComponent,
        PaginationComponent,
        SearchComponent,
        TableComponent,
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
