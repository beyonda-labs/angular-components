# Toast Service (`BeyToastService`)

Service-driven toast notification system built on top of `ngx-toastr`, exposing consistent success, info, warning, and error notifications.

Supported capabilities:

-   Success, info, warning, and error toast notifications.
-   Translatable title and message content.
-   Optional custom duration per toast.
-   No close button; toasts dismiss automatically after timeout.
-   Progress bar indicating remaining time.
-   Programmatic dismiss via returned `ActiveToast` reference.
-   Minimalist visual style aligned with the library design system.

---

## Quick start

Register the toast providers once in the final application.

```ts
import { ApplicationConfig } from '@angular/core';
import { provideBeyToast } from '@beyonda-labs/angular-components';

export const appConfig: ApplicationConfig = {
    providers: [provideBeyToast()]
};
```

Inject the service where you want to show a toast.

```ts
import { Component, inject } from '@angular/core';
import { BeyToastService } from '@beyonda-labs/angular-components';

@Component({
    selector: 'app-user-detail',
    standalone: true,
    template: `
        <button type="button" (click)="saveUser()">Save</button>
    `
})
export class UserDetailComponent {
    private readonly toastService = inject(BeyToastService);

    saveUser(): void {
        // ... save logic

        this.toastService.showSuccess({
            message: 'userDetail.toast.saved.message',
            title: 'userDetail.toast.saved.title'
        });
    }
}
```

---

## Public API

### `provideBeyToast()`

Registers the `ngx-toastr` providers with the library default configuration.

| Return type            | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| `EnvironmentProviders` | Providers to add in the final app bootstrap configuration |

Default configuration:

| Option          | Value             |
| --------------- | ----------------- |
| `closeButton`   | `false`           |
| `progressBar`   | `true`            |
| `positionClass` | `toast-top-right` |
| `timeOut`       | `4000`            |
| `newestOnTop`   | `true`            |
| `tapToDismiss`  | `false`           |

Behavior notes:

-   Add it once at application level.
-   It is required before using `BeyToastService` in a standalone app.

---

### `BeyToastService`

The public entry point for showing toast notifications.

| Method                | Return type            | Description                  |
| --------------------- | ---------------------- | ---------------------------- |
| `showSuccess(config)` | `ActiveToast<unknown>` | Shows a success toast        |
| `showInfo(config)`    | `ActiveToast<unknown>` | Shows an informational toast |
| `showWarning(config)` | `ActiveToast<unknown>` | Shows a warning toast        |
| `showError(config)`   | `ActiveToast<unknown>` | Shows an error toast         |

All methods accept a `BeyToastConfigParameters` object and return an `ActiveToast` reference from `ngx-toastr` that can be used for programmatic dismiss.

---

## Config model

### `BeyToastConfigParameters`

Used by all `show*` methods.

| Parameter  | Type     | Required | Default | Description                              |
| ---------- | -------- | -------- | ------- | ---------------------------------------- |
| `message`  | `string` | yes      | -       | Translation key or literal message       |
| `title`    | `string` | no       | `''`    | Translation key or literal title         |
| `duration` | `number` | no       | `4000`  | Time in milliseconds before auto-dismiss |

---

### `BeyToastType`

| Value                  | Description          |
| ---------------------- | -------------------- |
| `BeyToastType.Success` | Success notification |
| `BeyToastType.Info`    | Informational toast  |
| `BeyToastType.Warning` | Warning toast        |
| `BeyToastType.Error`   | Error toast          |

`BeyToastType` is exported for external typing or conditional logic, but the final app normally chooses the toast variant through the service method.

---

## i18n convention

The toast service accepts translation keys directly. A common consumer convention is to keep all toast texts grouped by feature.

Example:

| Key pattern           | Example                          | Description |
| --------------------- | -------------------------------- | ----------- |
| feature toast title   | `userDetail.toast.saved.title`   | Toast title |
| feature toast message | `userDetail.toast.saved.message` | Toast body  |

---

## Best practices

-   Show toasts only through `BeyToastService`; do not reference `ngx-toastr` directly.
-   Register `provideBeyToast()` once in the final app bootstrap.
-   Use `showSuccess()` for completed actions, `showError()` for failures, `showWarning()` for attention-needed states, and `showInfo()` for neutral updates.
-   Prefer fully qualified translation keys from the consuming feature so toast texts stay grouped with the feature that owns them.
-   Keep toast messages short and actionable; they are not a substitute for modals when user decisions are required.
