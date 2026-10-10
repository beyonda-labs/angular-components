# Form fields

Every field extends `BeyFormField` and takes the same base parameters; each type adds its own.

## Base parameters

| Parameter               | Default | Meaning                                                          |
| ----------------------- | ------- | ---------------------------------------------------------------- |
| `key`                   |         | Name of the control; in kebab-case, the segment of its texts     |
| `columns`               | `12`    | Width in the twelve-column row                                   |
| `isRequired`            | `false` | Value or rule; adds the required validator and the label marker  |
| `isDisabled`            | `false` | Value or rule, see the form README                               |
| `isHidden`              | `false` | Value or rule; a hidden field is disabled as well                |
| `isLabelVisible`        | `true`  | Shows the label above the control                                |
| `isLabelTooltipVisible` | `false` | Shows an info icon with `<prefix>.<key>.tooltip`                 |
| `label`                 |         | Overrides `<prefix>.<key>.label`, for a label built from data    |
| `placeholder`           |         | Overrides `<prefix>.<key>.placeholder`                           |
| `hint`                  |         | Translation key of a short text shown under the field, see below |
| `validators`            | `[]`    | Sync validators; which ones depends on the value, see below      |
| `asyncValidators`       | `[]`    | `BeyFormFieldAsyncValidator` instances                           |
| `autocomplete`          |         | Autofill hint of a text or password field, such as `email`       |

## Fields

| Field                       | Value      | Extra parameters                                                                                                                             |
| --------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `BeyFormTextField`          | `string`   |                                                                                                                                              |
| `BeyFormTextareaField`      | `string`   | `rows` (`3`), `maxHeight`                                                                                                                    |
| `BeyFormPasswordField`      | `string`   | `showToggle` (`true`); `policy`, a `BeyPasswordPolicy` or a signal of one, see below                                                         |
| `BeyFormNumberField`        | `number`   | `min`, `max`, both validated and honoured by the spinners                                                                                    |
| `BeyFormDateField`          | `string`   | `format` (`YYYY-MM-DD`), `minDate`, `maxDate` in that format                                                                                 |
| `BeyFormSelectField`        | `string`   | `options`, a value or a rule                                                                                                                 |
| `BeyFormRadioField`         | `string`   | `options`, a value or a rule                                                                                                                 |
| `BeyFormAutocompleteField`  | `string`   | `options`, a value or a rule; `emptyKey`; `isFreeTextAllowed` (`false`)                                                                      |
| `BeyFormCheckboxField`      | `boolean`  | `isSwitch` (`false`)                                                                                                                         |
| `BeyFormCheckboxGroupField` | `string[]` | `options`, a value or a rule; one checkbox per option, the value lists the checked ones in the order they were checked                       |
| `BeyFormChipsField`         | `string[]` | `maxItems`, `allowDuplicates` (`false`)                                                                                                      |
| `BeyFormFileField`          | `File`     | `accept` (`[]`), `maxSizeBytes`, both validated                                                                                              |
| `BeyFormTextVariableField`  | `string`   | `options`, a value or a rule, inserted as `{{ value }}`                                                                                      |
| `BeyFormInfoField`          | none       | `items: { label, icon?, tooltip?, tooltipItems? }[]`, shows text without a control, with a tooltip that lists `tooltipItems` under `tooltip` |
| `BeyFormListField`          | none       | `items`, a list of texts or a signal of one; shows its placeholder while empty                                                               |

An option is `{ label, value, badge?, isDisabled? }`; `label` and `badge` are translation keys. When the options
of a select, a radio or an autocomplete change and no longer list its value, the form clears it. An autocomplete with
`isFreeTextAllowed` takes what is typed as its value and offers the options as suggestions, so its value need not be
one of them and the form keeps it; it shows no panel while no option matches.

The list field shows read-only texts, such as everything that uses a record, in a bordered box. It never scrolls on
its own: it grows with its texts and the form scrolls, so a modal has one scrollbar. A signal lets the texts arrive
after the form opens. Like the info field, it has no control.

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
| `number`, `boolean`, `string[]`, `File` | number, checkbox, checkbox group, chips, file                              | `BeyFormFieldCustomValidator` only |

The length, pattern, email and url validators are written for text. On the other values they would do nothing
(a length on a number or a `File`), count something else (a length on the chips counts the chips, which
`maxItems` already covers) or fail every time (an email on a boolean). So the parameters of those five fields
type `validators` as `BeyFormFieldCustomValidator[]`, and passing any other validator does not compile; a
custom validator receives the whole value: the number, the boolean, the array of chips or of checked values, or the
`File`. A required checkbox group needs at least one option checked. On a select, a radio or an autocomplete, the
validators check the `value` of the chosen option, never its label nor the text typed to filter.

The checks a field brings with it (`min` and `max`, `minDate` and `maxDate`, `maxItems`, `accept` and
`maxSizeBytes`) run together with its validators, and the field is valid only when all of them pass. The info
field has no control, so it has nothing to validate.

Every field flags itself once touched while any of them fails: `aria-invalid` on the control and the invalid
border. The file field writes a message for its own `accept` and `maxSizeBytes` checks.

## Error messages

A validator that returns its error as a `BeyFormFieldError`, `{ messageKey, messageParameters? }`, gets its text
under the field once the field is touched: the first such error, translated with its parameters, in an
`alert`. An error with any other value only flags the field, as before. It works the same from a custom or an
async validator, and the file field hides its size hint while it shows.

```ts
new BeyFormFileField({
    key: 'file',
    asyncValidators: [
        new BeyFormFieldAsyncValidator(control =>
            findByContent(control.value).pipe(
                map(existing =>
                    existing
                        ? {
                              duplicate: {
                                  messageKey: 'app.files.duplicate',
                                  messageParameters: { name: existing.name }
                              }
                          }
                        : null
                )
            )
        )
    ]
});
```

## Hints

A field with a `hint` shows that text under it, every type alike, the info and list fields included, and the field
is described by it through `aria-describedby`: the control, the group of a radio or a checkbox group, the list, or
the value of an info field. The key is used as given, like `placeholder`; there is none by default, and an empty one
shows none.

```ts
new BeyFormPasswordField({ hint: 'myApp.account.password.password.hint', key: 'password' });
```

While the field shows an error message (see above), the message replaces the hint and the field is described by the
message instead; the hint comes back once the message goes. A validator that fails without a message only flags the
field, so the hint stays: a minimum length with a hint that states it reads well that way. A field without a hint is
described by its error message alone, while it shows. The file field writes its size limit under the control as well,
above the hint. A password field with a `policy` shows the rules of the policy instead of its hint (see below).

## Password policy

A password field with a `policy` lists the rules of that policy under the control, in place of its `hint`: the
length always, as `angular-components.form.password-field.policy.length` with the `min` of the policy, and each
character rule the policy turns on, `uppercase`, `lowercase`, `digit` and `symbol`, in that order. Each rule is marked
met or not as the user types, with an icon and a status only screen readers read (`.met` / `.unmet`); the list is a
polite live region, so a rule that changes is announced, and the field is described by it through
`aria-describedby`. An unmet rule stays neutral until the field is touched, and shows in the error colour after that;
an empty field that is not required flags nothing.

The field also gets a validator that fails while a rule is unmet, with `{ passwordPolicy: { unmet } }`, so the form
holds back its submit; it carries no message, since the list already says what is missing. A password longer than
the `maxLength` of the policy fails with `angular-components.form.password-field.policy.too-long` and its `max`,
shown under the list. Like the minimum length of Angular, the validator lets an empty value through: `isRequired`
judges that. A policy given as a signal is read again whenever it changes, and the field is validated again with it.

The character classes are Unicode aware and the length counts characters (code points), exactly as
express-components checks them:

| Rule      | A character that meets it                               |
| --------- | ------------------------------------------------------- |
| Uppercase | An uppercase letter, `\p{Lu}`, such as `A` or `É`       |
| Lowercase | A lowercase letter, `\p{Ll}`, such as `a` or `ñ`        |
| Digit     | A decimal digit, `\p{Nd}`, such as `7` or `٣`           |
| Symbol    | Anything but a letter, a number or a space, such as `¿` |

The library reads the policy of the server with the [password policy service](../../../services/password-policy/docs/password-policy-readme.md)
and gives it to every password it asks for: `bey-password-change`, the reset-password and accept-invitation pages and
the registration of the login. An app gives it to a field of its own the same way; a confirmation field takes none.

```ts
private readonly passwordPolicyService = inject(BeyPasswordPolicyService);

readonly password = new BeyFormPasswordField({
    autocomplete: 'new-password',
    isRequired: true,
    key: 'password',
    policy: this.passwordPolicyService.policy
});
```
