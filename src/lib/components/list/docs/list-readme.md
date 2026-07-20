# List Component (`bey-list`)

Vertical list of cards with fully custom HTML per card, projected through an `<ng-template>`. The
component owns the generic shell (vertical stacking, spacing, empty state, optional clickable
card chrome) while the consumer's template owns the card's layout, texts and per-app styles.

Supported capabilities:

-   Custom HTML per card via content projection (`let-item`, `let-index`).
-   Consistent card shell (border, radius, hover) shared across every list, or `bare` for full
    layout control from the consumer's own template.
-   Optional whole-card click handler, keyboard-accessible (`Enter` / `Space`).
-   Configurable gap between cards.
-   Empty state via i18n.

---

## Quick start

```ts
import { BeyListConfig } from '@beyonda-labs/angular-components';

interface Employee {
    id: number;
    name: string;
    role: string;
}

readonly config = new BeyListConfig<Employee>({
    prefix: 'employees.list',
    items: [
        { id: 1, name: 'Ada Lovelace', role: 'Engineering' },
        { id: 2, name: 'Linus Torvalds', role: 'Platform' }
    ],
    onItemClick: employee => this.openEmployee(employee)
});
```

```html
<bey-list [config]="config">
    <ng-template let-employee let-index="index">
        <div class="employee-card">
            <span class="employee-card__index">{{ index + 1 }}</span>
            <div>
                <h4 class="employee-card__name">{{ employee.name }}</h4>
                <p class="employee-card__role">{{ employee.role }}</p>
            </div>
        </div>
    </ng-template>
</bey-list>
```

The `<ng-template>` receives the item as the default context variable (`let-employee`) and its
index as `let-index="index"`; both are typed `unknown` in the template (cast as needed), matching
the model-driven, consumer-owned-render convention used by `bey-table`'s `loadRow`.

---

## `BeyListConfig`

| Parameter     | Type                                       | Required | Default    | Description                                                             |
| ------------- | ------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------ |
| `items`       | `TItem[]`                                   | yes      | —          | Items to render, one card each                                          |
| `prefix`      | `string`                                    | yes      | —          | i18n prefix; used to build the default empty-state key (`{prefix}.empty`) |
| `bare`        | `boolean`                                   | no       | `false`    | Disables the default card shell (border/padding/background); layout only |
| `emptyLabel`  | `string`                                    | no       | —          | Overrides the default `{prefix}.empty` key                              |
| `gap`         | `string`                                    | no       | `'0.75rem'`| CSS `gap` between cards                                                  |
| `getItemKey`  | `(item: TItem, index: number) => string \| number` | no | index | Stable identity for `@for`'s `track`; falls back to the item's index    |
| `onItemClick` | `(item: TItem, index: number) => void`      | no       | —          | Makes the whole card clickable/keyboard-activatable (`role="button"`)   |

---

## Behavior

-   Without `onItemClick`, cards are plain containers (no `role`/`tabindex`, no pointer cursor).
-   With `onItemClick`, each card gets `role="button"`, `tabindex="0"`, a pointer cursor, a hover
    elevation, and responds to `Enter`/`Space` in addition to click.
-   `bare: true` strips the shell entirely (no border, padding or background) so the projected
    template fully controls the card's appearance; the component still manages stacking, gap,
    empty state and (if provided) the click/keyboard behavior.
-   The empty state renders `{prefix}.empty` (or `emptyLabel`) when `items` is empty.

---

## i18n

Fully consumer-owned: define `{prefix}.empty` in your own translation files. The component ships
no library-level translation keys.
