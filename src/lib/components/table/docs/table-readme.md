# Table

A grid of rows built from a config: the columns, the items and a function that turns each item into cells.
Rows can be selected one by one or all at once, and the table reports the selection through a callback.

## Usage

```ts
readonly table = new BeyTableConfig<Person>({
    prefix: 'myApp.team',
    columns: [
        new BeyTableColumn({ key: 'name', width: 3 }),
        new BeyTableColumn({ key: 'status', width: 2 }),
        new BeyTableColumn({ key: 'action', width: 1 })
    ],
    items: this.people,
    loadRow: item => [
        new BeyTextTableCell({ content: item.name }),
        new BeyBadgeTableCell({
            badges: [new BeyBadgeConfig({ label: `myApp.team.status.${item.status}`, variant: BeyBadgeVariant.Success })],
            translate: true
        }),
        new BeyLinkTableCell({ action: () => this.open(item), content: 'myApp.team.open', translate: true })
    ],
    selectedItemsChange: (items, indexes) => this.selection.set(items)
});
```

```html
<bey-table [config]="table" />
```

`BeyTableConfig<T>` is generic over the item: `loadRow`, `isRowSelected` and `selectedItemsChange` see `T`,
so a table is always built from a typed model, never from a loose record.

## BeyTableConfig

| Field                 | Required | Default | Meaning                                                                               |
| --------------------- | -------- | ------- | ------------------------------------------------------------------------------------- |
| `prefix`              | yes      |         | i18n prefix: headers are `<prefix>.columns.<key>`, the empty message `<prefix>.empty` |
| `columns`             | yes      |         | The columns, in order                                                                 |
| `loadRow`             | yes      |         | Turns an item into one cell per column                                                |
| `items`               | no       | `[]`    | The rows                                                                              |
| `height`              | no       | `60vh`  | Height of the scrolling area, any CSS length                                          |
| `selectable`          | no       | `true`  | Shows the selection column                                                            |
| `isRowSelected`       | no       |         | Marks the rows that start selected                                                    |
| `selectedItemsChange` | no       |         | Run with the selected items and their indexes on every change                         |

`BeyTableColumn` takes `key`, an optional `tooltip` and a `width`, which is the share of the row the column
gets: two columns of width 3 and 1 split it 75 / 25. The header uses the key as a kebab-case segment: a column
`createdAt` reads `<prefix>.columns.created-at`. A `tooltip` is a full translation key, used as it is.

## Cells

| Cell                | Fields                     | Shows                                               |
| ------------------- | -------------------------- | --------------------------------------------------- |
| `BeyTextTableCell`  | `content`                  | The text, one line, cut with an ellipsis            |
| `BeyLinkTableCell`  | `content`, `action`        | A link that runs `action` without selecting the row |
| `BeyBadgeTableCell` | `badges: BeyBadgeConfig[]` | One `bey-badge` per entry                           |

Every cell takes an optional `tooltip` and `translate`, which runs the content, the badges and the tooltip
through the translate pipe.

## Selection

Clicking a row toggles it; the header checkbox selects or clears every row and is indeterminate in between.
The table owns that state from `isRowSelected` onwards and calls `selectedItemsChange` after each change. A
replaced config starts over: new rows, the selection `isRowSelected` says, and the scroll back at the top.

## Customisation

| Variable                           | Default                |
| ---------------------------------- | ---------------------- |
| `--bey-table-surface`              | `--bey-bg-page`        |
| `--bey-table-text`                 | `--bey-text-primary`   |
| `--bey-table-text-muted`           | `--bey-text-muted`     |
| `--bey-table-border-subtle`        | `--bey-border-subtle`  |
| `--bey-table-border-strong`        | `--bey-border-default` |
| `--bey-table-row-hover`            | `--bey-bg-hover`       |
| `--bey-table-row-selected`         | `--bey-bg-active`      |
| `--bey-table-row-min-height`       | `2.5rem`               |
| `--bey-table-checkbox-accent`      | `--bey-primary`        |
| `--bey-table-checkbox-border`      | `--bey-border-strong`  |
| `--bey-table-checkbox-mark`        | `--bey-primary-fg`     |
| `--bey-table-link-underline`       | `--bey-border-strong`  |
| `--bey-table-link-underline-hover` | `--bey-primary`        |
