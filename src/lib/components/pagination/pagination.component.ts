import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
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
import { Subject, takeUntil } from 'rxjs';

import { PAGINATION_SIZE_OPTIONS, PaginationConfig } from './models/pagination.model';

@Component({
    imports: [CommonModule, FontAwesomeModule, FormsModule, TooltipModule, TranslateModule],
    selector: 'bey-pagination',
    standalone: true,
    styleUrls: ['./pagination.component.css'],
    templateUrl: './pagination.component.html'
})
export class PaginationComponent implements OnDestroy {
    private static nextInstanceId = 0;

    @Input({ required: true })
    set config(value: PaginationConfig) {
        this._config = value;
        this.bindRefresh();
        this.syncFromConfig();
    }
    get config(): PaginationConfig {
        return this._config;
    }

    pageInputValue = '1';

    readonly firstPageIcon = faAnglesLeft;
    readonly previousPageIcon = faChevronLeft;
    readonly nextPageIcon = faChevronRight;
    readonly lastPageIcon = faAnglesRight;
    readonly infoIcon = faCircleInfo;
    readonly pageInputId = `bey-pagination-page-input-${PaginationComponent.nextInstanceId}`;
    readonly pageSizeId = `bey-pagination-page-size-${PaginationComponent.nextInstanceId++}`;

    private _config!: PaginationConfig;
    private readonly configChange$ = new Subject<void>();
    private readonly destroy$ = new Subject<void>();

    ngOnDestroy(): void {
        this.configChange$.next();
        this.configChange$.complete();
        this.destroy$.next();
        this.destroy$.complete();
    }

    get isFirstPage(): boolean {
        return this.currentPage <= 1;
    }

    get isLastPage(): boolean {
        return this.currentPage >= this.totalPages;
    }

    get currentPage(): number {
        return this.config?.page ?? 1;
    }

    get shouldShowFirstLastButtons(): boolean {
        return this.totalPages >= 6;
    }

    get totalPages(): number {
        return this.config?.totalPages ?? 1;
    }

    get pageInputWidth(): string {
        const inputDigits = String(this.pageInputValue).length;
        const maxDigits = String(this.totalPages).length;
        const digits = Math.max(inputDigits, maxDigits, 1);
        const maxWidthDigits = Math.min(digits, 50);

        return `calc(${maxWidthDigits}ch + 1.4rem)`;
    }

    get pageSizeOptions(): number[] {
        return PAGINATION_SIZE_OPTIONS;
    }

    get resultRangeEnd(): number {
        if (!this.config?.totalItems) {
            return 0;
        }

        return Math.min(this.currentPage * this.config.pageSize, this.config.totalItems);
    }

    get resultRangeStart(): number {
        if (!this.config?.totalItems) {
            return 0;
        }

        return (this.currentPage - 1) * this.config.pageSize + 1;
    }

    getResultsTooltipParams(): { end: number; start: number; total: number } {
        return {
            end: this.resultRangeEnd,
            start: this.resultRangeStart,
            total: this.config?.totalItems ?? 0
        };
    }

    goToFirstPage(): void {
        this.navigateTo(1);
    }

    goToLastPage(): void {
        this.navigateTo(this.totalPages);
    }

    goToNextPage(): void {
        this.navigateTo(this.currentPage + 1);
    }

    goToPreviousPage(): void {
        this.navigateTo(this.currentPage - 1);
    }

    onPageInputBlur(): void {
        this.pageInputValue = String(this.currentPage);
    }

    onPageInputChange(value: string | number): void {
        const nextPage = this.normalizePageInput(value);

        this.pageInputValue = String(nextPage);
        this.navigateTo(nextPage);
    }

    onPageSizeChange(value: string | number): void {
        if (!this.config) {
            return;
        }

        const nextPageSize = this.normalizePageSize(value);

        if (nextPageSize === this.config.pageSize) {
            return;
        }

        this.config.setPageSize(nextPageSize);
        this.syncFromConfig();
    }

    private bindRefresh(): void {
        this.configChange$.next();

        this.config.$loadPagination.pipe(takeUntil(this.configChange$), takeUntil(this.destroy$)).subscribe(() => {
            this.syncFromConfig();
        });
    }

    private navigateTo(page: number): void {
        if (!this.config) {
            return;
        }

        if (page === this.currentPage) {
            this.pageInputValue = String(this.currentPage);

            return;
        }

        this.config.setPage(page);
        this.syncFromConfig();
    }

    private normalizePageInput(value: string | number): number {
        const digits = String(value ?? '').replace(/\D+/gu, '');

        if (!digits) {
            return this.currentPage;
        }

        return this.normalizePageSize(digits, this.totalPages);
    }

    private normalizePageSize(value: string | number, maxValue?: number): number {
        const numericValue = Number(value);
        const fallbackValue = maxValue ? Math.min(this.currentPage, maxValue) : this.pageSizeOptions[0];
        const normalizedValue = Number.isFinite(numericValue) ? Math.trunc(numericValue) : fallbackValue;

        if (maxValue) {
            return Math.min(Math.max(normalizedValue, 1), maxValue);
        }

        return this.pageSizeOptions.includes(normalizedValue) ? normalizedValue : this.config.pageSize;
    }

    private syncFromConfig(): void {
        if (!this.config) {
            return;
        }

        this.pageInputValue = String(this.currentPage);
    }
}
