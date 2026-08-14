# Header Component (`bey-header`)

Model-driven page header component with an optional back button, title + status badge, and a single group of
actions (left, more-actions menu, right — in that order) aligned to the end of the header.

Supported capabilities:

-   Optional back button (`backAction`), rendered before the title.
-   Title + optional badge, both with translation support.
-   `leftActions`, `menuActions` and `rightActions` all render together, right-aligned, in that order — the
    zone names describe intent/grouping, not screen position.
-   More-actions menu (⋯) for secondary actions.
-   Button variants: primary, secondary, and text.
-   Optional icons per action.
-   Per-action dropdown: any action with `subActions` renders as a toggle button opening its own panel, instead of executing directly.
-   Default i18n key generation from `prefix` and action `key`.

---

## Quick start

```ts
import { BeyHeaderAction, BeyHeaderActionType, BeyHeaderConfig } from '@beyonda-labs/angular-components';
import { faArrowLeft, faFloppyDisk, faPen } from '@fortawesome/free-solid-svg-icons';

const header = new BeyHeaderConfig({
    prefix: 'userDetail.header',
    title: 'userDetail.header.title',
    badge: { text: 'userDetail.header.badge' },
    backAction: new BeyHeaderAction({
        key: 'back',
        type: BeyHeaderActionType.Text,
        icon: faArrowLeft,
        action: () => console.log('Back')
    }),
    rightActions: [
        new BeyHeaderAction({
            key: 'edit',
            type: BeyHeaderActionType.SecondaryButton,
            icon: faPen,
            action: () => console.log('Edit')
        }),
        new BeyHeaderAction({
            key: 'save',
            type: BeyHeaderActionType.PrimaryButton,
            icon: faFloppyDisk,
            action: () => console.log('Save')
        })
    ],
    menuActions: [
        new BeyHeaderAction({
            key: 'archive',
            type: BeyHeaderActionType.Text,
            action: () => console.log('Archive')
        }),
        new BeyHeaderAction({
            key: 'delete',
            type: BeyHeaderActionType.Text,
            action: () => console.log('Delete')
        })
    ]
});
```

```html
<bey-header [config]="header"></bey-header>
```

---

## Layout

The header has two groups:

-   **Start** — `backAction` (if set) → `title` → `badge` (if set).
-   **End** — `leftActions`, then the `menuActions` (⋯) toggle, then `rightActions`, all concatenated into one
    right-aligned group, in that order.

The title truncates with an ellipsis and exposes the full text as a native `title` attribute (tooltip on hover)
so a long value never pushes the badge/actions out of view. Truncation only kicks in once a max-width is set —
by default the title has none (`font-size: 2rem`, no cap, matching prior behavior). Consumers that need a
smaller, width-constrained title (e.g. a header embedded next to other controls) can override it per instance
via CSS custom properties on the host:

```css
:host {
    --bey-header-title-font-size: 1.2rem;
    --bey-header-title-max-width: 22rem;
}
```

`leftActions`/`rightActions` are still separate config fields — useful for keeping "primary" vs "secondary"
actions organized in code — but they render adjacent to each other, not on opposite sides of the header.

---

## Sub-actions dropdown

Any action can render as a dropdown toggle instead of a direct click by providing `subActions`.
The toggle uses the parent action's own `icon`/`label`/`tooltip`; clicking it opens a panel listing one button
per sub-action.

```ts
rightActions: [
    new BeyHeaderAction({
        key: 'create',
        type: BeyHeaderActionType.PrimaryButton,
        icon: faPlus,
        subActions: [
            new BeyHeaderAction({
                key: 'create-item',
                type: BeyHeaderActionType.Text,
                action: () => console.log('Create item')
            }),
            new BeyHeaderAction({
                key: 'create-category',
                type: BeyHeaderActionType.Text,
                action: () => console.log('Create category')
            })
        ]
    })
]
```

---

## Models

### `BeyHeaderConfig`

The root configuration object passed to `[config]`.

| Parameter      | Type                | Required | Default | Description                                          |
| -------------- | ------------------- | -------- | ------- | ---------------------------------------------------- |
| `prefix`       | `string`            | yes      | -       | Base prefix used to resolve default action i18n keys |
| `title`        | `string`            | no       | `''`    | Header title translation key                         |
| `variant`      | `BeyHeaderVariant`  | no       | `BeyHeaderVariant.Page` | Controls the title size/spacing — `Page` for a top-level page header, `SubPage` for a smaller header nested inside another view |
| `badge`        | `BeyHeaderBadge`    | no       | -       | Small pill rendered next to the title; translated if present, hidden if omitted |
| `backAction`   | `BeyHeaderAction`    | no       | -       | Optional back button rendered before the title        |
| `leftActions`  | `BeyHeaderAction[]` | no       | `[]`    | Actions rendered first in the end-aligned action group |
| `rightActions` | `BeyHeaderAction[]` | no       | `[]`    | Actions rendered last in the end-aligned action group  |
| `menuActions`  | `BeyHeaderAction[]` | no       | `[]`    | Actions inside the more-actions menu (⋯), rendered between `leftActions` and `rightActions` |

### `BeyHeaderBadge`

| Parameter  | Type     | Required | Default | Description                                    |
| ---------- | -------- | -------- | ------- | ----------------------------------------------- |
| `text`     | `string` | yes      | -       | Badge translation key, passed through `translate` |
| `cssClass` | `string` | no       | -       | CSS class(es) applied to the badge element, replacing its default colors — any palette class (`bey-badge-color-*`) works |

### `BeyHeaderVariant`

| Value                       | Description                                            |
| ---------------------------- | ------------------------------------------------------ |
| `BeyHeaderVariant.Page`      | Larger title (`fs-2`), for a top-level page header      |
| `BeyHeaderVariant.SubPage`   | Smaller title (`fs-4`), for a header nested in a view   |

---

### `BeyHeaderAction`

| Parameter | Type                  | Required | Default          | Description                                    |
| --------- | --------------------- | -------- | ---------------- | ---------------------------------------------- |
| `key`     | `string`              | yes      | -                | Unique action key used for default i18n lookup |
| `type`    | `BeyHeaderActionType` | yes      | -                | Visual style of the rendered button            |
| `action`  | `() => void`          | no       | no-op            | Click handler                                  |
| `disabled` | `boolean`            | no       | `false`          | Disables the rendered button                   |
| `icon`    | `IconDefinition`      | no       | -                | Optional Font Awesome icon                     |
| `label`   | `string`              | no       | `${key}.label`   | Label translation key                          |
| `subActions` | `BeyHeaderAction[]` | no    | -                | Renders this action as a dropdown toggle listing these actions instead of calling `action` on click |
| `tooltip` | `string`              | no       | `${key}.tooltip` | Tooltip translation key                        |

An action with `subActions` uses its own `icon`/`label`/`tooltip` for the toggle button; clicking it
opens a panel with one button per sub-action (each a full `BeyHeaderAction`, own key/icon/label).
Only one dropdown (or the ⋯ menu) is open at a time; it closes on selection, outside click and Escape.

`backAction` is a plain `BeyHeaderAction` too — `subActions` on it would technically render a dropdown, but
that's not a meaningful use case; keep it a simple click action.

### `BeyHeaderActionType`

| Value                                 | Description                          |
| ------------------------------------- | ------------------------------------ |
| `BeyHeaderActionType.PrimaryButton`   | Renders a primary filled button      |
| `BeyHeaderActionType.SecondaryButton` | Renders a secondary outlined button  |
| `BeyHeaderActionType.Text`            | Renders a tertiary text-style button |
| `BeyHeaderActionType.Icon`            | Renders the icon alone, with the label available as a tooltip |

---

## i18n convention

With `prefix = 'userDetail.header'` and an action with `key = 'save'`:

| Key pattern                      | Example                                  | Description            |
| --------------------------------- | ---------------------------------------- | ----------------------- |
| `title` value                    | `userDetail.header.title`                | Header title key       |
| `badge` value                    | `userDetail.header.badge`                | Badge key (opt-in — omit `badge` to hide it, no default key is generated) |
| `{prefix}.actions.{key}.label`   | `userDetail.header.actions.save.label`   | Default action label   |
| `{prefix}.actions.{key}.tooltip` | `userDetail.header.actions.save.tooltip` | Default action tooltip |

Behavior notes:

-   `title` and `badge` are rendered as-is and passed through the `translate` pipe.
-   If `label` or `tooltip` keep their default `${key}.label` / `${key}.tooltip` values, the component expands them with `prefix` automatically.
-   If you provide custom `label` or `tooltip` values, they are used as-is and still passed through `translate`.

---

## Best practices

-   Keep action `key` values stable so translation keys remain predictable.
-   Use `Text` for low-emphasis navigation actions and reserve `PrimaryButton` for the main page action.
-   Move secondary or infrequent actions to `menuActions`; keep at most 2-3 buttons per visible group.
-   Menu entries render as standard action buttons, so `type` applies as in any other zone; `Text` usually fits best. The dropdown closes on selection, on outside click and on Escape.
-   Pass fully qualified translation keys when an action label should not follow the component `prefix`.
-   Prefer keeping business logic inside the `action` callback and leave the header config itself as a pure view model.
