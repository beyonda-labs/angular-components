# App layout

The application shell: a `bey-left-menu` on the left, a sticky breadcrumb bar and a footer around the page
content you project. The layout renders the config it receives; what changes while the app runs, the
breadcrumb, the active action and whether the menu is collapsed, lives in `BeyAppLayoutService`.

## Usage

```ts
readonly config = new BeyAppLayoutConfig({
    iconSrc: 'assets/logo.svg',
    productName: 'myApp.product',
    prefix: 'myApp',
    title: new BeyLeftMenuTitle({ title: 'myApp.title', icon: 'assets/logo.svg' }),
    topActions: [
        new BeyAppLayoutTopAction({ key: 'dashboard', icon: faHouse, route: '/dashboard' }),
        new BeyAppLayoutTopAction({
            key: 'reports',
            icon: faChartLine,
            route: '/reports',
            subActions: [new BeyAppLayoutTopAction({ key: 'reports-monthly', icon: faCalendar, route: '/reports/monthly' })]
        })
    ],
    bottomActions: [new BeyAppLayoutBottomAction({ key: 'logout', icon: faRightFromBracket })],
    userInfo: new BeyLeftMenuUserInfo({ name: 'Ada', surname: 'Lovelace', email: 'ada@example.com' }),
    onMenuActionClick: key => this.router.navigate([`/${key}`])
});
```

```html
<bey-app-layout [config]="config">
    <router-outlet />
</bey-app-layout>
```

## BeyAppLayoutConfig

| Field                 | Required | Default          | Meaning                                                   |
| --------------------- | -------- | ---------------- | --------------------------------------------------------- |
| `iconSrc`             | yes      |                  | Organisation icon shown in the footer                     |
| `productName`         | yes      |                  | i18n key of the product name shown in the footer          |
| `title`               | yes      |                  | Brand of the side menu, a `BeyLeftMenuTitle`              |
| `prefix`              | no       | `'app-layout'`   | i18n prefix the action texts are built from               |
| `topActions`          | no       | `[]`             | Main navigation                                           |
| `bottomActions`       | no       | `[]`             | Secondary group, pinned below                             |
| `breadcrumb`          | no       | `[]`             | Items the breadcrumb starts with                          |
| `useBodyPadding`      | no       | `true`           | Pads the projected content                                |
| `userInfo`            | no       | none             | Shows the signed-in user at the foot of the menu          |
| `orgName`             | no       | `'Beyonda Labs'` | Organisation name in the footer                           |
| `privacyUrl`          | no       | none             | Route of the privacy link in the footer                   |
| `termsUrl`            | no       | none             | Route of the terms link in the footer                     |
| `onLayoutInitialized` | no       |                  | Run once, when the layout is ready                        |
| `onMenuActionClick`   | no       |                  | Run with the key of any action used, nested ones included |
| `onBreadcrumbClick`   | no       |                  | Run with the id of a breadcrumb item that is clicked      |
| `onRouteActivated`    | no       |                  | Run with the key of the action a route activated          |

`BeyAppLayoutTopAction` takes `key`, `icon`, and optionally `action`, `active`, `disabled`, `route` and
`subActions`. `BeyAppLayoutBottomAction` takes `key`, `icon` and an optional `action`. Both are
`BeyLeftMenuAction`s, so their texts resolve as `<prefix>.actions.<key>.label` and `.tooltip`.

`BeyAppLayoutBreadcrumbItem` takes `id`, `label` and an optional `icon`. The label is shown as it is: translate
it before building the item.

## The actions are yours

The layout never writes into the actions it receives. It builds the menu from copies, wrapping each `action`
so that using it also reports the key through the service and `onMenuActionClick`, and marking as active
whichever action the service names. The `active` flag of the config is only honoured until the service names
one.

## Routes

When any action declares a `route`, the layout keeps the menu and the breadcrumb in sync with the router on
its own: on every navigation it activates the deepest action whose route is the url or one of its ancestors,
builds the breadcrumb from the labels of that path, translated on the spot and again whenever the language
changes, and calls `onRouteActivated`. A url no action claims clears both. Using a routed action from the
menu activates it the same way.

Without routes, nothing is activated for you: call `activeMenuAction` and `setBreadcrumb` from
`onMenuActionClick`, as the style-guide does.

## BeyAppLayoutService

A root singleton, so a page can update the shell from anywhere.

| Member                    | Meaning                                                 |
| ------------------------- | ------------------------------------------------------- |
| `breadcrumb`              | Signal with the current items                           |
| `setBreadcrumb(items)`    | Replaces them                                           |
| `clearBreadcrumb()`       | Hides the bar                                           |
| `activeActionKey`         | Signal with the key of the active action, or `null`     |
| `activeMenuAction(key)`   | Marks that action as active and clears the rest         |
| `clearActiveAction()`     | Leaves no action active                                 |
| `expanded`                | Signal with the state of the menu                       |
| `setExpanded(value)`      | Collapses or expands it, and persists the choice        |
| `emitMenuClick(key)`      | Reports an action as if it had been used from the menu  |
| `emitBreadcrumbClick(id)` | Reports a breadcrumb item as if it had been clicked     |
| `onMenuClick$`            | The keys reported by the menu or by `emitMenuClick`     |
| `onBreadcrumbClick$`      | The ids reported by the bar or by `emitBreadcrumbClick` |

The expanded state is stored under `bey-left-menu-expanded` in `localStorage`, so it survives a reload and
defaults to expanded the first time.

## Customisation

| Variable                             | Default               |
| ------------------------------------ | --------------------- |
| `--bey-app-layout-bg`                | `--bey-bg-page`       |
| `--bey-app-layout-breadcrumb-border` | `--bey-border-subtle` |
| `--bey-app-layout-breadcrumb-shadow` | `--bey-shadow-sm`     |
