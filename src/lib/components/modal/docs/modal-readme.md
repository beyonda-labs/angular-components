# Modal

Dialogs opened from a service rather than placed in a template. Four kinds: info, warning, error and
confirmation. The dialog component itself is internal; `BeyModalService` is the whole public surface.

## Setup

```ts
providers: [provideBeyModal()];
```

## Usage

```ts
this.modal.openInfo({ title: 'myPage.saved.title', message: 'myPage.saved.message' });

this.modal.openConfirmation({ title: 'myPage.delete.title', message: 'myPage.delete.message' })
    .subscribe(confirmed => confirmed && this.delete());
```

## BeyModalService

| Method                       | Returns               | Meaning                                              |
| ---------------------------- | --------------------- | ---------------------------------------------------- |
| `openInfo(config)`           | the modal reference   | One button that closes                                |
| `openWarning(config)`        | the modal reference   | Same, with a warning look                             |
| `openError(config)`          | the modal reference   | Same, with an error look                              |
| `openConfirmation(config)`   | `Observable<boolean>` | Two buttons; emits once, `false` if closed any other way |

## Config

| Field               | Required | Default                | Meaning                                      |
| ------------------- | -------- | ---------------------- | -------------------------------------------- |
| `title`             | yes      |                        | i18n key or literal                           |
| `message`           | yes      |                        | i18n key or literal                           |
| `messageParameters` | no       |                        | Interpolation parameters for the message       |
| `closeOnBackdrop`   | no       | `true`                 | Whether clicking the backdrop closes it        |
| `confirmLabel`      | no       | the library's default  | Confirmation only                              |
| `cancelLabel`       | no       | the library's default  | Confirmation only                              |

A confirmation resolves to `false` when it is dismissed with the close button, the backdrop or Escape, so the
caller never has to handle those cases separately.

## Theming

| Variable                     | Default                |
| ---------------------------- | ---------------------- |
| `--bey-modal-fg`             | `--bey-text-primary`   |
| `--bey-modal-fg-muted`       | `--bey-text-muted`     |
| `--bey-modal-fg-message`     | `--bey-text-secondary` |
| `--bey-modal-close-hover-bg` | `--bey-bg-active`      |

Each kind sets its own `--bey-modal-accent` and a soft variant of it for the icon background.
