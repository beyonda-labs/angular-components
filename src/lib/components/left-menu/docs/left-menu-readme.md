# Left Menu Component (`bey-left-menu`)

Model-driven side navigation component with branding, nested actions, optional user info, and collapsible behavior.

Supported capabilities:

-   Expand/collapse state controlled by config and user interaction.
-   Top and bottom action groups.
-   Nested sub-actions with inline expansion or collapsed flyout.
-   Active and disabled action states.
-   Optional brand icon and custom title classes.
-   Optional user footer with generated initials.

---

## Quick start

```ts
import {
    BeyLeftMenuAction,
    BeyLeftMenuConfig,
    BeyLeftMenuTitle,
    BeyLeftMenuUserInfo
} from '@beyonda-labs/angular-components';
import { faChartLine, faGear, faHouse, faUsers } from '@fortawesome/free-solid-svg-icons';

const menu = new BeyLeftMenuConfig({
    prefix: 'workspaceMenu',
    title: new BeyLeftMenuTitle({
        title: 'workspaceMenu.title',
        icon: 'assets/logo.svg',
        styles: 'fw-bold text-uppercase'
    }),
    expanded: true,
    topActions: [
        new BeyLeftMenuAction({
            key: 'home',
            icon: faHouse,
            active: true,
            action: () => console.log('Home')
        }),
        new BeyLeftMenuAction({
            key: 'reports',
            icon: faChartLine,
            subActions: [
                new BeyLeftMenuAction({
                    key: 'sales',
                    action: () => console.log('Sales report')
                }),
                new BeyLeftMenuAction({
                    key: 'team',
                    icon: faUsers,
                    action: () => console.log('Team report')
                })
            ]
        })
    ],
    bottomActions: [
        new BeyLeftMenuAction({
            key: 'settings',
            icon: faGear,
            action: () => console.log('Settings')
        })
    ],
    userInfo: new BeyLeftMenuUserInfo({
        name: 'Ada',
        surname: 'Lovelace',
        email: 'ada@example.com'
    })
});
```

```html
<bey-left-menu [config]="menu"></bey-left-menu>
```

---

## Models

### `BeyLeftMenuConfig`

The root configuration object passed to `[config]`.

| Parameter       | Type                  | Required | Default | Description                                            |
| --------------- | --------------------- | -------- | ------- | ------------------------------------------------------ |
| `prefix`        | `string`              | yes      | -       | Base prefix used to resolve title and action i18n keys |
| `title`         | `BeyLeftMenuTitle`    | yes      | -       | Brand/title configuration                              |
| `topActions`    | `BeyLeftMenuAction[]` | no       | `[]`    | Main navigation actions                                |
| `bottomActions` | `BeyLeftMenuAction[]` | no       | `[]`    | Secondary actions rendered below the separator         |
| `expanded`      | `boolean`             | no       | `true`  | Initial expanded state                                 |
| `userInfo`      | `BeyLeftMenuUserInfo` | no       | -       | Optional user footer information                       |

Behavior notes:

-   When the user toggles the menu, the component updates both its internal state and `config.expanded`.
-   When expanded, submenus open inline.
-   When collapsed, actions with `subActions` open a flyout panel on hover/focus/click.

---

### `BeyLeftMenuTitle`

| Parameter | Type     | Required | Default | Description                                |
| --------- | -------- | -------- | ------- | ------------------------------------------ |
| `title`   | `string` | no       | `title` | Brand title translation key or literal key |
| `icon`    | `string` | no       | `''`    | Image source used in the brand area        |
| `styles`  | `string` | no       | `''`    | Extra CSS classes applied to the title     |

If `title` is omitted or left as `title`, the component resolves it as `{prefix}.title`.

---

### `BeyLeftMenuAction`

| Parameter    | Type                  | Required | Default          | Description                                    |
| ------------ | --------------------- | -------- | ---------------- | ---------------------------------------------- |
| `key`        | `string`              | yes      | -                | Unique action key used for default i18n lookup |
| `action`     | `() => void`          | no       | -                | Click handler                                  |
| `icon`       | `IconDefinition`      | no       | -                | Optional Font Awesome icon                     |
| `active`     | `boolean`             | no       | `false`          | Marks the action as currently selected         |
| `disabled`   | `boolean`             | no       | `false`          | Disables interaction                           |
| `label`      | `string`              | no       | `${key}.label`   | Label translation key                          |
| `tooltip`    | `string`              | no       | `${key}.tooltip` | Tooltip translation key                        |
| `subActions` | `BeyLeftMenuAction[]` | no       | `[]`             | Nested child actions                           |

Behavior notes:

-   If an action has `subActions`, clicking it toggles the submenu.
-   If that same action also defines `action`, the callback still runs after toggling.
-   Parent actions receive a visual selected state when any descendant is active.

---

### `BeyLeftMenuUserInfo`

| Parameter  | Type     | Required | Default | Description                                             |
| ---------- | -------- | -------- | ------- | ------------------------------------------------------- |
| `name`     | `string` | yes      | -       | User first name                                         |
| `surname`  | `string` | no       | `''`    | User surname                                            |
| `email`    | `string` | no       | `''`    | User email shown in the footer                          |
| `initials` | `string` | no       | derived | Avatar initials; generated from name/surname if omitted |

---

## i18n convention

With `prefix = 'workspaceMenu'` and an action with `key = 'settings'`:

| Key pattern                      | Example                                  | Description            |
| -------------------------------- | ---------------------------------------- | ---------------------- |
| `{prefix}.title`                 | `workspaceMenu.title`                    | Default brand title    |
| `{prefix}.actions.{key}.label`   | `workspaceMenu.actions.settings.label`   | Default action label   |
| `{prefix}.actions.{key}.tooltip` | `workspaceMenu.actions.settings.tooltip` | Default action tooltip |

Behavior notes:

-   If `label` or `tooltip` keep their default `${key}.label` / `${key}.tooltip` values, the component expands them with `prefix` automatically.
-   If you provide custom `label` or `tooltip` values, they are used as-is and still passed through `translate`.
-   Section headings and toggle labels are internal library translations and are not part of the consumer-facing i18n contract.
-   When the menu is collapsed, action buttons use the label as tooltip fallback unless a flyout submenu is open.

---

## Best practices

-   Keep `topActions` for main navigation and reserve `bottomActions` for lower-frequency items such as settings or support.
-   Mark only one branch as active when possible so auto-open submenu behavior stays predictable.
-   Use stable action `key` values because they drive both translations and submenu path tracking.
-   Provide `userInfo.initials` only when business rules require a custom avatar value; otherwise let the model derive it.
-   Prefer icons on first-level actions so the collapsed menu remains understandable.
