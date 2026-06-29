# App Layout Component (`bey-app-layout`)

Full application shell with a collapsible side menu, dynamic breadcrumb bar, and a projected content area.

Supported capabilities:

-   Collapsible left menu with top and bottom action groups.
-   Nested sub-actions with inline expansion or collapsed flyout (inherited from `bey-left-menu`).
-   Dynamic breadcrumb updated at runtime via `BeyAppLayoutService`.
-   Active menu action state managed via service.
-   Content projection for the main page area.
-   Optional user info footer in the side menu.
-   Footer bar with org branding, product name, and optional legal links (terms and privacy).
-   Lifecycle callbacks: initialization, menu action clicks, and breadcrumb item clicks.
-   i18n support for all menu labels and tooltips through `ngx-translate`.

---

## Quick start

```ts
import {
    BeyAppLayoutBreadcrumbItem,
    BeyAppLayoutBottomAction,
    BeyAppLayoutConfig,
    BeyAppLayoutService,
    BeyAppLayoutTopAction
} from '@beyonda-labs/angular-components';
import { BeyLeftMenuTitle, BeyLeftMenuUserInfo } from '@beyonda-labs/angular-components';
import { faChartLine, faGear, faHouse, faUsers } from '@fortawesome/free-solid-svg-icons';
import { inject } from '@angular/core';

export class MyLayoutComponent {
    private readonly appLayoutService = inject(BeyAppLayoutService);

    config = new BeyAppLayoutConfig({
        iconSrc: 'assets/logo.svg',
        productName: 'myApp.product',
        prefix: 'myApp',
        title: new BeyLeftMenuTitle({ title: 'myApp.title', icon: 'assets/logo.svg' }),
        topActions: [
            new BeyAppLayoutTopAction({ key: 'dashboard', icon: faHouse }),
            new BeyAppLayoutTopAction({
                key: 'reports',
                icon: faChartLine,
                subActions: [
                    new BeyAppLayoutTopAction({ key: 'reports-monthly', icon: faChartLine }),
                    new BeyAppLayoutTopAction({ key: 'reports-annual', icon: faChartLine })
                ]
            })
        ],
        bottomActions: [
            new BeyAppLayoutBottomAction({ key: 'settings', icon: faGear })
        ],
        userInfo: new BeyLeftMenuUserInfo({ name: 'Ada', surname: 'Lovelace', email: 'ada@example.com' }),
        onLayoutInitialized: () => this.navigateTo('dashboard'),
        onMenuActionClick: (key: string) => this.navigateTo(key)
    });

    private navigateTo(key: string): void {
        this.appLayoutService.setBreadcrumb([
            new BeyAppLayoutBreadcrumbItem({ id: 1, label: 'Dashboard' }),
            new BeyAppLayoutBreadcrumbItem({ id: 2, label: key })
        ]);
        this.appLayoutService.activeMenuAction(key);
    }
}
```

```html
<bey-app-layout [config]="config">
    <div class="p-4">
        <!-- page content goes here -->
    </div>
</bey-app-layout>
```

---

## Models

### `BeyAppLayoutConfig`

The root configuration object passed to `[config]`.

| Parameter            | Type                        | Required | Default           | Description                                                   |
| -------------------- | --------------------------- | -------- | ----------------- | ------------------------------------------------------------- |
| `iconSrc`            | `string`                    | yes      | —                 | URL or data URI of the org icon shown in the footer           |
| `productName`        | `string`                    | yes      | —                 | i18n key for the product name shown in the footer             |
| `title`              | `BeyLeftMenuTitle`          | yes      | —                 | Brand title and icon for the side menu header                 |
| `orgName`            | `string`                    | no       | `'Beyonda Labs'`  | Organisation name shown in the footer                         |
| `prefix`             | `string`                    | no       | `'app-layout'`    | Base prefix used to resolve action i18n keys                  |
| `privacyUrl`         | `string`                    | no       | —                 | Route for the privacy policy link in the footer               |
| `termsUrl`           | `string`                    | no       | —                 | Route for the terms of service link in the footer             |
| `topActions`         | `BeyAppLayoutTopAction[]`   | no       | `[]`              | Main navigation actions in the side menu                      |
| `bottomActions`      | `BeyAppLayoutBottomAction[]`| no       | `[]`              | Secondary actions rendered below the separator                |
| `breadcrumb`         | `BeyAppLayoutBreadcrumbItem[]` | no    | `[]`              | Initial breadcrumb items (can be updated at runtime via service) |
| `userInfo`           | `BeyLeftMenuUserInfo`       | no       | —                 | Optional user footer in the side menu                         |
| `onLayoutInitialized`| `() => void`                | no       | —                 | Called once after the component is initialized                |
| `onMenuActionClick`  | `(key: string) => void`     | no       | —                 | Called when any menu action (including sub-actions) is triggered |
| `onBreadcrumbClick`  | `(id: number) => void`      | no       | —                 | Called when a non-last breadcrumb item is clicked             |

Behavior notes:

-   `onMenuActionClick` receives the `key` of the triggered action, not the action object.
-   `onBreadcrumbClick` receives the numeric `id` of the clicked breadcrumb item, not the item object.
-   The breadcrumb bar is hidden when `breadcrumb` is empty and only shown when at least one item is present.

---

### `BeyAppLayoutTopAction`

Defines a top navigation action. Supports nested sub-actions.

| Parameter    | Type                        | Required | Default  | Description                                       |
| ------------ | --------------------------- | -------- | -------- | ------------------------------------------------- |
| `key`        | `string`                    | yes      | —        | Unique key used for i18n lookup and click routing |
| `icon`       | `IconDefinition`            | yes      | —        | Font Awesome icon displayed in the menu           |
| `active`     | `boolean`                   | no       | `false`  | Marks the action as currently selected            |
| `subActions` | `BeyAppLayoutTopAction[]`   | no       | `[]`     | Nested child actions                              |

Behavior notes:

-   When a sub-action is triggered, `onMenuActionClick` is called with the sub-action's `key`.
-   Active state can be managed declaratively via the `active` parameter or at runtime via `BeyAppLayoutService.activeMenuAction()`.
-   A parent action receives a visual selected state when any of its descendants is active.

---

### `BeyAppLayoutBottomAction`

Defines a bottom navigation action. Simpler than `BeyAppLayoutTopAction` — no sub-actions or active state.

| Parameter | Type             | Required | Default | Description                                       |
| --------- | ---------------- | -------- | ------- | ------------------------------------------------- |
| `key`     | `string`         | yes      | —        | Unique key used for i18n lookup and click routing |
| `icon`    | `IconDefinition` | yes      | —        | Font Awesome icon displayed in the menu           |

---

### `BeyAppLayoutBreadcrumbItem`

Defines a single item in the breadcrumb trail.

| Parameter | Type             | Required | Default | Description                                      |
| --------- | ---------------- | -------- | ------- | ------------------------------------------------ |
| `id`      | `number`         | yes      | —       | Unique numeric identifier; passed to `onBreadcrumbClick` when clicked |
| `label`   | `string`         | yes      | —       | Display text shown in the breadcrumb bar         |
| `icon`    | `IconDefinition` | no       | —       | Optional Font Awesome icon displayed before the label |

Behavior notes:

-   The breadcrumb always uses raw labels (`translate: false`). Translate labels before passing them to the model.
-   The last item in the array represents the current page and is not clickable.

---

## Service

`BeyAppLayoutService` is the runtime interface for updating layout state after initialization. Inject it anywhere that needs to change the breadcrumb or the active menu action.

### Methods

| Method                          | Description                                                      |
| ------------------------------- | ---------------------------------------------------------------- |
| `setBreadcrumb(items)`          | Replaces the current breadcrumb with the provided items          |
| `clearBreadcrumb()`             | Clears the breadcrumb bar (hides it)                             |
| `activeMenuAction(key: string)` | Marks the action matching `key` as active (clears all others)    |
| `emitMenuClick(key: string)`    | Emits a menu click event, triggering `onMenuActionClick`         |
| `emitBreadcrumbClick(id: number)` | Emits a breadcrumb click event, triggering `onBreadcrumbClick` |

### Observables

| Observable          | Type                                     | Description                                   |
| ------------------- | ---------------------------------------- | --------------------------------------------- |
| `breadcrumbItems$`  | `Observable<BeyAppLayoutBreadcrumbItem[]>` | Emits whenever the breadcrumb changes         |
| `onMenuClick$`      | `Observable<string>`                     | Emits the `key` of the last triggered action  |
| `onBreadcrumbClick$`| `Observable<number>`                     | Emits the `id` of the last clicked breadcrumb item |
| `activeAction$`     | `Observable<string>`                     | Emits the `key` of the newly active action    |

---

## i18n convention

With `prefix = 'myApp'` and an action with `key = 'dashboard'`:

| Key pattern                        | Example                            | Description              |
| ---------------------------------- | ---------------------------------- | ------------------------ |
| `{prefix}.title`                   | `myApp.title`                      | Default menu brand title |
| `{prefix}.actions.{key}.label`     | `myApp.actions.dashboard.label`    | Action label             |
| `{prefix}.actions.{key}.tooltip`   | `myApp.actions.dashboard.tooltip`  | Action tooltip           |

Behavior notes:

-   Breadcrumb labels are always rendered as raw strings. Pass already-translated labels using `TranslateService.instant()` before building the `BeyAppLayoutBreadcrumbItem` array.
-   Sub-action keys follow the same pattern as top-level action keys. Use distinct keys (e.g., `reports-monthly`) to avoid translation key conflicts.

---

## Best practices

-   Use `onLayoutInitialized` to set the initial breadcrumb and active action instead of doing it in the component constructor, since the service subscriptions are only active after the layout initializes.
-   Call `BeyAppLayoutService.activeMenuAction(key)` together with `setBreadcrumb()` inside `onMenuActionClick` to keep the menu state and breadcrumb in sync.
-   Keep `topActions` for primary navigation and `bottomActions` for low-frequency items such as settings or help.
-   Use stable `key` values on all actions (including sub-actions) because they drive both i18n resolution and active state routing.
-   Translate breadcrumb labels before passing them to `BeyAppLayoutBreadcrumbItem`; the component renders labels as-is without further translation.
