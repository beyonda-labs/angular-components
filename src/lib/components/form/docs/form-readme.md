# Form Component (`bey-form`)

Model-driven form component built from sections, rows, and fields.

Supported capabilities:

-   Dynamic sections and row layouts.
-   Multiple field types: text, textarea, number, date, select, radio, checkbox.
-   Sync and async validation.
-   Action buttons (cancel, submit, next, previous, optional).
-   i18n via `i18nPrefix`.
-   Lifecycle callbacks: `onFormGroupAdded`, `onValueChange`, `onSubmit`, `onCancel`.

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
| `action`   | `() => void`        | no       | —       | Custom click handler (for `Optional` type) |

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

## Field support

See [form-fields-readme.md](./form-fields-readme.md) for full attribute tables and examples for each field type.

Highlights:

-   **Date** — supports `minDate` and `maxDate` with `FormControl`-level validation.
-   **Number** — supports `min` and `max` with `FormControl`-level validation.
-   **Textarea** — supports `rows` and `maxHeight`.
-   **Select** and **Radio** — support `options: BeyFormFieldOption[]`.
-   **Checkbox** — uses inline label behavior and no placeholder.

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
-   Field components: text, textarea, number, date, select, radio, checkbox
-   Section and row rendering helpers

---

## Best practices

-   Keep field `key` values stable over time (they determine the JSON shape and i18n key structure).
-   Use model validators instead of manual submit-time checks.
-   Set `min`/`max` or `minDate`/`maxDate` whenever the range is business-critical.
-   Use `onFormGroupAdded` to apply initial values — the `FormGroup` is not available before this callback.
-   Use `setInitialValue()` instead of `patchValue()` to support proper form reset behavior.
