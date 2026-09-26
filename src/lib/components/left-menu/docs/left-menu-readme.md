# Left menu

The application's side navigation, driven by a config model. It owns whether it is collapsed and which branch
of the accordion is open; what each action does is the consumer's.

## Usage

```ts
const menu = new BeyLeftMenuConfig({
    prefix: 'myApp.menu',
    title: new BeyLeftMenuTitle({ title: 'myApp.name', icon: 'assets/logo.svg' }),
    expanded: this.menuState.expanded,
    onExpandedChange: expanded => this.menuState.setExpanded(expanded),
    topActions: [
        new BeyLeftMenuAction({ key: 'home', icon: faHome, active: true, action: () => this.go('/home') }),
        new BeyLeftMenuAction({
            key: 'reports',
            icon: faChartLine,
            subActions: [new BeyLeftMenuAction({ key: 'daily', action: () => this.go('/reports/daily') })]
        })
    ],
    bottomActions: [new BeyLeftMenuAction({ key: 'logout', icon: faRightFromBracket, action: () => this.logout() })]
});
```

```html
<bey-left-menu [config]="menu"></bey-left-menu>
```

## BeyLeftMenuConfig

| Field              | Required | Default | Meaning                                               |
| ------------------ | -------- | ------- | ----------------------------------------------------- |
| `prefix`           | yes      |         | i18n prefix the action texts are built from           |
| `title`            | yes      |         | Brand shown at the top                                |
| `expanded`         | no       | `true`  | Whether the menu starts open                          |
| `onExpandedChange` | no       | none    | Run with the new state when the user toggles the menu |
| `topActions`       | no       | `[]`    | Main navigation                                       |
| `bottomActions`    | no       | `[]`    | Secondary group, pinned below                         |
| `userInfo`         | no       | none    | Shows the signed-in user at the foot                  |

## BeyLeftMenuAction

| Field        | Required | Default         | Meaning                                                  |
| ------------ | -------- | --------------- | -------------------------------------------------------- |
| `key`        | yes      |                 | Identifies the action and builds its texts               |
| `label`      | no       | `<key>.label`   | Resolved against `<prefix>.actions` unless it is literal |
| `tooltip`    | no       | `<key>.tooltip` | Same resolution; shown as the label while collapsed      |
| `icon`       | no       | none            | FontAwesome icon, the only thing visible while collapsed |
| `active`     | no       | `false`         | Marks the current location                               |
| `disabled`   | no       | `false`         | Neither runs nor opens                                   |
| `subActions` | no       | `[]`            | Nested actions, to any depth                             |
| `action`     | no       |                 | Run when the action is used                              |

## Expanding and collapsing

The menu owns its own state from `expanded` onwards and reports every change through `onExpandedChange`. The
config is never written to: to persist the state, store what the callback gives you and build the next config
from it, as `bey-app-layout` does.

## The accordion

Expanded, a branch opens in place and opening one closes the previous, so only one path is ever open. The
branch holding the active action opens by itself whenever the actions change. A branch that has its own
`action` runs it when its label is used and opens only from the chevron; one without runs nothing and just
opens.

Collapsed, branches open as a flyout on hover or click instead, and the labels give way to the icons.

## Theming

| Variable                          | Default               |
| --------------------------------- | --------------------- |
| `--bey-left-menu-accent`          | `--bey-primary`       |
| `--bey-left-menu-surface`         | `--bey-bg-surface`    |
| `--bey-left-menu-surface-alt`     | `--bey-bg-muted`      |
| `--bey-left-menu-border`          | `--bey-border-subtle` |
| `--bey-left-menu-border-strong`   | `--bey-border-strong` |
| `--bey-left-menu-text`            | `--bey-text-primary`  |
| `--bey-left-menu-text-muted`      | `--bey-text-muted`    |
| `--bey-left-menu-height`          | `100%`                |
| `--bey-left-menu-title-font-size` | `--bey-font-size-2xl` |
