# Header

The title bar of a page: an optional back action, the title, an optional badge, and the actions, all grouped
to the right. Actions that do not fit a toolbar can be pushed into an overflow menu, and any action can open a
set of sub-actions.

## Usage

```ts
const header = new BeyHeaderConfig({
    prefix: 'myPage',
    title: 'myPage.title',
    leftActions: [
        new BeyHeaderAction({ key: 'save', type: BeyHeaderActionType.PrimaryButton, action: () => this.save() })
    ],
    menuActions: [new BeyHeaderAction({ key: 'archive', action: () => this.archive() })]
});
```

```html
<bey-header [config]="header"></bey-header>
```

## BeyHeaderConfig

| Field          | Required | Default | Meaning                                                     |
| -------------- | -------- | ------- | ----------------------------------------------------------- |
| `prefix`       | yes      |         | i18n prefix the action texts are built from                 |
| `title`        | no       | none    | A literal title or an i18n key; the bar drops it when empty |
| `variant`      | no       | `Page`  | `Page` or `SubPage`, which only changes the title size      |
| `backAction`   | no       | none    | Rendered before the title                                   |
| `badge`        | no       | none    | A `BeyBadgeConfig` shown next to the title                  |
| `leftActions`  | no       | `[]`    | Rendered first inside the group                             |
| `menuActions`  | no       | `[]`    | Collapsed behind an overflow toggle                         |
| `rightActions` | no       | `[]`    | Rendered last inside the group                              |

## BeyHeaderAction

| Field        | Required | Default         | Meaning                                                    |
| ------------ | -------- | --------------- | ---------------------------------------------------------- |
| `key`        | yes      |                 | Identifies the action and builds its default texts         |
| `type`       | yes      |                 | `PrimaryButton`, `SecondaryButton`, `Text` or `Icon`       |
| `label`      | no       | `<key>.label`   | Resolved against `<prefix>.actions` unless it is a literal |
| `tooltip`    | no       | `<key>.tooltip` | Same resolution as the label                               |
| `icon`       | no       | none            | FontAwesome icon; an `Icon` action shows only this         |
| `disabled`   | no       | `false`         | Rendered disabled                                          |
| `action`     | no       |                 | Run when the button is used                                |
| `subActions` | no       | none            | Opens a panel instead of running `action`                  |

A default text uses the key as a kebab-case segment: `saveDraft` reads `<prefix>.actions.save-draft.label`.
A `label` or `tooltip` given in the config is used as it is.

An `Icon` action does not show its label but is named by it: the same key a `Text` action would show becomes
the button's `aria-label`, so switching the type never changes what a screen reader announces. The tooltip
stays the visual hint. The overflow toggle is named `angular-components.header.menu`.

An action with `subActions` never runs its own `action`: using it opens the panel. Picking a sub-action closes
it, and so does Escape or a click outside.

## Replacing the config

The config is read as the initial state and never written to. Change the title or the actions by binding a new
`BeyHeaderConfig`; the open menus close with it.

## Theming

| Variable          | Default              |
| ----------------- | -------------------- |
| `--bey-header-fg` | `--bey-text-primary` |
