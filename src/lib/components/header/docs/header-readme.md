# Header Component (`bey-header`)

Model-driven page header component with title and configurable left/right actions.

Supported capabilities:

-   Title rendering with translation support.
-   Left and right action groups.
-   Button variants: primary, secondary, and text.
-   Optional icons per action.
-   Default i18n key generation from `prefix` and action `key`.

---

## Quick start

```ts
import { BeyHeaderAction, BeyHeaderActionType, BeyHeaderConfig } from '@beyonda-labs/angular-components';
import { faArrowLeft, faFloppyDisk, faPen } from '@fortawesome/free-solid-svg-icons';

const header = new BeyHeaderConfig({
    prefix: 'userDetail.header',
    title: 'userDetail.header.title',
    leftActions: [
        new BeyHeaderAction({
            key: 'back',
            type: BeyHeaderActionType.Text,
            icon: faArrowLeft,
            action: () => console.log('Back')
        })
    ],
    rightActions: [
        new BeyHeaderAction({
            key: 'edit',
            type: BeyHeaderActionType.SecondaryButton,
            icon: faPen,
            action: () => console.log('Edit')
        }),
        new BeyHeaderAction({
            key: 'save',
            type: BeyHeaderActionType.PrimaryButton,
            icon: faFloppyDisk,
            action: () => console.log('Save')
        })
    ]
});
```

```html
<bey-header [config]="header"></bey-header>
```

---

## Models

### `BeyHeaderConfig`

The root configuration object passed to `[config]`.

| Parameter      | Type                | Required | Default | Description                                          |
| -------------- | ------------------- | -------- | ------- | ---------------------------------------------------- |
| `prefix`       | `string`            | yes      | -       | Base prefix used to resolve default action i18n keys |
| `title`        | `string`            | no       | `''`    | Header title translation key                         |
| `leftActions`  | `BeyHeaderAction[]` | no       | `[]`    | Actions rendered next to the title                   |
| `rightActions` | `BeyHeaderAction[]` | no       | `[]`    | Actions rendered on the right side                   |

---

### `BeyHeaderAction`

| Parameter | Type                  | Required | Default          | Description                                    |
| --------- | --------------------- | -------- | ---------------- | ---------------------------------------------- |
| `key`     | `string`              | yes      | -                | Unique action key used for default i18n lookup |
| `type`    | `BeyHeaderActionType` | yes      | -                | Visual style of the rendered button            |
| `action`  | `() => void`          | no       | no-op            | Click handler                                  |
| `icon`    | `IconDefinition`      | no       | -                | Optional Font Awesome icon                     |
| `label`   | `string`              | no       | `${key}.label`   | Label translation key                          |
| `tooltip` | `string`              | no       | `${key}.tooltip` | Tooltip translation key                        |

### `BeyHeaderActionType`

| Value                                 | Description                          |
| ------------------------------------- | ------------------------------------ |
| `BeyHeaderActionType.PrimaryButton`   | Renders a primary filled button      |
| `BeyHeaderActionType.SecondaryButton` | Renders a secondary outlined button  |
| `BeyHeaderActionType.Text`            | Renders a tertiary text-style button |

---

## i18n convention

With `prefix = 'userDetail.header'` and an action with `key = 'save'`:

| Key pattern                      | Example                                  | Description            |
| -------------------------------- | ---------------------------------------- | ---------------------- |
| `title` value                    | `userDetail.header.title`                | Header title key       |
| `{prefix}.actions.{key}.label`   | `userDetail.header.actions.save.label`   | Default action label   |
| `{prefix}.actions.{key}.tooltip` | `userDetail.header.actions.save.tooltip` | Default action tooltip |

Behavior notes:

-   `title` is rendered as-is and passed through the `translate` pipe.
-   If `label` or `tooltip` keep their default `${key}.label` / `${key}.tooltip` values, the component expands them with `prefix` automatically.
-   If you provide custom `label` or `tooltip` values, they are used as-is and still passed through `translate`.

---

## Best practices

-   Keep action `key` values stable so translation keys remain predictable.
-   Use `Text` for low-emphasis navigation actions and reserve `PrimaryButton` for the main page action.
-   Pass fully qualified translation keys when an action label should not follow the component `prefix`.
-   Prefer keeping business logic inside the `action` callback and leave the header config itself as a pure view model.
