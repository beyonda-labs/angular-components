# Modal

Dialogs opened from a service rather than placed in a template. Four kinds: info, warning, error and
confirmation. The dialog component itself is internal; `BeyModalService` is its whole public surface. On top of
the confirmation, `beyUnsavedChangesGuard` asks before leaving a route with unsaved changes.

## Setup

```ts
providers: [provideBeyModal()];
```

## Usage

```ts
this.modal.openInfo({ title: 'myPage.saved.title', message: 'myPage.saved.message' });

this.modal
    .openConfirmation({ title: 'myPage.delete.title', message: 'myPage.delete.message' })
    .subscribe(confirmed => confirmed && this.delete());
```

## BeyModalService

| Method                     | Returns               | Meaning                                                  |
| -------------------------- | --------------------- | -------------------------------------------------------- |
| `openInfo(config)`         | the modal reference   | One button that closes                                   |
| `openWarning(config)`      | the modal reference   | Same, with a warning look                                |
| `openError(config)`        | the modal reference   | Same, with an error look                                 |
| `openConfirmation(config)` | `Observable<boolean>` | Two buttons; emits once, `false` if closed any other way |

## Config

`openInfo`, `openWarning` and `openError` take a `BeyNotificationModalConfig`, `openConfirmation` a
`BeyConfirmationModalConfig`:

| Field                | Required | Default                                    | Meaning                                        |
| -------------------- | -------- | ------------------------------------------ | ---------------------------------------------- |
| `title`              | yes      |                                            | i18n key or literal                            |
| `message`            | yes      |                                            | i18n key or literal                            |
| `messageParameters`  | no       |                                            | Interpolation parameters for the message       |
| `canCloseOnBackdrop` | no       | `true`                                     | Whether the backdrop and Escape close it       |
| `closeLabel`         | no       | `angular-components.modal.actions.close`   | Notification only, the label of its one button |
| `confirmLabel`       | no       | `angular-components.modal.actions.confirm` | Confirmation only                              |
| `cancelLabel`        | no       | `angular-components.modal.actions.cancel`  | Confirmation only                              |

A confirmation resolves to `false` when it is dismissed with the close button, the backdrop or Escape, so the
caller never has to handle those cases separately.

A dialog is at most `--bey-modal-max-height` high, by default the `--bey-dialog-max-height` token: the window height
minus a margin. Its title and its buttons stay in place, and a message longer than that scrolls between them.

## Unsaved changes

`BeyUnsavedChangesService.track(hasChanges, config?)` registers a `Signal<boolean>` for as long as its caller
lives. It is called in an injection context, a constructor or a field initialiser, and the source is dropped
when that caller is destroyed. While any tracked source has changes, `beyUnsavedChangesGuard` asks before the
route is left, and the browser asks before the tab is closed or reloaded.

```ts
constructor() {
    inject(BeyUnsavedChangesService).track(this.editorService.hasChanges);
}
```

```ts
{ path: 'editor/:id', component: EditorComponent, canDeactivate: [beyUnsavedChangesGuard] }
```

| Member                       | Meaning                                                              |
| ---------------------------- | -------------------------------------------------------------------- |
| `track(hasChanges, config?)` | Tracks the signal until the caller is destroyed                      |
| `hasChanges`                 | A signal, `true` while any tracked source has changes                |
| `canDeactivate()`            | `true` when nothing has changes, otherwise the confirmation's answer |

`BeyUnsavedChangesConfig` holds the texts of the confirmation, keys or literals:

| Field          | Default                                            |
| -------------- | -------------------------------------------------- |
| `title`        | `angular-components.modal.unsaved-changes.title`   |
| `message`      | `angular-components.modal.unsaved-changes.message` |
| `confirmLabel` | `angular-components.modal.unsaved-changes.leave`   |
| `cancelLabel`  | `angular-components.modal.unsaved-changes.stay`    |

When several sources have changes, the texts of the first one tracked are shown. On a reload or a tab close the
browser shows its own text, which no page can change. The guard has the same shape as `beyModalFormGuard` of the
form module, which covers open modal forms; a route can list both.

## Theming

| Variable                     | Default                   |
| ---------------------------- | ------------------------- |
| `--bey-modal-fg`             | `--bey-text-primary`      |
| `--bey-modal-fg-muted`       | `--bey-text-muted`        |
| `--bey-modal-fg-message`     | `--bey-text-secondary`    |
| `--bey-modal-close-hover-bg` | `--bey-bg-active`         |
| `--bey-modal-max-height`     | `--bey-dialog-max-height` |

The dialog renders in `document.body`, so these variables are read from `:root` or an ancestor of the dialog; one set
nowhere takes its default.

Each kind sets its own `--bey-modal-accent` and a soft variant of it, `--bey-modal-accent-soft`, for the icon
background: `--bey-primary-soft` for an info or a confirmation, `--bey-warning-soft` for a warning and
`--bey-danger-soft` for an error. The icon sits in a square of `--bey-dialog-icon-size`, the token the tree dialog
reads too, and the dialog takes the width of the Bootstrap modal it opens in.
