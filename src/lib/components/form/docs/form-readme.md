# Form Component (`bey-form`)

Model-driven form component built from sections, rows, and fields.

Supported capabilities:

-   Dynamic sections and row layouts.
-   Multiple field types: text, textarea, number, date, select, radio, checkbox, chips.
-   Sync and async validation.
-   Action buttons (cancel, submit, next, previous, optional).
-   i18n via `i18nPrefix`.
-   Lifecycle callbacks: `onFormGroupAdded`, `onValueChange`, `onSubmit`, `onCancel`.
-   Modal variant: open a form inside a dialog via `BeyModalFormService` + `BeyModalFormConfig`.

---

## Quick start

```ts
import {
    BeyFormButton,
    BeyFormButtonType,
    BeyFormConfig,
    BeyFormDateField,
    BeyFormNumberField,
    BeyFormRow,
    BeyFormSection,
    BeyFormTextField
} from '@beyonda-labs/angular-components';

const form = new BeyFormConfig({
    i18nPrefix: 'userForm',
    sections: [
        new BeyFormSection({
            key: 'profile',
            rows: [
                new BeyFormRow({
                    fields: [
                        new BeyFormTextField({ key: 'name', columns: 6, isRequired: true }),
                        new BeyFormNumberField({ key: 'age', columns: 3, min: 18, max: 99 }),
                        new BeyFormDateField({
                            key: 'joinDate',
                            columns: 3,
                            minDate: '2026-01-01',
                            maxDate: '2026-12-31'
                        })
                    ]
                })
            ]
        })
    ],
    buttons: [
        new BeyFormButton({ type: BeyFormButtonType.Cancel, label: 'cancel' }),
        new BeyFormButton({ type: BeyFormButtonType.Submit, label: 'save' })
    ]
});
```

```html
<bey-form [config]="form"></bey-form>
```

---

## Models

### `BeyFormConfig`

The root configuration object passed to `[config]`.

**Constructor parameters:**

| Parameter          | Type                        | Required | Default  | Description                                |
| ------------------ | --------------------------- | -------- | -------- | ------------------------------------------ |
| `i18nPrefix`       | `string`                    | yes      | —        | Prefix for all i18n translation keys       |
| `sections`         | `BeyFormSection[]`          | yes      | —        | Array of form sections                     |
| `buttons`          | `BeyFormButton[]`           | no       | `[]`     | Action buttons rendered at the bottom      |
| `id`               | `string`                    | no       | `uuid()` | Unique form ID                             |
| `steps`            | `BeyFormStep[]`             | no       | `[]`     | Step groups for multi-step forms           |
| `onFormGroupAdded` | `(formGroup, form) => void` | no       | —        | Called once the `FormGroup` is initialized |
| `onValueChange`    | `(value, form) => void`     | no       | —        | Called on every value change               |
| `onSubmit`         | `(value, form) => void`     | no       | —        | Called on form submission                  |
| `onCancel`         | `() => void`                | no       | —        | Called when the cancel button is clicked   |

**Methods:**

| Method              | Signature                   | Description                                                           |
| ------------------- | --------------------------- | --------------------------------------------------------------------- |
| `getValue()`        | `() => TValue \| undefined` | Returns the current `formGroup.getRawValue()`                         |
| `patchValue()`      | `(value, emitEvent?)`       | Patches the `FormGroup` value without triggering callbacks by default |
| `setInitialValue()` | `(value: TValue) => void`   | Resets the form to an initial value                                   |
| `getInitialValue()` | `() => TValue \| undefined` | Returns the stored `initialValue`                                     |

---

### `BeyFormSection`

Defines a named section containing one or more rows.

| Parameter          | Type           | Required | Default | Description                                        |
| ------------------ | -------------- | -------- | ------- | -------------------------------------------------- |
| `key`              | `string`       | yes      | —       | Unique section key (also used as i18n key segment) |
| `rows`             | `BeyFormRow[]` | yes      | —       | Array of rows inside this section                  |
| `isHidden`         | `boolean`      | no       | `false` | Hides the entire section                           |
| `isTitleVisible`   | `boolean`      | no       | `true`  | Shows/hides the section title                      |
| `isTooltipVisible` | `boolean`      | no       | `false` | Shows/hides a tooltip icon next to the title       |

---

### `BeyFormRow`

Defines a horizontal row of fields within a section.

| Parameter   | Type               | Required | Default   | Description                                   |
| ----------- | ------------------ | -------- | --------- | --------------------------------------------- |
| `fields`    | `BeyFormField[]`   | yes      | —         | Array of fields                               |
| `alignment` | `'start' \| 'end'` | no       | `'start'` | Horizontal alignment of fields within the row |

---

### `BeyFormButton`

An action button at the bottom of the form.

| Parameter  | Type                | Required | Default | Description                                |
| ---------- | ------------------- | -------- | ------- | ------------------------------------------ |
| `type`     | `BeyFormButtonType` | yes      | —       | Button role                                |
| `label`    | `string`            | yes      | —       | Translation key for button text            |
| `tooltip`  | `string`            | no       | `''`    | Tooltip text                               |
| `isHidden` | `boolean`           | no       | `false` | Hides the button                           |
| `action`   | `() => void`        | no       | —       | Custom click handler. Buttons with a custom action replace the default behavior and are never auto-disabled |

### `BeyFormButtonType`

| Value                        | Description                             |
| ---------------------------- | --------------------------------------- |
| `BeyFormButtonType.Cancel`   | Triggers `onCancel` callback            |
| `BeyFormButtonType.Submit`   | Triggers form validation and `onSubmit` |
| `BeyFormButtonType.Next`     | Advances to the next form step          |
| `BeyFormButtonType.Previous` | Returns to the previous form step       |
| `BeyFormButtonType.Optional` | Custom button with `action` callback    |

---

### `BeyFormStep`

Groups sections by key for multi-step navigation.

| Attribute  | Type       | Description                                          |
| ---------- | ---------- | ---------------------------------------------------- |
| `sections` | `string[]` | Array of section `key` values belonging to this step |

---

## Modal form

A form can also be opened inside a modal dialog (same look and feel as the modal module) using
`BeyModalFormService` and `BeyModalFormConfig`. `BeyModalFormConfig` extends `BeyFormConfig`, so it
reuses the same sections, rows, fields, validators and callbacks.

Requires `provideBeyModal()` in the application config (it uses `ngx-bootstrap` modals underneath).

```ts
import { BeyModalFormConfig, BeyModalFormService, BeyModalFormSize } from '@beyonda-labs/angular-components';

private readonly modalFormService = inject(BeyModalFormService);

openContactForm(): void {
    this.modalFormService.open(
        new BeyModalFormConfig({
            i18nPrefix: 'contactForm',
            initialValue: { contact: { name: '', email: '' } },
            onSubmit: (value, form) => {
                // The modal does NOT close automatically: close it only when the backend call succeeds.
                this.myService.save(value).subscribe({
                    next: () => form.close(),
                    error: () => this.modalService.openError({ ... })
                });
            },
            size: BeyModalFormSize.Large,
            sections: [
                new BeyFormSection({
                    key: 'contact',
                    rows: [
                        new BeyFormRow({
                            fields: [
                                new BeyFormTextField({ key: 'name', columns: 6, isRequired: true }),
                                new BeyFormTextField({ key: 'email', columns: 6, isRequired: true })
                            ]
                        })
                    ]
                })
            ]
        })
    );
}
```

### `BeyModalFormConfig`

**Constructor parameters:**

| Parameter          | Type                        | Required | Default | Description                                        |
| ------------------ | --------------------------- | -------- | ------- | -------------------------------------------------- |
| `i18nPrefix`       | `string`                    | yes      | —       | Prefix for the modal title, buttons and all fields |
| `sections`         | `BeyFormSection[]`          | yes      | —       | Array of form sections                             |
| `initialValue`     | `TValue`                    | no       | —       | Applied automatically once the `FormGroup` exists  |
| `steps`            | `BeyFormStep[]`             | no       | `[]`    | Step groups for multi-step forms                   |
| `onFormGroupAdded` | `(formGroup, form) => void` | no       | —       | Called once the `FormGroup` is initialized         |
| `onValueChange`    | `(value, form) => void`     | no       | —       | Called on every value change                       |
| `onSubmit`         | `(value, form) => void`     | no       | —       | Called on valid submission (does not auto-close)   |
| `size`             | `BeyModalFormSize`          | no       | `Large` | Width of the modal dialog                          |
| `title`            | `string`                    | no       | —       | Modal title key; overrides `{prefix}.title`        |
| `cancelLabel`      | `string`                    | no       | —       | Cancel label key; overrides `{prefix}.buttons.cancel` |
| `submitLabel`      | `string`                    | no       | —       | Submit label key; overrides `{prefix}.buttons.submit` |

Unlike `BeyFormConfig`, buttons are not configurable: the modal always renders a Cancel and a
Submit button whose labels are derived from `i18nPrefix` (or the explicit label overrides).

**Methods** (besides the inherited `BeyFormConfig` ones):

| Method           | Description                                                                  |
| ---------------- | ---------------------------------------------------------------------------- |
| `close()`        | Closes the modal immediately, without confirmation (e.g. after a saved item) |
| `requestClose()` | Closes the modal, asking for confirmation first if there are unsaved changes |
| `isDirty()`      | Returns whether the form has unsaved changes                                 |

### `BeyModalFormSize`

| Value                          | Bootstrap class | Width    |
| ------------------------------ | --------------- | -------- |
| `BeyModalFormSize.Small`       | `modal-sm`      | ~300px   |
| `BeyModalFormSize.Medium`      | (default)       | ~500px   |
| `BeyModalFormSize.Large`       | `modal-lg`      | ~800px   |
| `BeyModalFormSize.ExtraLarge`  | `modal-xl`      | ~1140px  |

### i18n convention

With `i18nPrefix = 'contactForm'`:

| Key pattern               | Example                     | Description         |
| ------------------------- | --------------------------- | ------------------- |
| `{prefix}.title`          | `contactForm.title`         | Modal title         |
| `{prefix}.buttons.cancel` | `contactForm.buttons.cancel`| Cancel button label |
| `{prefix}.buttons.submit` | `contactForm.buttons.submit`| Submit button label |

Sections and fields follow the standard form i18n convention under the same prefix.

### Behavior

-   `open()` returns the `BsModalRef` of the dialog.
-   Submit runs `onSubmit` (only when the form is valid) but does **not** close the modal: call
    `form.close()` when the operation succeeds (e.g. after the backend confirms), and leave it open
    on error.
-   Cancel and the `×` close button ask for confirmation when there are unsaved changes
    (`angular-components.form.modal.close-confirmation.*` keys); with no changes they close directly.
-   A click on the backdrop or the Esc key does not close the modal, so the unsaved-changes guard
    cannot be bypassed.

### Unsaved changes and navigation (`beyModalFormGuard`)

To also protect against route navigation while a modal form is open, attach the guard to the routes
that can open one:

```ts
import { beyModalFormGuard } from '@beyonda-labs/angular-components';

export const routes: Routes = [
    { path: 'products', component: ProductsPageComponent, canDeactivate: [beyModalFormGuard] }
];
```

On navigation:

-   No open modal form → navigation proceeds.
-   Open but pristine modal forms → they are closed and navigation proceeds.
-   Open dirty modal form → a confirmation modal is shown; confirming closes the forms and
    navigates, rejecting keeps the modal open and cancels the navigation.

---

## Field support

See [form-fields-readme.md](./form-fields-readme.md) for full attribute tables and examples for each field type.

Highlights:

-   **Date** — supports `minDate` and `maxDate` with `FormControl`-level validation.
-   **Number** — supports `min` and `max` with `FormControl`-level validation.
-   **Textarea** — supports `rows` and `maxHeight`.
-   **Select** and **Radio** — support `options: BeyFormFieldOption[]`.
-   **Checkbox** — uses inline label behavior and no placeholder.
-   **Chips** — tag input backed by a `string[]` control; supports `maxItems` and `allowDuplicates`.

---

## i18n convention

With `i18nPrefix = 'userForm'`:

| Key pattern                                    | Example                             | Description         |
| ---------------------------------------------- | ----------------------------------- | ------------------- |
| `{prefix}.{sectionKey}.label`                  | `userForm.profile.label`            | Section title       |
| `{prefix}.{sectionKey}.tooltip`                | `userForm.profile.tooltip`          | Section tooltip     |
| `{prefix}.{sectionKey}.{fieldKey}.label`       | `userForm.profile.name.label`       | Field label         |
| `{prefix}.{sectionKey}.{fieldKey}.placeholder` | `userForm.profile.name.placeholder` | Field placeholder   |
| `{prefix}.{sectionKey}.{fieldKey}.tooltip`     | `userForm.profile.name.tooltip`     | Field label tooltip |

---

## Callbacks

### `onFormGroupAdded`

Called once the `FormGroup` has been built and attached. Use this to set initial values safely:

```ts
onFormGroupAdded: (formGroup, form) => {
    form.setInitialValue({ name: 'John', age: 30 });
};
```

### `onValueChange`

Called on every `valueChanges` event from the `FormGroup`:

```ts
onValueChange: (value, form) => {
    console.log('Current value:', value);
};
```

### `onSubmit`

Called when the Submit button is clicked and the form is valid:

```ts
onSubmit: (value, form) => {
    this.myService.save(value);
};
```

---

## Testing status

Current module includes tests for:

-   `FormComponent`
-   `FormService`
-   `FormValidatorService`
-   Field components: text, textarea, number, date, select, radio, checkbox, chips
-   Section and row rendering helpers

---

## Best practices

-   Keep field `key` values stable over time (they determine the JSON shape and i18n key structure).
-   Use model validators instead of manual submit-time checks.
-   Set `min`/`max` or `minDate`/`maxDate` whenever the range is business-critical.
-   Use `onFormGroupAdded` to apply initial values — the `FormGroup` is not available before this callback.
-   Use `setInitialValue()` instead of `patchValue()` to support proper form reset behavior.
