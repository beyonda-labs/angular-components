# Tabs Component (`bey-tabs`)

Model-driven horizontal tab bar with keyboard navigation, optional icons, and disabled state. The consumer renders content based on the active tab key.

Supported capabilities:

-   Horizontal tab bar with underline active indicator.
-   Keyboard navigation with Arrow keys, Home, and End.
-   Optional FontAwesome icon per tab.
-   Disabled state per tab.
-   Tooltip support per tab.
-   Prefix-based i18n label resolution through `ngx-translate`.
-   Programmatic tab switching via `config.setActiveTab()`.
-   Callback on tab change.
-   ARIA roles and attributes for screen readers.
-   Themeable via CSS custom properties.

---

## Quick start

```ts
import { BeyTabsComponent, BeyTabsConfig, BeyTab } from '@beyonda-labs/angular-components';

const tabsConfig = new BeyTabsConfig({
    prefix: 'myPage',
    tabs: [new BeyTab({ key: 'overview' }), new BeyTab({ key: 'details' }), new BeyTab({ key: 'history' })],
    onTabChange: key => {
        console.log('Active tab:', key);
    }
});
```

```html
<bey-tabs [config]="tabsConfig"></bey-tabs>

@switch (tabsConfig.activeTab) { @case ('overview') {
<app-overview />
} @case ('details') {
<app-details />
} @case ('history') {
<app-history />
} }
```

i18n keys follow the prefix convention:

```json
{
    "myPage": {
        "tabs": {
            "overview": { "label": "Overview" },
            "details": { "label": "Details" },
            "history": { "label": "History" }
        }
    }
}
```

---

## Models

### `BeyTabsConfig`

The root configuration object passed to `[config]`.

| Parameter     | Type                    | Required | Default           | Description                        |
| ------------- | ----------------------- | -------- | ----------------- | ---------------------------------- |
| `prefix`      | `string`                | yes      | —                 | i18n prefix for label resolution   |
| `tabs`        | `BeyTab[]`              | yes      | —                 | Array of tab definitions           |
| `activeTab`   | `string`                | no       | first tab's `key` | Key of the initially active tab    |
| `onTabChange` | `(key: string) => void` | no       | —                 | Called when the active tab changes |

**Properties:**

| Property    | Type       | Description            |
| ----------- | ---------- | ---------------------- |
| `activeTab` | `string`   | Key of the current tab |
| `prefix`    | `string`   | i18n prefix            |
| `tabs`      | `BeyTab[]` | Configured tabs        |

**Methods:**

| Method         | Signature                                     | Description                                                                                      |
| -------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `setActiveTab` | `(key: string, emitChange?: boolean) => void` | Switches to a tab programmatically. Skips disabled or same tab. `emitChange` defaults to `true`. |

---

### `BeyTab`

Defines a single tab.

| Parameter    | Type             | Required | Default        | Description                                          |
| ------------ | ---------------- | -------- | -------------- | ---------------------------------------------------- |
| `key`        | `string`         | yes      | —              | Unique identifier for the tab                        |
| `icon`       | `IconDefinition` | no       | —              | FontAwesome icon displayed before the label          |
| `isDisabled` | `boolean`        | no       | `false`        | Whether the tab is disabled                          |
| `label`      | `string`         | no       | `${key}.label` | Custom label or i18n key (auto-resolved with prefix) |
| `tooltip`    | `string`         | no       | `''`           | Tooltip text or i18n key                             |

---

## CSS custom properties

| Variable            | Default   | Description                |
| ------------------- | --------- | -------------------------- |
| `--bey-tabs-accent` | `#111111` | Active tab text and border |
| `--bey-tabs-text`   | `#6b6b6b` | Inactive tab text color    |
| `--bey-tabs-border` | `#ebebeb` | Tab bar bottom border      |
| `--bey-tabs-hover`  | `#2f2f2f` | Hover text color           |

---

## Keyboard navigation

| Key          | Action                       |
| ------------ | ---------------------------- |
| `ArrowRight` | Move to next enabled tab     |
| `ArrowLeft`  | Move to previous enabled tab |
| `Home`       | Move to first enabled tab    |
| `End`        | Move to last enabled tab     |

Disabled tabs are skipped during keyboard navigation.

---

## Accessibility

-   The tab bar uses `role="tablist"` with a translated `aria-label`.
-   Each tab uses `role="tab"` with `aria-selected` and managed `tabindex`.
-   Disabled tabs are marked with the `disabled` attribute.

---
