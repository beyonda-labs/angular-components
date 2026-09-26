# Form fields

Every field extends `BeyFormField` and takes the same base parameters; each type adds its own.

## Base parameters

| Parameter               | Default | Meaning                                                            |
| ----------------------- | ------- | ------------------------------------------------------------------ |
| `key`                   |         | Name of the control and of its texts                                |
| `columns`               | `12`    | Width in the twelve-column row                                       |
| `isRequired`            | `false` | Adds the required validator and the marker next to the label         |
| `isDisabled`            | `false` | Value or rule, see the form README                                   |
| `isHidden`              | `false` | Value or rule; a hidden field is disabled as well                    |
| `isLabelVisible`        | `true`  | Shows the label above the control                                    |
| `isLabelTooltipVisible` | `false` | Shows an info icon with `<prefix>.<key>.tooltip`                     |
| `placeholder`           |         | Overrides `<prefix>.<key>.placeholder`                               |
| `validators`            | `[]`    | Sync validators, see below                                           |
| `asyncValidators`       | `[]`    | `BeyFormFieldAsyncValidator` instances                               |

## Fields

| Field                       | Value      | Extra parameters                                        |
| --------------------------- | ---------- | ------------------------------------------------------- |
| `BeyFormTextField`          | `string`   |                                                         |
| `BeyFormTextareaField`      | `string`   | `rows` (`3`), `maxHeight`                               |
| `BeyFormPasswordField`      | `string`   | `showToggle` (`true`)                                   |
| `BeyFormNumberField`        | `number`   | `min`, `max`, both validated and honoured by the spinners |
| `BeyFormDateField`          | `string`   | `format` (`YYYY-MM-DD`), `minDate`, `maxDate` in that format |
| `BeyFormSelectField`        | `string`   | `options`, a value or a rule                            |
| `BeyFormRadioField`         | `string`   | `options`, a value or a rule                            |
| `BeyFormAutocompleteField`  | `string`   | `options`, a value or a rule; `emptyKey`                |
| `BeyFormCheckboxField`      | `boolean`  | `isSwitch` (`false`)                                    |
| `BeyFormChipsField`         | `string[]` | `maxItems`, `allowDuplicates` (`false`)                 |
| `BeyFormFileField`          | `File`     | `accept` (`[]`), `maxSizeBytes`, both validated         |
| `BeyFormTextVariableField`  | `string`   | `options`, a value or a rule, inserted as `{{ value }}` |
| `BeyFormInfoField`          | none       | `items: { label, icon? }[]`, shows text without a control |

An option is `{ label, value, badge?, isDisabled? }`; `label` and `badge` are translation keys.

The date field keeps the value as text in `format` and shows a datepicker in the current language. The
autocomplete and the variable picker float above their ancestors, so a scrolling modal cannot clip them.
The chips field adds a chip on Enter, comma or blur and removes the last one with Backspace on an empty input.

## Validators

| Validator                       | Checks                                   |
| ------------------------------- | ---------------------------------------- |
| `BeyFormFieldLengthValidator`   | `minLength` or `maxLength`, per its type |
| `BeyFormFieldPatternValidator`  | A regular expression                     |
| `BeyFormFieldEmailValidator`    | An email address                         |
| `BeyFormFieldUrlValidator`      | An `http` or `https` url                 |
| `BeyFormFieldCustomValidator`   | Any Angular `ValidatorFn`                |
| `BeyFormFieldAsyncValidator`    | Any Angular `AsyncValidatorFn`           |

```ts
new BeyFormTextField({
    key: 'slug',
    validators: [
        new BeyFormFieldLengthValidator(3, BeyFormFieldValidatorType.MinLength),
        new BeyFormFieldPatternValidator(/^[a-z-]+$/u)
    ]
})
```
