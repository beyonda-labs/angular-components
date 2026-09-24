export const PAGINATION_SIZE_OPTIONS = [25, 50, 100];
export const PAGINATION_SIZE_DEFAULT = PAGINATION_SIZE_OPTIONS[0];

export class PaginationConfig {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;

    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;

    constructor({
        page = 1,
        pageSize = PAGINATION_SIZE_DEFAULT,
        totalItems = 0,
        onPageChange,
        onPageSizeChange
    }: PaginationConfigParameters) {
        this.onPageChange = onPageChange;
        this.onPageSizeChange = onPageSizeChange;
        this.pageSize = PAGINATION_SIZE_OPTIONS.includes(Math.trunc(pageSize))
            ? Math.trunc(pageSize)
            : PAGINATION_SIZE_DEFAULT;
        this.totalItems = Number.isFinite(totalItems) ? Math.max(Math.trunc(totalItems), 0) : 0;
        this.totalPages = Math.max(Math.ceil(this.totalItems / this.pageSize), 1);
        this.page = Math.min(Math.max(Number.isFinite(page) ? Math.trunc(page) : 1, 1), this.totalPages);
    }
}

export interface PaginationConfigParameters {
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    page?: number;
    pageSize?: number;
    totalItems?: number;
}
