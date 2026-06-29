# Pagination Component (`bey-pagination`)

Model-driven pagination component with editable page input, page-size selector, and range tooltip.

Supported capabilities:

-   Page navigation with first, previous, next, and last buttons.
-   Editable page number input with automatic clamping.
-   Page-size selector (25, 50, 100).
-   Results-range tooltip showing the visible slice.
-   Separate callbacks for page and page-size changes.
-   Refresh support via `config.refresh()`.
-   i18n-ready labels through `ngx-translate`.

---

## Quick start

```ts
import { BeyPaginationComponent, BeyPaginationConfig } from '@beyonda-labs/angular-components';

const pagination = new BeyPaginationConfig({
    page: 1,
    pageSize: 25,
    totalItems: 250,
    onPageChange: config => {
        console.log('Page changed:', config.page);
    },
    onPageSizeChange: config => {
        console.log('Page size changed:', config.pageSize);
    }
});
```

```html
<bey-pagination [config]="pagination"></bey-pagination>
```

---

## Models

### `BeyPaginationConfig`

The root configuration object passed to `[config]`.

| Parameter          | Type                                    | Required | Default | Description                                |
| ------------------ | --------------------------------------- | -------- | ------- | ------------------------------------------ |
| `page`             | `number`                                | no       | `1`     | Initial page number                        |
| `pageSize`         | `number`                                | no       | `25`    | Initial page size (must be 25, 50, or 100) |
| `totalItems`       | `number`                                | no       | `0`     | Total number of items                      |
| `onPageChange`     | `(config: BeyPaginationConfig) => void` | no       | —       | Called when the current page changes       |
| `onPageSizeChange` | `(config: BeyPaginationConfig) => void` | no       | —       | Called when the page size changes          |

**Properties:**

| Property     | Type     | Description                    |
| ------------ | -------- | ------------------------------ |
| `page`       | `number` | Current page number            |
| `pageSize`   | `number` | Current page size              |
| `totalItems` | `number` | Total number of items          |
| `totalPages` | `number` | Computed total number of pages |

**Methods:**

| Method          | Signature                    | Description                                |
| --------------- | ---------------------------- | ------------------------------------------ |
| `setPage`       | `(page: number) => void`     | Navigates to a page (clamped to bounds)    |
| `setPageSize`   | `(pageSize: number) => void` | Updates the page size and recalculates     |
| `setTotalItems` | `(total: number) => void`    | Updates total items and recalculates pages |
| `refresh`       | `() => void`                 | Triggers a UI refresh                      |

---

### `BEY_PAGINATION_SIZE_OPTIONS`

Available page-size values: `[25, 50, 100]`.

### `BEY_PAGINATION_SIZE_DEFAULT`

Default page size: `25`.

---
