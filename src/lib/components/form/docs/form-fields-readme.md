# Form fields

Every field extends `BeyFormField` and takes the same base parameters; each type adds its own.

## Base parameters

| Parameter               | Default | Meaning                                                         |
| ----------------------- | ------- | --------------------------------------------------------------- |
| `key`                   |         | Name of the control; in kebab-case, the segment of its texts    |
| `columns`               | `12`    | Width in the twelve-column row                                  |
| `isRequired`            | `false` | Value or rule; adds the required validator and the label marker |
| `isDisabled`            | `false` | Value or rule, see the form README                              |
| `isHidden`              | `false` | Value or rule; a hidden field is disabled as well               |
| `isLabelVisible`        | `true`  | Shows the label above the control                               |
| `isLabelTooltipVisible` | `false` | Shows an info icon with `<prefix>.<key>.tooltip`                |
| `placeholder`           |         | Overrides `<prefix>.<key>.placeholder`                          |
| `validators`            | `[]`    | Sync validators; which ones depends on the value, see below     |
| `asyncValidators`       | `[]`    | `BeyFormFieldAsyncValidator` instances                          |

## Fields

| Field                      | Value      | Extra parameters                                             |
| -------------------------- | ---------- | ------------------------------------------------------------ |
| `BeyFormTextField`         | `string`   |                                                              |
| `BeyFormTextareaField`     | `string`   | `rows` (`3`), `maxHeight`                                    |
| `BeyFormPasswordField`     | `string`   | `showToggle` (`true`)                                        |
| `BeyFormNumberField`       | `number`   | `min`, `max`, both validated and honoured by the spinners    |
| `BeyFormDateField`         | `string`   | `format` (`YYYY-MM-DD`), `minDate`, `maxDate` in that format |
| `BeyFormSelectField`       | `string`   | `options`, a value or a rule                                 |
| `BeyFormRadioField`        | `string`   | `options`, a value or a rule                                 |
| `BeyFormAutocompleteField` | `string`   | `options`, a value or a rule; `emptyKey`                     |
| `BeyFormCheckboxField`     | `boolean`  | `isSwitch` (`false`)                                         |
| `BeyFormChipsField`        | `string[]` | `maxItems`, `allowDuplicates` (`false`)                      |
| `BeyFormFileField`         | `File`     | `accept` (`[]`), `maxSizeBytes`, both validated              |
| `BeyFormTextVariableField` | `string`   | `options`, a value or a rule, inserted as `{{ value }}`      |
| `BeyFormInfoField`         | none       | `items: { label, icon? }[]`, shows text without a control    |

An option is `{ label, value, badge?, isDisabled? }`; `label` and `badge` are translation keys. When the options
of a select, a radio or an autocomplete change and no longer list its value, the form clears it.

The date field keeps the value as text in `format` and shows a datepicker in the current language. The
autocomplete and the variable picker float above their ancestors, so a scrolling modal cannot clip them.
The chips field adds a chip on Enter, comma or blur and removes the last one with Backspace on an empty input.

## Validators

| Validator                      | Checks                                                              |
| ------------------------------ | ------------------------------------------------------------------- |
| `BeyFormFieldLengthValidator`  | `minLength` or `maxLength`, per its type                            |
| `BeyFormFieldPatternValidator` | A regular expression                                                |
| `BeyFormFieldEmailValidator`   | An email address                                                    |
| `BeyFormFieldUrlValidator`     | An `http` or `https` url                                            |
| `BeyFormFieldCustomValidator`  | Any Angular `ValidatorFn`, run again when a signal it reads changes |
| `BeyFormFieldAsyncValidator`   | Any Angular `AsyncValidatorFn`                                      |

```ts
new BeyFormRow({
    fields: [
        new BeyFormTextField({
            key: 'slug',
            validators: [
                new BeyFormFieldLengthValidator(3, BeyFormFieldValidatorType.MinLength),
                new BeyFormFieldPatternValidator(/^[a-z-]+$/u)
            ]
        }),
        new BeyFormChipsField({
            key: 'tags',
            maxItems: 5,
            validators: [
                new BeyFormFieldCustomValidator(control =>
                    control.value?.includes('draft') ? { reserved: true } : null
                )
            ]
        })
    ]
});
```

Which validators a field takes depends on its value:

| Value                                   | Fields                                                                     | Validators                         |
| --------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------- |
| `string`                                | text, textarea, password, date, select, radio, autocomplete, text variable | All of them                        |
| `number`, `boolean`, `string[]`, `File` | number, checkbox, chips, file                                              | `BeyFormFieldCustomValidator` only |

The length, pattern, email and url validators are written for text. On the other values they would do nothing
(a length on a number or a `File`), count something else (a length on the chips counts the chips, which
`maxItems` already covers) or fail every time (an email on a boolean). So the parameters of those four fields
type `validators` as `BeyFormFieldCustomValidator[]`, and passing any other validator does not compile; a
custom validator receives the whole value: the number, the boolean, the array of chips or the `File`. On a
select, a radio or an autocomplete, the validators check the `value` of the chosen option, never its label nor
the text typed to filter.

The checks a field brings with it (`min` and `max`, `minDate` and `maxDate`, `maxItems`, `accept` and
`maxSizeBytes`) run together with its validators, and the field is valid only when all of them pass. The info
field has no control, so it has nothing to validate.

Every field flags itself once touched while any of them fails: `aria-invalid` on the control and the invalid
border. Apart from the file field, which writes a message for its own `accept` and `maxSizeBytes` checks, no
field shows the text of an error.
