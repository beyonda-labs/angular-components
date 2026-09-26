# Pagination

A pager driven by a config model. It owns which page and page size are selected and reports every change; the
consumer fetches the matching slice and hands back a new config with the resulting total.

## Usage

```ts
const pagination = new BeyPaginationConfig({
    page: 1,
    pageSize: 25,
    totalItems: this.total(),
    onPageChange: page => this.load({ page }),
    onPageSizeChange: pageSize => this.load({ page: 1, pageSize })
});
```

```html
<bey-pagination [config]="pagination"></bey-pagination>
```

## BeyPaginationConfig

| Field              | Required | Default | Meaning                                                    |
| ------------------ | -------- | ------- | ---------------------------------------------------------- |
| `page`             | no       | `1`     | Page selected on load, clamped to the available range       |
| `pageSize`         | no       | `25`    | One of `BEY_PAGINATION_SIZE_OPTIONS`, otherwise the default |
| `totalItems`       | no       | `0`     | Total across all pages; drives how many pages there are     |
| `onPageChange`     | no       |         | Called with the new page number                             |
| `onPageSizeChange` | no       |         | Called with the new page size                               |

`totalPages` is derived at construction and is read-only.

## Replacing the config

The config is read as the initial state and never written to. After a fetch, build a new
`BeyPaginationConfig` with the new `totalItems` and bind it — building it inside a `computed()` is the usual
way. Mutating the instance you passed in has no effect.

## Behaviour

The page is always kept within range: raising the page size moves the selection back if it would fall past
the last page, and a page typed beyond the end is clamped. The first and last page buttons appear only from
six pages onwards.

## Theming

| Variable                          | Default                |
| --------------------------------- | ---------------------- |
| `--bey-pagination-accent`         | `--bey-primary`        |
| `--bey-pagination-text`           | `--bey-text-primary`   |
| `--bey-pagination-muted`          | `--bey-text-muted`     |
| `--bey-pagination-surface`        | `--bey-bg-surface`     |
| `--bey-pagination-surface-alt`    | `--bey-bg-hover`       |
| `--bey-pagination-border`         | `--bey-border-subtle`  |
| `--bey-pagination-outline-focus`  | `--bey-border-strong`  |
