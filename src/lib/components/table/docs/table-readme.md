# Table

A grid of rows built from a config: the columns, the items and a function that turns each item into cells.
Rows can be selected one by one or all at once, and the table reports the selection through a callback. Columns can
sort the rows from their header and be hidden by the user, and rows can be dragged onto other rows.

## Usage

```ts
readonly table = new BeyTableConfig<Person>({
    prefix: 'myApp.team',
    storageKey: 'team',
    columns: [
        new BeyTableColumn({ key: 'name', width: 3, isSortable: true, isHideable: false }),
        new BeyTableColumn({ key: 'status', width: 2, isSortable: true }),
        new BeyTableColumn({ key: 'joinedAt', width: 2, isSortable: true, isVisible: false }),
        new BeyTableColumn({ key: 'skills', width: 3 }),
        new BeyTableColumn({ key: 'action', width: '6rem', isHideable: false })
    ],
    items: this.people,
    loadRow: item => [
        new BeyTextTableCell({ content: item.name, icon: faUser }),
        new BeyBadgeTableCell({
            badges: [new BeyBadgeConfig({ label: `myApp.team.status.${item.status}`, variant: BeyBadgeVariant.Success })],
            translate: true
        }),
        new BeyDateTableCell({ value: item.joinedAt }),
        new BeyTagsTableCell({ tags: item.skills }),
        new BeyLinkTableCell({ action: () => this.open(item), content: 'myApp.team.open', translate: true })
    ],
    selectedItemsChange: (items, indexes) => this.selection.set(items),
    onSortChange: sort => this.load(sort)
});
```

```html
<bey-table [config]="table" />
```

The rows are drawn again whenever the language changes, keeping the selection, so a `loadRow` that translates its
texts itself (`instant`, a label with parameters) follows the language.

`BeyTableConfig<T>` is generic over the item: `loadRow`, `isRowSelected`, `selectedItemsChange` and the drag
callbacks see `T`, so a table is always built from a typed model, never from a loose record.

## BeyTableConfig

| Field                 | Required | Default | Meaning                                                                               |
| --------------------- | -------- | ------- | ------------------------------------------------------------------------------------- |
| `prefix`              | yes      |         | i18n prefix: headers are `<prefix>.columns.<key>`, the empty message `<prefix>.empty` |
| `columns`             | yes      |         | The columns, in order                                                                 |
| `loadRow`             | yes      |         | Turns an item into one cell per column; the missing trailing cells are drawn empty    |
| `items`               | no       | `[]`    | The rows                                                                              |
| `height`              | no       | `60vh`  | Height of the scrolling area, any CSS length                                          |
| `selectable`          | no       | `true`  | Shows the selection column                                                            |
| `isRowSelected`       | no       |         | Marks the rows that start selected                                                    |
| `selectedItemsChange` | no       |         | Run with the selected items and their indexes on every change                         |
| `sort`                | no       |         | The `BeyTableSort` the headers show, `{ field, direction }`                           |
| `onSortChange`        | no       |         | Run with the new `BeyTableSort`, or `null`, when a sortable header is clicked         |
| `storageKey`          | no       |         | Offers the columns menu and keeps the choice of the user in `localStorage` under it   |
| `isRowDraggable`      | no       |         | Marks the rows that can be dragged; without it none can                               |
| `isDropAllowed`       | no       |         | Whether a row accepts the dragged rows, `(target, items)`                             |
| `onRowDrop`           | no       |         | Run with the row dropped onto and the dragged rows, `(target, items)`                 |

## BeyTableColumn

| Field        | Default | Meaning                                                                                 |
| ------------ | ------- | --------------------------------------------------------------------------------------- |
| `key`        |         | Names the column; the header reads `<prefix>.columns.<key>` as a kebab-case segment     |
| `width`      | `10`    | A number is the share of the row the column gets; a string is a CSS track used as it is |
| `label`      |         | A full translation key for the header and the columns menu, used as it is               |
| `tooltip`    |         | A full translation key for the header tooltip, used as it is                            |
| `isSortable` | `false` | Turns the header into a button that sorts by the column                                 |
| `sortField`  | `key`   | The field the sort of the column names                                                  |
| `isVisible`  | `true`  | Whether the column shows until the user chooses otherwise                               |
| `isHideable` | `true`  | Whether the columns menu lists it; a column that is not hideable always shows           |

Two columns of width 3 and 1 split the row 75 / 25, and the shares spread over the columns that are shown, so
hiding one widens the others. A string width (`8rem`, `minmax(6rem, 1fr)`) fixes the track instead. A column
`createdAt` reads `<prefix>.columns.created-at`, and one with a `label` reads that key instead, for a column the
screen does not name itself, such as the owner column of `bey-page`.

## Cells

| Cell                | Fields                      | Shows                                                        |
| ------------------- | --------------------------- | ------------------------------------------------------------ |
| `BeyTextTableCell`  | `content`, `icon`           | The text, one line, cut with an ellipsis                     |
| `BeyLinkTableCell`  | `content`, `action`, `icon` | A link that runs `action` without selecting the row          |
| `BeyBadgeTableCell` | `badges: BeyBadgeConfig[]`  | One `bey-badge` per entry                                    |
| `BeyTagsTableCell`  | `tags: string[]`            | One outline `bey-badge` per tag, never translated            |
| `BeyDateTableCell`  | `value`, `format`           | The date in the app locale, nothing when there is no `value` |

Every cell takes an optional `tooltip`, which always goes through the translate pipe, and `tooltipItems`, which shows
the tooltip as a list under the `tooltip` as its title (the templates that use a file). The text, link and badge
cells also take `translate`, which runs the content and the badges through it too.

The text and link cells take an optional `icon`, a FontAwesome `IconDefinition` drawn before the content in the
muted text colour and hidden from screen readers. On a link it is part of the link, so clicking it runs
`action` too.

`BeyDateTableCell` takes a timestamp, an ISO string or a `Date`, and formats it with Angular's `formatDate` in
the locale of `LOCALE_ID`. `format` is any `formatDate` format and defaults to `mediumDate` (`Sep 28, 2026`,
`28 sept 2026`). A locale other than `en-US` needs its data registered by the app, as for the `date` pipe.

## Selection

Clicking a row toggles it; the header checkbox selects or clears every row and is indeterminate in between.
The table owns that state from `isRowSelected` onwards and calls `selectedItemsChange` after each change. A
replaced config starts over: new rows, the selection `isRowSelected` says, and the scroll back at the top.

## Sort

A column with `isSortable` draws its header as a button named by the header text, with an arrow that shows the
state: both ways while it does not sort, up for ascending, down for descending. Each click goes from none to
ascending, descending and none again, and clicking another column starts it ascending; the header carries
`aria-sort` (`none`, `ascending` or `descending`), so the state is announced too. The table calls `onSortChange`
with `{ field, direction }`, `field` being the `sortField` of the column and `direction` a `BeyTableSortDirection`,
or with `null` once the sort is cleared. The table does not reorder its items: the consumer answers with them in
that order, as `bey-page` does by asking the backend. `sort` sets the state the headers start from, and a replaced
config starts over from its own.

## Columns

With a `storageKey` the end of the header row holds a columns menu, named
`angular-components.table.columns.label`, with a checkbox per hideable column and a button that restores the
defaults (`angular-components.table.columns.reset`). The last column shown cannot be unticked, and whatever the
choices say, at least one column shows. The choice is kept in `localStorage` under
`bey-table-columns.<storageKey>`, through `BeyStorageService`, so `provideBeyTesting` keeps it in memory; a storage
that cannot be read or written leaves the defaults, and a column added to the config later shows as its `isVisible`
says. The menu opens below its button over the page, and closes on Escape, on a click or a focus outside it and on a
scroll around it. Without a `storageKey` there is no menu and the columns show as `isVisible` says.

## Drag and drop

A row `isRowDraggable` accepts can be dragged with the native drag and drop of the browser, and dragging a selected
row drags the whole selection. While rows are dragged, a row `isDropAllowed(target, items)` accepts is a drop target,
highlighted while the pointer is over it, and dropping there runs `onRowDrop(target, items)`; every other row
refuses the drop. Drag and drop is mouse only, so whatever it does needs another way in from the keyboard, such as
the `move` action of `bey-page`.

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
| `--bey-table-sort-accent`          | `--bey-primary`        |
| `--bey-table-row-drop-target`      | `--bey-bg-active`      |
| `--bey-table-drop-target-border`   | `--bey-primary`        |
| `--bey-table-menu-surface`         | `--bey-bg-surface`     |
