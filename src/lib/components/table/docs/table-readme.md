# Table Component (`bey-table`)

Model-driven table component built from columns, rows, and cells.

Supported capabilities:

-   Configurable columns with proportional widths.
-   Row rendering driven by `loadRow`.
-   Selectable rows with bulk selection support.
-   Pre-selected rows via `isRowSelected` (e.g. to restore a previous selection).
-   Text, action-link and badge cells.
-   Optional tooltips per cell and per column header, shown whenever defined.
-   Refresh support via `config.refresh()`.

---

## Quick start

```ts
import {
    BeyBadgeTableCell,
    BeyLinkTableCell,
    BeyTableColumn,
    BeyTableComponent,
    BeyTableConfig,
    BeyTextTableCell
} from '@beyonda-labs/angular-components';

const table = new BeyTableConfig({
    prefix: 'teamTable',
    columns: [
        new BeyTableColumn({ key: 'name', width: 3 }),
        new BeyTableColumn({ key: 'role', width: 2 }),
        new BeyTableColumn({ key: 'status', width: 2 }),
        new BeyTableColumn({ key: 'action', width: 1 })
    ],
    items: [
        { id: 1, name: 'Ada Lovelace', role: 'Lead Engineer', status: 'Active' },
        { id: 2, name: 'Alan Turing', role: 'Researcher', status: 'Paused' }
    ],
    loadRow: item => [
        new BeyTextTableCell({ content: String(item['name'] ?? '') }),
        new BeyTextTableCell({ content: String(item['role'] ?? '') }),
        new BeyBadgeTableCell({
            badges: [
                {
                    badgeClass: item['status'] === 'Active' ? 'bg-success' : 'bg-secondary',
                    content: String(item['status'] ?? '')
                }
            ]
        }),
        new BeyLinkTableCell({
            action: () => console.log('Open row', item['id']),
            content: 'teamTable.actions.open',
            translate: true
        })
    ]
});
```

```html
<bey-table [config]="table"></bey-table>
```

---

## Models

### `BeyTableConfig`

The root configuration object passed to `[config]`.

| Parameter             | Type                                                | Required | Default | Description                                         |
| --------------------- | --------------------------------------------------- | -------- | ------- | --------------------------------------------------- |
| `prefix`              | `string`                                            | yes      | —       | Prefix used for column and state translation keys   |
| `columns`             | `BeyTableColumn[]`                                  | yes      | —       | Column definitions                                  |
| `loadRow`             | `(item: Record<string, unknown>) => BeyTableCell[]` | yes      | —       | Maps an item into rendered cells                    |
| `items`               | `Record<string, unknown>[]`                         | no       | `[]`    | Source rows                                         |
| `height`              | `string`                                            | no       | `60vh`  | Max scroll height                                   |
| `selectable`          | `boolean`                                           | no       | `true`  | Enables row selection                               |
| `isRowSelected`       | `(item: Record<string, unknown>) => boolean`        | no       | —       | Marks a row as pre-selected when rows are (re)built |
| `selectedItemsChange` | `(items, indexes) => void`                          | no       | —       | Called when selected rows change                    |

**Methods:**

| Method      | Signature    | Description                         |
| ----------- | ------------ | ----------------------------------- |
| `refresh()` | `() => void` | Rebuilds rendered rows from `items` |

---

### `BeyTableColumn`

| Parameter | Type     | Required | Default | Description                                   |
| --------- | -------- | -------- | ------- | --------------------------------------------- |
| `key`     | `string` | yes      | —       | Column key, also used for translation lookup  |
| `width`   | `number` | no       | `10`    | Relative width weight for the CSS grid layout |
| `tooltip` | `string` | no       | —       | Header tooltip translation key                |

---

### `BeyTableCell`

Base cell model.

| Parameter   | Type          | Required | Default | Description                           |
| ----------- | ------------- | -------- | ------- | ------------------------------------- |
| `content`   | `unknown`     | yes      | —       | Value rendered inside the cell        |
| `type`      | `BeyCellType` | yes      | —       | Cell renderer type                    |
| `translate` | `boolean`     | no       | `false` | Applies the translate pipe to content |
| `tooltip`   | `string`      | no       | —       | Tooltip translation key               |

Supported specializations:

-   `BeyTextTableCell` renders plain text.
-   `BeyLinkTableCell` renders an inline action button through `action()`.
-   `BeyBadgeTableCell` renders one or more Bootstrap `.badge` elements, each with its own classes.

### `BeyBadgeTableCell`

| Parameter | Type              | Required | Default | Description                     |
| --------- | ----------------- | -------- | ------- | ------------------------------- |
| `badges`  | `BeyTableBadge[]` | yes      | —       | Badges rendered inside the cell |

`BeyTableBadge`:

| Attribute    | Type     | Required | Description                                                              |
| ------------ | -------- | -------- | ------------------------------------------------------------------------ |
| `content`    | `string` | yes      | Badge label                                                              |
| `badgeClass` | `string` | yes      | Bootstrap classes applied to that badge (e.g. `'bg-success text-white'`) |

`translate` (from the base cell) applies to every badge's `content` in the cell.

```ts
// Single badge
new BeyBadgeTableCell({
    badges: [{ content: 'Active', badgeClass: 'bg-success' }]
});

// Multiple badges in the same cell, each with its own color
new BeyBadgeTableCell({
    badges: [
        { content: 'Angular', badgeClass: 'bg-primary' },
        { content: 'TypeScript', badgeClass: 'bg-info text-dark' },
        { content: 'RxJS', badgeClass: 'bg-dark' }
    ]
});
```

The color of each badge is entirely up to its `badgeClass`; pick any combination of Bootstrap
background/text utility classes (`bg-success`, `bg-danger`, `bg-warning text-dark`, `bg-secondary`, ...).

---

## i18n convention

With `prefix = 'teamTable'`:

| Key pattern              | Example                  | Description         |
| ------------------------ | ------------------------ | ------------------- |
| `{prefix}.columns.{key}` | `teamTable.columns.name` | Column title        |
| `{prefix}.empty`         | `teamTable.empty`        | Empty state message |
| any cell content key     | `teamTable.actions.open` | Optional cell label |

Generic selection labels are provided by the library under `angular-components.table`.

---

## Best practices

-   Keep `loadRow` pure and side-effect free; place navigation or commands only in `BeyLinkTableCell.action`.
-   Use proportional `width` values instead of fixed pixel assumptions.
-   When replacing `items`, call `config.refresh()` so rendered rows stay in sync.
-   `isRowSelected` runs on every row (re)build; match by a stable identifier (e.g. `item.id`) so the selection survives data reloads, and keep it fast.
-   Prefer translated content for repeated labels such as actions and statuses.
