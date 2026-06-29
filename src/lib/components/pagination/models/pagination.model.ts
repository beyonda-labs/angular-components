import { EventEmitter } from '@angular/core';

export const PAGINATION_SIZE_OPTIONS = [25, 50, 100];
export const PAGINATION_SIZE_DEFAULT = PAGINATION_SIZE_OPTIONS[0];

export class PaginationConfig {
    $loadPagination: EventEmitter<void>;
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;

    onPageChange?: (config: PaginationConfig) => void;
    onPageSizeChange?: (config: PaginationConfig) => void;

    constructor({
        page = 1,
        pageSize = PAGINATION_SIZE_DEFAULT,
        totalItems = 0,
        onPageChange,
        onPageSizeChange
    }: PaginationConfigParameters) {
        this.$loadPagination = new EventEmitter<void>();
        this.pageSize = this.resolvePageSize(pageSize);
        this.totalItems = this.normalizeTotalItems(totalItems);
        this.totalPages = 1;
        this.onPageChange = onPageChange;
        this.onPageSizeChange = onPageSizeChange;

        this.recalculate();
        this.setPage(page, false);
    }

    refresh(): void {
        this.$loadPagination.emit();
    }

    setPage(page: number, emitChange = true): void {
        const nextPage = this.clampPage(page);
        const hasChanged = this.page !== nextPage;

        this.page = nextPage;

        if (hasChanged && emitChange) {
            this.onPageChange?.(this);
        }
    }

    setPageSize(pageSize: number, emitChange = true): void {
        const nextPageSize = this.resolvePageSize(pageSize);
        const currentPage = this.page;
        const hasSizeChanged = this.pageSize !== nextPageSize;

        this.pageSize = nextPageSize;
        this.recalculate();
        this.page = this.clampPage(this.page);

        if ((hasSizeChanged || currentPage !== this.page) && emitChange) {
            this.onPageSizeChange?.(this);
        }
    }

    setTotalItems(totalItems: number): void {
        const nextTotalItems = this.normalizeTotalItems(totalItems);

        this.totalItems = nextTotalItems;
        this.recalculate();
        this.page = this.clampPage(this.page);
    }

    private clampPage(page: number): number {
        const normalizedPage = Number.isFinite(page) ? Math.trunc(page) : 1;

        return Math.min(Math.max(normalizedPage, 1), this.totalPages);
    }

    private normalizeTotalItems(totalItems: number): number {
        const normalizedTotalItems = Number.isFinite(totalItems) ? Math.trunc(totalItems) : 0;

        return Math.max(normalizedTotalItems, 0);
    }

    private recalculate(): void {
        this.totalPages = Math.max(Math.ceil(this.totalItems / this.pageSize), 1);
    }

    private resolvePageSize(pageSize: number): number {
        const normalizedPageSize = Number.isFinite(pageSize) ? Math.trunc(pageSize) : PAGINATION_SIZE_DEFAULT;

        if (PAGINATION_SIZE_OPTIONS.includes(normalizedPageSize)) {
            return normalizedPageSize;
        }

        return PAGINATION_SIZE_OPTIONS[0] ?? PAGINATION_SIZE_DEFAULT;
    }
}

export interface PaginationConfigParameters {
    onPageChange?: (config: PaginationConfig) => void;
    onPageSizeChange?: (config: PaginationConfig) => void;
    page?: number;
    pageSize?: number;
    totalItems?: number;
}
