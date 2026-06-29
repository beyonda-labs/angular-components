# Breadcrumb Component (`bey-breadcrumb`)

Model-driven breadcrumb navigation with automatic overflow handling, optional icons, and disabled state. The consumer handles navigation via the `onItemClick` callback.

Supported capabilities:

-   Horizontal breadcrumb trail with configurable separator.
-   Automatic overflow: collapses leading items into `"..."` when the container is too narrow.
-   Tooltip on collapsed indicator showing hidden item labels.
-   Tooltip on each item for truncated text (controlled by `itemMaxWidth`).
-   Optional FontAwesome icon per item.
-   Disabled state per item.
-   Prefix-based i18n label resolution through `ngx-translate`.
-   Optional `translate` flag to disable i18n and use raw labels directly.
-   Callback on item click (except the last item, which represents the current page).
-   ARIA `nav` landmark with `aria-current="page"` on the last item.
-   Themeable via CSS custom properties.

---

## Quick start

```ts
import { BeyBreadcrumbComponent, BeyBreadcrumbConfig, BeyBreadcrumbItem } from '@beyonda-labs/angular-components';

const breadcrumbConfig = new BeyBreadcrumbConfig({
    prefix: 'myPage',
    items: [
        new BeyBreadcrumbItem({ key: 'home' }),
        new BeyBreadcrumbItem({ key: 'products' }),
        new BeyBreadcrumbItem({ key: 'detail' })
    ],
    onItemClick: key => {
        console.log('Navigate to:', key);
    }
});
```

```html
<bey-breadcrumb [config]="breadcrumbConfig"></bey-breadcrumb>
```

i18n keys follow the prefix convention:

```json
{
    "myPage": {
        "breadcrumb": {
            "home": { "label": "Home" },
            "products": { "label": "Products" },
            "detail": { "label": "Product detail" }
        }
    }
}
```

### Without translations

Set `translate: false` to use raw labels directly without i18n:

```ts
const breadcrumbConfig = new BeyBreadcrumbConfig({
    translate: false,
    items: [
        new BeyBreadcrumbItem({ key: 'home', label: 'Home' }),
        new BeyBreadcrumbItem({ key: 'products', label: 'Products' }),
        new BeyBreadcrumbItem({ key: 'detail', label: 'Product detail' })
    ],
    onItemClick: key => {
        console.log('Navigate to:', key);
    }
});
```

---

## Models

### `BeyBreadcrumbConfig`

The root configuration object passed to `[config]`.

| Parameter      | Type                    | Required | Default   | Description                                            |
| -------------- | ----------------------- | -------- | --------- | ------------------------------------------------------ |
| `prefix`       | `string`                | no       | `''`      | i18n prefix for label resolution                       |
| `items`        | `BeyBreadcrumbItem[]`   | yes      | —         | Array of breadcrumb item definitions                   |
| `separator`    | `string`                | no       | `'/'`     | Text displayed between items                           |
| `itemMaxWidth` | `string`                | no       | `'12rem'` | CSS max-width for each item label (enables truncation) |
| `translate`    | `boolean`               | no       | `true`    | Whether to translate labels via `ngx-translate`        |
| `onItemClick`  | `(key: string) => void` | no       | —         | Called when a non-last item is clicked                 |

**Properties:**

| Property       | Type                  | Description              |
| -------------- | --------------------- | ------------------------ |
| `items`        | `BeyBreadcrumbItem[]` | Configured items         |
| `itemMaxWidth` | `string`              | Max width for item label |
| `prefix`       | `string`              | i18n prefix              |
| `separator`    | `string`              | Separator text           |
| `translate`    | `boolean`             | Whether labels are translated |

---

### `BeyBreadcrumbItem`

Defines a single breadcrumb node.

| Parameter    | Type             | Required | Default        | Description                                          |
| ------------ | ---------------- | -------- | -------------- | ---------------------------------------------------- |
| `key`        | `string`         | yes      | —              | Unique identifier for the item                       |
| `icon`       | `IconDefinition` | no       | —              | FontAwesome icon displayed before the label          |
| `isDisabled` | `boolean`        | no       | `false`        | Whether the item is disabled (non-clickable)         |
| `label`      | `string`         | no       | `${key}.label` | Custom label or i18n key (auto-resolved with prefix) |

---

## CSS custom properties

| Variable                           | Default   | Description                     |
| ---------------------------------- | --------- | ------------------------------- |
| `--bey-breadcrumb-text`            | `#6b6b6b` | Non-active item text color      |
| `--bey-breadcrumb-active`          | `#111111` | Current (last) item text color  |
| `--bey-breadcrumb-separator-color` | `#c0c0c0` | Separator and ellipsis color    |
| `--bey-breadcrumb-hover`           | `#2f2f2f` | Hover text color                |
| `--bey-breadcrumb-item-max-width`  | `12rem`   | Max width per item (truncation) |

---

## Overflow behavior

When the breadcrumb trail exceeds the container width, the component automatically collapses leading items:

-   A `"..."` indicator replaces the hidden items.
-   Hovering over `"..."` shows a tooltip listing the collapsed item labels.
-   The calculation uses a `ResizeObserver` and recalculates on container resize.
-   The last visible items are always preserved (stack from the right).

---

## Accessibility

-   The component renders a `<nav>` element with a translated `aria-label`.
-   The last item has `aria-current="page"` and is not interactive.
-   Separator elements have `aria-hidden="true"`.
-   Clickable items are `<button>` elements with `disabled` attribute when applicable.
-   Focus is indicated with a visible outline via `:focus-visible`.

---
