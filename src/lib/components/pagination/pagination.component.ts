import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
    faAnglesLeft,
    faAnglesRight,
    faChevronLeft,
    faChevronRight,
    faCircleInfo
} from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { PAGINATION_SIZE_OPTIONS, PaginationConfig } from './models/pagination.model';

const FIRST_LAST_BUTTONS_FROM_PAGES = 6;
const MAX_INPUT_DIGITS = 50;

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, FormsModule, TooltipModule, TranslateModule],
    selector: 'bey-pagination',
    standalone: true,
    styleUrls: ['./pagination.component.css'],
    templateUrl: './pagination.component.html'
})
export class PaginationComponent {
    private static nextInstanceId = 0;

    readonly config = input.required<PaginationConfig>();

    readonly page = linkedSignal(() => this.config().page);
    readonly pageSize = linkedSignal(() => this.config().pageSize);
    readonly pageInputValue = linkedSignal(() => String(this.config().page));

    readonly totalPages = computed(() => Math.max(Math.ceil(this.config().totalItems / this.pageSize()), 1));
    readonly isFirstPage = computed(() => this.page() <= 1);
    readonly isLastPage = computed(() => this.page() >= this.totalPages());
    readonly shouldShowFirstLastButtons = computed(() => this.totalPages() >= FIRST_LAST_BUTTONS_FROM_PAGES);

    readonly resultRangeEnd = computed(() =>
        this.config().totalItems ? Math.min(this.page() * this.pageSize(), this.config().totalItems) : 0
    );
    readonly resultRangeStart = computed(() =>
        this.config().totalItems ? (this.page() - 1) * this.pageSize() + 1 : 0
    );
    readonly resultsTooltipParams = computed(() => ({
        end: this.resultRangeEnd(),
        start: this.resultRangeStart(),
        total: this.config().totalItems
    }));

    readonly pageInputWidth = computed(() => {
        const digits = Math.max(this.pageInputValue().length, String(this.totalPages()).length, 1);

        return `calc(${Math.min(digits, MAX_INPUT_DIGITS)}ch + 1.4rem)`;
    });

    readonly pageSizeOptions = PAGINATION_SIZE_OPTIONS;

    readonly firstPageIcon = faAnglesLeft;
    readonly previousPageIcon = faChevronLeft;
    readonly nextPageIcon = faChevronRight;
    readonly lastPageIcon = faAnglesRight;
    readonly infoIcon = faCircleInfo;
    readonly pageInputId = `bey-pagination-page-input-${PaginationComponent.nextInstanceId}`;
    readonly pageSizeId = `bey-pagination-page-size-${PaginationComponent.nextInstanceId++}`;

    goToFirstPage(): void {
        this.navigateTo(1);
    }

    goToLastPage(): void {
        this.navigateTo(this.totalPages());
    }

    goToNextPage(): void {
        this.navigateTo(this.page() + 1);
    }

    goToPreviousPage(): void {
        this.navigateTo(this.page() - 1);
    }

    onPageInputBlur(): void {
        this.pageInputValue.set(String(this.page()));
    }

    onPageInputChange(value: string | number): void {
        const digits = String(value ?? '').replaceAll(/\D+/gu, '');
        const nextPage = digits ? Math.min(Math.max(Number(digits), 1), this.totalPages()) : this.page();

        this.pageInputValue.set(String(nextPage));
        this.navigateTo(nextPage);
    }

    onPageSizeChange(value: string | number): void {
        const candidate = Math.trunc(Number(value));
        const nextPageSize = PAGINATION_SIZE_OPTIONS.includes(candidate) ? candidate : this.pageSize();

        if (nextPageSize === this.pageSize()) {
            return;
        }

        this.pageSize.set(nextPageSize);

        const clampedPage = Math.min(this.page(), this.totalPages());

        this.page.set(clampedPage);
        this.pageInputValue.set(String(clampedPage));
        this.config().onPageSizeChange?.(nextPageSize);
    }

    private navigateTo(page: number): void {
        const nextPage = Math.min(Math.max(page, 1), this.totalPages());

        if (nextPage === this.page()) {
            this.pageInputValue.set(String(this.page()));

            return;
        }

        this.page.set(nextPage);
        this.pageInputValue.set(String(nextPage));
        this.config().onPageChange?.(nextPage);
    }
}
