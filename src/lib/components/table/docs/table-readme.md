# Table Component (`bey-table`)

Model-driven table component built from columns, rows, and cells.

Supported capabilities:

-   Configurable columns with proportional widths.
-   Row rendering driven by `loadRow`.
-   Selectable rows with bulk selection support.
-   Text and action-link cells.
-   Optional tooltips and i18n-ready labels.
-   Refresh support via `config.refresh()`.

---

## Quick start

```ts
import {
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
        new BeyTableColumn({ key: 'action', width: 1 })
    ],
    items: [
        { id: 1, name: 'Ada Lovelace', role: 'Lead Engineer' },
        { id: 2, name: 'Alan Turing', role: 'Researcher' }
    ],
    loadRow: item => [
        new BeyTextTableCell({ content: String(item['name'] ?? '') }),
        new BeyTextTableCell({ content: String(item['role'] ?? '') }),
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

| Parameter              | Type                                                    | Required | Default  | Description                                      |
| ---------------------- | ------------------------------------------------------- | -------- | -------- | ------------------------------------------------ |
| `prefix`               | `string`                                                | yes      | —        | Prefix used for column and state translation keys |
| `columns`              | `BeyTableColumn[]`                                      | yes      | —        | Column definitions                               |
| `loadRow`              | `(item: Record<string, unknown>) => BeyTableCell[]`     | yes      | —        | Maps an item into rendered cells                 |
| `items`                | `Record<string, unknown>[]`                             | no       | `[]`     | Source rows                                      |
| `height`               | `string`                                                | no       | `60vh`   | Max scroll height                                |
| `selectable`           | `boolean`                                               | no       | `true`   | Enables row selection                            |
| `showTooltip`          | `boolean`                                               | no       | `false`  | Enables tooltip rendering on cells               |
| `selectedItemsChange`  | `(items, indexes) => void`                              | no       | —        | Called when selected rows change                 |

**Methods:**

| Method      | Signature     | Description                            |
| ----------- | ------------- | -------------------------------------- |
| `refresh()` | `() => void`  | Rebuilds rendered rows from `items`    |

---

### `BeyTableColumn`

| Parameter | Type     | Required | Default | Description                                    |
| --------- | -------- | -------- | ------- | ---------------------------------------------- |
| `key`     | `string` | yes      | —       | Column key, also used for translation lookup   |
| `width`   | `number` | no       | `10`    | Relative width weight for the CSS grid layout  |

---

### `BeyTableCell`

Base cell model.

| Parameter   | Type             | Required | Default | Description                          |
| ----------- | ---------------- | -------- | ------- | ------------------------------------ |
| `content`   | `unknown`        | yes      | —       | Value rendered inside the cell       |
| `type`      | `BeyCellType`    | yes      | —       | Cell renderer type                   |
| `translate` | `boolean`        | no       | `false` | Applies the translate pipe to content |
| `tooltip`   | `string`         | no       | —       | Tooltip translation key              |

Supported specializations:

-   `BeyTextTableCell` renders plain text.
-   `BeyLinkTableCell` renders an inline action button through `action()`.

---

## i18n convention

With `prefix = 'teamTable'`:

| Key pattern                 | Example                      | Description          |
| --------------------------- | ---------------------------- | -------------------- |
| `{prefix}.columns.{key}`    | `teamTable.columns.name`     | Column title         |
| `{prefix}.empty`            | `teamTable.empty`            | Empty state message  |
| any cell content key        | `teamTable.actions.open`     | Optional cell label  |

Generic selection labels are provided by the library under `angular-components.table`.

---

## Best practices

-   Keep `loadRow` pure and side-effect free; place navigation or commands only in `BeyLinkTableCell.action`.
-   Use proportional `width` values instead of fixed pixel assumptions.
-   When replacing `items`, call `config.refresh()` so rendered rows stay in sync.
-   Prefer translated content for repeated labels such as actions and statuses.