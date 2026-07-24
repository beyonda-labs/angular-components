# Search Component (`bey-search`)

Search bar with a main text input and a filters dropdown panel, designed to filter a table. Supports
text, numeric and boolean filters with per-type operators. Used internally by `bey-page`, but it can
be used standalone.

---

## Quick start

```ts
import {
    BeySearchConfig,
    BeySearchField,
    BeySearchFieldType,
    BeySearchFilter
} from '@beyonda-labs/angular-components';

readonly searchConfig = new BeySearchConfig({
    prefix: 'products.search',
    mainField: 'name',
    fields: [
        new BeySearchField({ key: 'name', type: BeySearchFieldType.Text }),
        new BeySearchField({ key: 'price', type: BeySearchFieldType.Number }),
        new BeySearchField({ key: 'available', type: BeySearchFieldType.Boolean })
    ],
    onFiltersChange: (filters: BeySearchFilter[]) => this.reload(filters)
});
```

```html
<bey-search [config]="searchConfig"></bey-search>
```

---

## `BeySearchConfig`

| Parameter         | Type                                | Required | Description                                                                 |
| ----------------- | ----------------------------------- | -------- | --------------------------------------------------------------------------- |
| `fields`          | `BeySearchField[]`                  | yes      | Catalog of filterable fields shown in the panel                             |
| `prefix`          | `string`                            | yes      | i18n prefix: field labels resolve to `{prefix}.fields.{key}`                |
| `mainField`       | `string`                            | no       | Field key bound to the main search input; without it only the button shows  |
| `onFiltersChange` | `(filters: BeySearchFilter[]) => void` | no    | Called with the combined filters every time they change                     |
| `placeholder`     | `string`                            | no       | Main input placeholder key; defaults to `angular-components.search.placeholder` |

### `BeySearchField`

| Parameter | Type                     | Description                                                                          |
| --------- | ------------------------ | ------------------------------------------------------------------------------------- |
| `key`     | `string`                 | Backend field name (also i18n segment)                                                |
| `type`    | `BeySearchFieldType`     | `Text`, `Number`, `Boolean`, `Select` or `Tags`                                        |
| `options` | `BeySearchFieldOption[]` | Required for `Select` — the bounded `{ value, label }` choices (`label` is translated) |

### Operators by type

| Type      | Operators                                                                       |
| --------- | ------------------------------------------------------------------------------- |
| `Text`    | contains, notContains, equals, notEquals, startsWith, endsWith                  |
| `Number`  | equals, notEquals, greaterThan(OrEquals), lessThan(OrEquals), between (min–max) |
| `Boolean` | equals, notEquals (Yes/No select)                                               |
| `Select`  | equals, notEquals (dropdown of `options`) — for a field with a known, bounded set of values (e.g. an enum/status), so the user can't type an invalid value |
| `Tags`    | contains, notContains — matches against a whole array element, not a substring (pair with a backend `FieldStringArraySchema` field, e.g. `express-components`' `base-entity`) |

```ts
new BeySearchField({
    key: 'status',
    type: BeySearchFieldType.Select,
    options: [
        { value: 'draft', label: 'products.search.status.draft' },
        { value: 'published', label: 'products.search.status.published' }
    ]
})
```

---

## Behavior

-   Typing in the main input creates a filter on `mainField` (contains for text fields, equals for
    numeric ones) with a 300 ms debounce — it is a regular filter, not a separate text search.
-   The Filters button opens the panel: rows of field + operator + value, plus "Add filter",
    "Clear all" and "Apply filter". The applied filter count shows as a badge on the button.
-   `between` renders two grouped inputs (from–to) that read as a single field.
-   Incomplete rows are ignored on apply. Applying closes the panel; clicking outside also closes it.
-   `onFiltersChange` always receives the main filter (if any) plus the applied panel filters, as
    `BeyStringFilter` / `BeyNumberFilter` / `BeyBooleanFilter` instances.

---

## i18n

Library keys (already translated) under `angular-components.search.*`: `filters`, `placeholder`,
`empty.title`, `empty.description`, `field-placeholder`, `value-placeholder`, `from-placeholder`,
`to-placeholder`, `add`, `apply`, `clear`, `remove`, `operators.*`, `values.true|false`.

Consumer keys: `{prefix}.fields.{key}` for each filterable field label.
