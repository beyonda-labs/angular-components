# Modal Service (`BeyModalService`)

Service-driven modal system built on top of `ngx-bootstrap`, exposing consistent info, warning, error, and confirmation dialogs.

Supported capabilities:

-   Info, warning, and error notification modals.
-   Confirmation modal with boolean result.
-   Translatable title and message content.
-   Optional custom labels for primary and secondary actions.
-   Backdrop and keyboard close control.
-   Internal rendering aligned with the library button system.

---

## Quick start

Register the modal providers once in the final application.

```ts
import { ApplicationConfig } from '@angular/core';
import { provideBeyModal } from '@beyonda-labs/angular-components';

export const appConfig: ApplicationConfig = {
    providers: [provideBeyModal()]
};
```

Inject the service where you want to open the modal.

```ts
import { Component, inject } from '@angular/core';
import { BeyModalService } from '@beyonda-labs/angular-components';

@Component({
    selector: 'app-user-detail',
    standalone: true,
    template: `
        <button type="button" (click)="archiveUser()">Archive</button>
    `
})
export class UserDetailComponent {
    private readonly modalService = inject(BeyModalService);

    archiveUser(): void {
        this.modalService
            .openConfirmation({
                title: 'userDetail.modal.archive.title',
                message: 'userDetail.modal.archive.message',
                confirmLabel: 'userDetail.modal.archive.confirm',
                cancelLabel: 'userDetail.modal.archive.cancel',
                closeOnBackdrop: false
            })
            .subscribe(confirmed => {
                if (!confirmed) {
                    return;
                }

                this.modalService.openInfo({
                    title: 'userDetail.modal.archiveSuccess.title',
                    message: 'userDetail.modal.archiveSuccess.message'
                });
            });
    }
}
```

---

## Public API

### `provideBeyModal()`

Registers the `ngx-bootstrap` modal providers required by `BeyModalService`.

| Return type            | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| `EnvironmentProviders` | Providers to add in the final app bootstrap configuration |

Behavior notes:

-   Add it once at application level.
-   It is required before using `BeyModalService` in a standalone app.
-   The modal itself is not consumed directly from templates.

---

### `BeyModalService`

The public entry point for opening modals.

| Method                     | Return type           | Description                                            |
| -------------------------- | --------------------- | ------------------------------------------------------ |
| `openInfo(config)`         | `BsModalRef`          | Opens an informational modal                           |
| `openWarning(config)`      | `BsModalRef`          | Opens a warning modal                                  |
| `openError(config)`        | `BsModalRef`          | Opens an error modal                                   |
| `openConfirmation(config)` | `Observable<boolean>` | Opens a confirmation modal and emits the user decision |

Behavior notes:

-   Notification modals resolve through their close action.
-   Confirmation modals emit `true` when the primary action is used and `false` when the dialog is dismissed or canceled.
-   The confirmation observable emits after the modal has finished closing.

---

## Config models

### `BeyNotificationModalConfig`

Used by `openInfo`, `openWarning`, and `openError`.

| Parameter         | Type      | Required | Default                                  | Description                              |
| ----------------- | --------- | -------- | ---------------------------------------- | ---------------------------------------- |
| `title`           | `string`  | yes      | -                                        | Translation key or literal title         |
| `message`         | `string`  | yes      | -                                        | Translation key or literal message       |
| `closeLabel`      | `string`  | no       | `angular-components.modal.actions.close` | Label for the primary close action       |
| `closeOnBackdrop` | `boolean` | no       | `true`                                   | Allows closing with backdrop or keyboard |

---

### `BeyConfirmationModalConfig`

Used by `openConfirmation`.

| Parameter         | Type      | Required | Default                                    | Description                               |
| ----------------- | --------- | -------- | ------------------------------------------ | ----------------------------------------- |
| `title`           | `string`  | yes      | -                                          | Translation key or literal title          |
| `message`         | `string`  | yes      | -                                          | Translation key or literal message        |
| `confirmLabel`    | `string`  | no       | `angular-components.modal.actions.confirm` | Label for the primary confirmation action |
| `cancelLabel`     | `string`  | no       | `angular-components.modal.actions.cancel`  | Label for the secondary cancel action     |
| `closeOnBackdrop` | `boolean` | no       | `true`                                     | Allows closing with backdrop or keyboard  |

---

### `BeyModalType`

| Value                       | Description         |
| --------------------------- | ------------------- |
| `BeyModalType.Info`         | Informational modal |
| `BeyModalType.Warning`      | Warning modal       |
| `BeyModalType.Error`        | Error modal         |
| `BeyModalType.Confirmation` | Confirmation modal  |

`BeyModalType` is exported for external typing or conditional logic, but the final app normally chooses the modal variant through the service method instead of instantiating the type directly.

---

## i18n convention

The modal service accepts translation keys directly. A common consumer convention is to keep all modal texts grouped by feature.

Example:

| Key pattern                 | Example                            | Description            |
| --------------------------- | ---------------------------------- | ---------------------- |
| feature modal title         | `userDetail.modal.archive.title`   | Dialog title           |
| feature modal message       | `userDetail.modal.archive.message` | Dialog body            |
| feature modal confirm label | `userDetail.modal.archive.confirm` | Primary action label   |
| feature modal cancel label  | `userDetail.modal.archive.cancel`  | Secondary action label |

Generic fallback labels are provided by the library under `angular-components.modal`.

---

## Best practices

-   Open modals only through `BeyModalService`; do not reference the internal modal component directly.
-   Register `provideBeyModal()` once in the final app bootstrap and keep modal opening logic inside feature components or facade services.
-   Use `openConfirmation()` for business decisions and keep side effects inside the subscription callback.
-   Prefer fully qualified translation keys from the consuming feature so modal texts stay grouped with the feature that owns them.
-   Set `closeOnBackdrop: false` when the decision is critical and should not be dismissed accidentally.
