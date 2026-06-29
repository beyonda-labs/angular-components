# Form Fields

This document describes the field model layer used by the `bey-form` component.

Fields are model-driven, reusable, and decoupled from rendering. Each field maps to a `FormControl` created by `FormService`.

## Overview

-   All fields extend the abstract `BeyFormField` model.
-   Fields define layout, visibility, validation, and type.
-   The rendered component is selected by `FormFieldType` in `field.component.html`.

---

## Base model

### `BeyFormField` (abstract)

All concrete fields inherit these properties:

| Attribute               | Type                           | Default  | Description                            |
| ----------------------- | ------------------------------ | -------- | -------------------------------------- |
| `key`                   | `string`                       | required | Unique field ID within the section     |
| `columns`               | `BeyFormFieldColumn` (1-12)    | `12`     | Bootstrap grid column width            |
| `isDisabled`            | `boolean`                      | `false`  | Disables the `FormControl`             |
| `isHidden`              | `boolean`                      | `false`  | Hides the field from the template      |
| `isRequired`            | `boolean`                      | `false`  | Adds Angular's `Validators.required`   |
| `isLabelVisible`        | `boolean`                      | `true`   | Shows/hides the field label            |
| `isLabelTooltipVisible` | `boolean`                      | `false`  | Shows a tooltip icon next to the label |
| `isPlaceholderVisible`  | `boolean`                      | `true`   | Shows/hides the placeholder text       |
| `validators`            | `BeyFormFieldValidator[]`      | `[]`     | Array of sync validators               |
| `asyncValidators`       | `BeyFormFieldAsyncValidator[]` | `[]`     | Array of async validators              |

---

### `BeyFormFieldType`

The `type` discriminator used by `field.component.html` to select the rendered component:

| Value                       | Description            |
| --------------------------- | ---------------------- |
| `BeyFormFieldType.Text`     | Single-line text input |
| `BeyFormFieldType.Textarea` | Multi-line textarea    |
| `BeyFormFieldType.Number`   | Numeric input          |
| `BeyFormFieldType.Date`     | Date picker input      |
| `BeyFormFieldType.Select`   | Dropdown select        |
| `BeyFormFieldType.Radio`    | Radio button group     |
| `BeyFormFieldType.Checkbox` | Boolean checkbox       |

---

### `BeyFormFieldOption`

Used by `BeyFormSelectField` and `BeyFormRadioField` to define individual options:

| Attribute    | Type      | Required | Description                       |
| ------------ | --------- | -------- | --------------------------------- |
| `label`      | `string`  | yes      | Translation key or display label  |
| `value`      | `string`  | yes      | Value stored in the `FormControl` |
| `isDisabled` | `boolean` | no       | Disables this individual option   |

---

## Concrete fields

### `BeyFormTextField`

Single-line text input. No additional attributes beyond the base model.

```ts
new BeyFormTextField({
    key: 'firstName',
    columns: 6,
    isRequired: true,
    validators: [new BeyFormFieldLengthValidator(50, BeyFormFieldValidatorType.MaxLength)]
});
```

---

### `BeyFormTextareaField`

Multi-line textarea control.

**Extra attributes:**

| Attribute   | Type     | Default     | Description                                           |
| ----------- | -------- | ----------- | ----------------------------------------------------- |
| `rows`      | `number` | `3`         | Initial number of visible rows                        |
| `maxHeight` | `string` | `undefined` | CSS `max-height` for scroll overflow (e.g. `'200px'`) |

```ts
new BeyFormTextareaField({
    key: 'description',
    columns: 12,
    rows: 5,
    maxHeight: '200px'
});
```

---

### `BeyFormNumberField`

Numeric input control. `min` and `max` are applied both as HTML attributes and as `FormControl` validators.

**Extra attributes:**

| Attribute | Type     | Default     | Description                                        |
| --------- | -------- | ----------- | -------------------------------------------------- |
| `min`     | `number` | `undefined` | Minimum allowed value (adds `minNumber` validator) |
| `max`     | `number` | `undefined` | Maximum allowed value (adds `maxNumber` validator) |

```ts
new BeyFormNumberField({
    key: 'quantity',
    columns: 4,
    min: 1,
    max: 100
});
```

---

### `BeyFormDateField`

Date picker control based on `ngx-bootstrap`, styled to match the minimal text inputs. `minDate` and `maxDate` are applied both in the picker and as `FormControl` validators.

**Extra attributes:**

| Attribute | Type     | Default      | Description                                                              |
| --------- | -------- | ------------ | ------------------------------------------------------------------------ |
| `format`  | `string` | `YYYY-MM-DD` | Display and storage format used by the field and its default placeholder |
| `minDate` | `string` | `undefined`  | Minimum date in the field format (adds `minDate` validator)              |
| `maxDate` | `string` | `undefined`  | Maximum date in the field format (adds `maxDate` validator)              |

```ts
new BeyFormDateField({
    key: 'startDate',
    columns: 6,
    format: 'DD/MM/YYYY',
    minDate: '01/01/2026',
    maxDate: '31/12/2026'
});
```

---

### `BeyFormSelectField`

Dropdown select control.

**Extra attributes:**

| Attribute | Type                   | Default | Description                 |
| --------- | ---------------------- | ------- | --------------------------- |
| `options` | `BeyFormFieldOption[]` | `[]`    | Array of selectable options |

```ts
new BeyFormSelectField({
    key: 'country',
    columns: 6,
    options: [
        { label: 'countries.es', value: 'es' },
        { label: 'countries.us', value: 'us' },
        { label: 'countries.mx', value: 'mx', isDisabled: true }
    ]
});
```

---

### `BeyFormRadioField`

Radio button group control.

**Extra attributes:**

| Attribute | Type                   | Default | Description            |
| --------- | ---------------------- | ------- | ---------------------- |
| `options` | `BeyFormFieldOption[]` | `[]`    | Array of radio options |

```ts
new BeyFormRadioField({
    key: 'gender',
    columns: 8,
    options: [
        { label: 'gender.male', value: 'M' },
        { label: 'gender.female', value: 'F' }
    ]
});
```

---

### `BeyFormCheckboxField`

Boolean checkbox control.

**Behavior differences from base:**

-   `isLabelVisible` defaults to `true`.
-   `isPlaceholderVisible` is always `false` (no placeholder rendered for checkboxes).

```ts
new BeyFormCheckboxField({
    key: 'acceptTerms',
    columns: 12,
    isRequired: true
});
```

---

## Validators

### Sync validators

Sync validators are passed via the `validators` array on any field. They are applied when `FormService` creates the `FormControl`.

| Class                          | Constructor                  | Validator type            | Description                      |
| ------------------------------ | ---------------------------- | ------------------------- | -------------------------------- |
| `BeyFormFieldLengthValidator`  | `(length: number, type)`     | `MaxLength` / `MinLength` | Character length bounds          |
| `BeyFormFieldPatternValidator` | `(pattern: RegExp)`          | `Pattern`                 | RegExp pattern match             |
| `BeyFormFieldEmailValidator`   | `()`                         | `Email`                   | Email address format             |
| `BeyFormFieldUrlValidator`     | `()`                         | `Url`                     | URL format                       |
| `BeyFormFieldCustomValidator`  | `(validatorFn: ValidatorFn)` | `Custom`                  | Any custom Angular `ValidatorFn` |

**Examples:**

```ts
import {
    BeyFormFieldLengthValidator,
    BeyFormFieldValidatorType,
    BeyFormFieldPatternValidator,
    BeyFormFieldEmailValidator,
    BeyFormFieldUrlValidator,
    BeyFormFieldCustomValidator
} from '@beyonda-labs/angular-components';
import { AbstractControl, ValidationErrors } from '@angular/forms';

// MaxLength
new BeyFormFieldLengthValidator(100, BeyFormFieldValidatorType.MaxLength);

// MinLength
new BeyFormFieldLengthValidator(3, BeyFormFieldValidatorType.MinLength);

// Pattern
new BeyFormFieldPatternValidator(/^[A-Z]{2}$/);

// Email
new BeyFormFieldEmailValidator();

// URL
new BeyFormFieldUrlValidator();

// Custom
new BeyFormFieldCustomValidator((control: AbstractControl): ValidationErrors | null => {
    return control.value === 'forbidden' ? { forbidden: true } : null;
});
```

---

### Async validators

Async validators are passed via the `asyncValidators` array. They receive an `AsyncValidatorFn` directly.

```ts
import { BeyFormFieldAsyncValidator } from '@beyonda-labs/angular-components';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

new BeyFormFieldAsyncValidator(control => of(control.value === 'taken' ? { taken: true } : null).pipe(delay(300)));
```

---

## Full example

```ts
import {
    BeyFormSection,
    BeyFormRow,
    BeyFormTextField,
    BeyFormTextareaField,
    BeyFormNumberField,
    BeyFormDateField,
    BeyFormSelectField,
    BeyFormRadioField,
    BeyFormCheckboxField,
    BeyFormFieldLengthValidator,
    BeyFormFieldValidatorType
} from '@beyonda-labs/angular-components';

new BeyFormSection({
    key: 'profile',
    rows: [
        new BeyFormRow({
            fields: [
                new BeyFormTextField({
                    key: 'name',
                    columns: 6,
                    isRequired: true,
                    validators: [new BeyFormFieldLengthValidator(100, BeyFormFieldValidatorType.MaxLength)]
                }),
                new BeyFormNumberField({ key: 'age', columns: 3, min: 18, max: 120 }),
                new BeyFormDateField({ key: 'birthDate', columns: 3, maxDate: '2008-01-01' })
            ]
        }),
        new BeyFormRow({
            fields: [
                new BeyFormSelectField({
                    key: 'country',
                    columns: 6,
                    options: [
                        { label: 'countries.es', value: 'es' },
                        { label: 'countries.us', value: 'us' }
                    ]
                }),
                new BeyFormRadioField({
                    key: 'gender',
                    columns: 6,
                    options: [
                        { label: 'gender.male', value: 'M' },
                        { label: 'gender.female', value: 'F' }
                    ]
                })
            ]
        }),
        new BeyFormRow({
            fields: [
                new BeyFormTextareaField({ key: 'bio', columns: 8, rows: 4, maxHeight: '160px' }),
                new BeyFormCheckboxField({ key: 'acceptTerms', columns: 4, isRequired: true })
            ]
        })
    ]
});
```
