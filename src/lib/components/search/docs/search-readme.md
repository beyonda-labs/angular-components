# Search

A quick search box plus a panel of typed filter rows. The component owns the draft rows and reports the
filters that are complete; running the query is the consumer's job.

## Usage

```ts
const search = new BeySearchConfig({
    prefix: 'myPage.search',
    mainField: 'name',
    fields: [
        new BeySearchField({ key: 'name', type: BeySearchFieldType.Text }),
        new BeySearchField({ key: 'age', type: BeySearchFieldType.Number })
    ],
    onFiltersChange: filters => this.load(filters)
});
```

```html
<bey-search [config]="search"></bey-search>
```

## BeySearchConfig

| Field             | Required | Default                | Meaning                                                    |
| ----------------- | -------- | ---------------------- | ---------------------------------------------------------- |
| `prefix`          | yes      |                        | i18n prefix the field labels are built from                 |
| `fields`          | yes      |                        | What can be filtered, and how                               |
| `mainField`       | no       | none                   | Key of the field the quick search box writes to             |
| `filters`         | no       | `[]`                   | The filters the box and the panel start from                |
| `placeholder`     | no       | the library's default  | Placeholder of the quick search box                         |
| `onFiltersChange` | no       |                        | Called with the complete filters whenever they change       |
| `onPanelOpen`     | no       |                        | Called every time the filters panel opens                   |

## BeySearchField

| Field       | Required | Meaning                                                                         |
| ----------- | -------- | ------------------------------------------------------------------------------- |
| `key`       | yes      | Field name, reported as the filter's `field`                                     |
| `type`      | yes      | `Text`, `Number`, `Boolean`, `Select` or `Tags`; decides the operators            |
| `options`   | no       | Required by `Select`: the values offered                                          |
| `label`     | no       | A full translation key for the field, used as it is in place of the prefix one    |
| `operators` | no       | Narrows the operators of the type to these                                        |

The label of a field uses its key as a kebab-case segment: `createdBy` reads `<prefix>.fields.created-by`,
while the filter keeps reporting `createdBy` as its `field`. A `label` replaces that key, for a field that the
screen does not define itself, such as the owner filter `bey-page` adds.

Each type brings its own operators: text compares and matches, number adds ranges and `Between`, boolean and
select only equality, and tags match a whole element of an array rather than a substring. `operators` keeps only
the ones it lists, still in the order of the type: `[BeySearchFilterOperator.Equals]` on a select leaves out
`NotEquals`. `beySearchFieldOperators(field)` returns them in the order the panel offers them; a new row starts with
the first.

`onPanelOpen` lets a screen fetch what only the panel needs, such as the options of a field, the first time the user
looks for it. A new config with the new fields keeps the panel open, its rows starting again from its `filters`.

## Behaviour

Typing in the quick search box is reported after 300 ms, as a row on `mainField`. That row stays editable in
the panel: change its operator by hand and further typing keeps it. Emptying the box removes the row.

Rows built in the panel are reported when Apply is used, and only those that are complete: a field, an
operator and a value that fits the type. Clear empties the box, the rows and the reported filters at once.

The panel closes on Apply, on Escape and on a click outside.

A new config starts again from its `filters`: the box shows the value of the one on `mainField`, the panel one row
per filter, and nothing is reported until the user changes them. A screen that keeps the search while it rebuilds
the config passes the filters in force, as `bey-page` does when it comes back to a search.

## Theming

| Variable                      | Default                |
| ----------------------------- | ---------------------- |
| `--bey-search-fg`             | `--bey-text-primary`   |
| `--bey-search-fg-muted`       | `--bey-text-muted`     |
| `--bey-search-border`         | `--bey-border-subtle`  |
| `--bey-search-surface`        | `--bey-bg-surface`     |
| `--bey-search-placeholder`    | `--bey-text-disabled`  |
