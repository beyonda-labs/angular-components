# Toast

Transient notifications opened from a service. Four kinds: info, success, warning and error. There is no
component to place: `BeyToastService` is the whole public surface.

## Setup

```ts
providers: [provideBeyToast()];
```

## Usage

```ts
this.toast.showSuccess({ title: 'myPage.saved.title', message: 'myPage.saved.message' });
this.toast.showError({ message: 'myPage.failed', duration: 8000 });
```

## BeyToastService

| Method                | Meaning                     |
| --------------------- | --------------------------- |
| `showInfo(config)`    | Neutral notification         |
| `showSuccess(config)` | Something worked             |
| `showWarning(config)` | Something needs attention    |
| `showError(config)`   | Something failed             |

All four return the underlying `ActiveToast`, so a caller that needs to dismiss one by hand can.

## BeyToastConfig

| Field      | Required | Default | Meaning                                   |
| ---------- | -------- | ------- | ----------------------------------------- |
| `message`  | yes      |         | i18n key or literal                        |
| `title`    | no       | none    | i18n key or literal                        |
| `duration` | no       | `5000`  | Milliseconds on screen                     |

Titles and messages are translated before being handed to the toast, so keys work without a pipe.

## Theming

Toasts are rendered outside the component tree, so their styles live in the global
`assets/styles/toast.css`. Each kind sets `--bey-toast-accent` and a soft variant of it.
