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

| Field                          | Value               | Extra parameters                                                                                                                                                                                       |
| ------------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `BeyFormTextField`             | `string`            |                                                                                                                                                                                                        |
| `BeyFormTextareaField`         | `string`            | `rows` (`3`), `maxHeight`                                                                                                                                                                              |
| `BeyFormPasswordField`         | `string`            | `isToggleShown` (`true`); `policy`, a `BeyPasswordPolicy` or a signal of one, see below                                                                                                                |
| `BeyFormNumberField`           | `number`            | `min`, `max`, both validated and honoured by the spinners                                                                                                                                              |
| `BeyFormDateField`             | `string`            | `format` (`YYYY-MM-DD`), `minDate`, `maxDate` in that format                                                                                                                                           |
| `BeyFormSelectField`           | `string`            | `options`, a value or a rule                                                                                                                                                                           |
| `BeyFormRadioField`            | `string`            | `options`, a value or a rule                                                                                                                                                                           |
| `BeyFormAutocompleteField`     | `string`            | `options`, a value or a rule; `emptyKey`; `isFreeTextAllowed` (`false`); `filter`, `search`, `onSelect`, `isClearedOnSelect` (`false`), `isTypeahead` (`false`) and `excludedValues`, see below        |
| `BeyFormCheckboxField`         | `boolean`           | `isSwitch` (`false`)                                                                                                                                                                                   |
| `BeyFormCheckboxGroupField`    | `string[]`          | `options`, a value or a rule; one checkbox per option, the value lists the checked ones in the order they were checked                                                                                 |
| `BeyFormCheckboxSectionsField` | `string[]`          | `sections`, a `BeyFormCheckboxSection[]`; one foldable card of checkboxes per section, the value lists every checked one, see below                                                                    |
| `BeyFormChipsField`            | `string[]`          | `maxItems`, `canAddDuplicates` (`false`)                                                                                                                                                               |
| `BeyFormFileField`             | `File`              | `accept` (`[]`), `maxSizeBytes`, both validated                                                                                                                                                        |
| `BeyFormTextVariableField`     | `string`            | `options`, a value or a rule, inserted as `{{ value }}`                                                                                                                                                |
| `BeyFormInfoField`             | none                | `items: { label, icon?, tooltip?, tooltipItems? }[]`, shows text without a control, with a tooltip that lists `tooltipItems` under `tooltip`                                                           |
| `BeyFormListField`             | none, or `string[]` | `items`, a list of texts or a signal of one, and `onItemClick`; or `options`, `picker`, `isRemovable` (`false`), `emptyKey` and `excludedValues` to hold ids, see below                                |
| `BeyFormNoticeField`           | none                | `message`, a translation key, its `messageParameters` and a `variant` of `BeyNoticeVariant` (`Info`): a [`bey-notice`](../../notice/docs/notice-readme.md) across the row, its label hidden by default |

An option is `{ label, value, badge?, isDisabled? }`; `label` and `badge` are translation keys. When the options
of a select, a radio or an autocomplete change and no longer list its value, the form clears it, and a list that holds
ids drops the ids they no longer list, unless its picker has a `search` (see
[Lists that hold ids](#lists-that-hold-ids)). An autocomplete with `isFreeTextAllowed` takes what is typed as its
value and offers the options as suggestions, so its value need not be one of them and the form keeps it; it shows no
panel while no option matches.

The list field shows read-only texts, such as everything that uses a record, in a bordered box. It grows with its
rows up to seven and a half of them, `--bey-form-list-max-height`, and scrolls inside the box past that, the half row
telling there is more; a short list keeps its own height. A signal lets the texts arrive after the form opens. Like
the info field, it has no control, unless it holds ids (see [Lists that hold ids](#lists-that-hold-ids)). Its empty
text is `emptyKey`, or else its placeholder. With `onItemClick`, `(item, index) => void`, every text is a button
that reads as a link (`--bey-form-list-link`, `--bey-text-link` by default, and `--bey-form-list-link-hover`, underlined
under the pointer and on keyboard focus) and calls it with the text and its place in the list, such as the roles of a
group that each open their permissions.

The notice field says something about the form inside it, such as a warning before a deletion: it renders the
`bey-notice` of its `variant` with `message` translated with its `messageParameters`, without actions, and has no
control, so it never changes the value nor the validity of the form.

The date field keeps the value as text in `format` and shows a datepicker in the current language. The
autocomplete and the variable picker float above their ancestors, so a scrolling modal cannot clip them. The panel
of an autocomplete grows with its suggestions up to `--bey-form-autocomplete-panel-max-height`, `13rem` by default,
and scrolls past that, every suggestion, the empty text and the line about more matches keeping their own height.
The chips field adds a chip on Enter, comma or blur and removes the last one with Backspace on an empty input.

## Searching and picking

An autocomplete matches what is typed anywhere in the label of each option, whatever its case, its accents and its
runs of spaces: "nora", "nora lec" and "NORA@" all find "Nora Lectora (nora@empresa.com)", and "inigo" finds "Íñigo".
The fold is the one express-components searches with: NFD, the accents U+0300 to U+036F taken away, lower case and
the spaces collapsed.

| Parameter           | Default | Meaning                                                                                                                                                                     |
| ------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `filter`            |         | `(option, text) => boolean`, the match instead of the default one; `text` is the typed text, trimmed                                                                        |
| `search`            |         | A `BeyFormAutocompleteSearch`, `(text, excludedValues) => Observable<BeyFormFieldOption[] \| BeyFormAutocompleteSearchResult>`: the suggestions come from it, not `options` |
| `excludedValues`    | `[]`    | Values never suggested, such as those already chosen; a value or a rule                                                                                                     |
| `onSelect`          |         | Run with the option picked, after the field took it                                                                                                                         |
| `isClearedOnSelect` | `false` | A pick leaves the value and the input empty, so the field only picks; `onSelect` receives the option                                                                        |
| `isTypeahead`       | `false` | A text input with no toggle that suggests nothing until something is typed, see below                                                                                       |

-   **`search`** is asked for `''` as soon as the panel opens, and for the typed text, trimmed, once typing settles for
    300 ms; a newer text cancels the answer of an older one. Its answer is shown as it comes, less `excludedValues`:
    neither `filter` nor the default match runs on it, since the server matched already. While it has not answered,
    the panel stays closed; an empty or a failed answer shows `emptyKey`. It receives `excludedValues` so it can ask a
    server for enough rows once those are left out. `options` still names the current value of a field that keeps
    one; a value picked from `search` keeps its label too.
-   **More matches.** `search` may answer a `BeyFormAutocompleteSearchResult`, `{ options, hasMore? }`, instead of the
    options alone. With `hasMore`, the panel ends with a muted line, `angular-components.form.autocomplete-field.more`
    ("There are more matches: type more to narrow them down."), that stays in sight at its bottom while the
    suggestions scroll; when every option it answered is left out, that line shows instead of `emptyKey`. A search
    that answers a page of a server sets it when the server filled the page. An array, or `hasMore` false, shows no
    such line; a field without `search` never shows it.
-   **`excludedValues`** applies to `options` and to `search` alike.
-   **`isTypeahead`** drops the chevron and the list on focus: the panel opens only with what is typed, trimmed, not
    empty, and closes again when the text is emptied, so `search` is never asked for `''`, only for the typed text
    once typing settles. Without `isFreeTextAllowed` the value is only ever an option picked from the panel: typing
    over a picked one empties the value at once, and leaving the field, or Escape, with text that was not picked
    clears the text, as every autocomplete without free text does, so a required one shows its error and holds the
    form back. The clear button stays while there is a value. With `isFreeTextAllowed`, the typed text is the value as
    usual.

## Lists that hold ids

Given `options` or a `picker`, a list field holds a value, an array of ids, instead of showing `items`: a row per id
with the label of the option of that id, a translation key or a literal, or the id itself when no option names it. The
value starts from the initial value of the form, `[]` without one, and comes back in `value()` and `onSubmit` like any
other; a required list needs one id at least.

```ts
new BeyFormListField({
    emptyKey: 'myApp.groups.form.main.user-ids.empty',
    isRemovable: true,
    key: 'userIds',
    options: group.members.map(toOption),
    picker: { search: (text, chosenIds) => this.searchPeople(text, chosenIds) }
});
```

| Parameter        | Default | Meaning                                                                                                           |
| ---------------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| `options`        |         | The labels of the ids, a value or a rule; without `search`, also what the picker suggests                         |
| `picker`         |         | A `BeyFormListPicker`, `{ search?, filter?, onSelect?, placeholder?, emptyKey? }`: an autocomplete above the rows |
| `isRemovable`    | `false` | A remove button at the end of every row                                                                           |
| `emptyKey`       |         | The text shown while it holds no id; without it, the placeholder                                                  |
| `excludedValues` | `[]`    | Ids the picker never suggests besides the ones the list holds, a value or a rule                                  |

-   **The picker** is a `BeyFormAutocompleteField` with `isClearedOnSelect`: one input above the rows, named by the
    label of the field and with its `id`, whose placeholder is `picker.placeholder` or `<prefix>.<key>.placeholder`.
    It never suggests the ids the list holds, nor those of `excludedValues`, which its `search` receives with them, so
    two lists that exclude each other's value never hold the same id. A pick adds a row with the label of the option
    and empties the input, then runs `picker.onSelect`; the label of an option that came from `search` stays with its
    row.
-   **Removing.** With `isRemovable`, each row ends with a button named `angular-components.form.list-field.remove`
    with the label of the row, "Remove Nora Lectora (nora@empresa.com)", that takes its id out of the value.
-   **A pick and a removal** change the form, so cancel and submit wake up as they would after typing.
-   **Disabled**, the list shows its rows without the picker and without the remove buttons.
-   **Options that change.** A list with no `search` in its picker, or no picker, takes its rows from its own
    `options`, which its picker suggests too; when a rule or a signal changes them, the form drops the ids they no
    longer list, as a select clears a value its options no longer list. A list with a `search` keeps every id, since
    its `options` only name the rows.
-   **The look** is the one of the read-only list: the same bordered box, the rows in its text, so the groups of an
    organization and the members of a group read alike. Past `--bey-form-list-max-height` the rows scroll inside the
    box and the picker stays above them, out of the scroll.

## Checkbox sections

`BeyFormCheckboxSectionsField` lays a long list of checkboxes out in foldable cards, one per section, such as the
permissions of a role grouped by resource. A section is a `BeyFormCheckboxSection`, `{ key, label, icon?, options }`,
and an option a `BeyFormCheckboxSectionOption`, `{ value, label, description?, isDisabled? }`; `label` and
`description` are translation keys or literals, and `icon` an `IconDefinition` shown before the label of the section.

```ts
new BeyFormCheckboxSectionsField({
    isRequired: true,
    key: 'permissions',
    label: 'myApp.roles.form.permissions.label',
    sections: [
        {
            icon: faFileLines,
            key: 'templates',
            label: 'myApp.permissions.templates.label',
            options: [
                {
                    description: 'myApp.permissions.templates.read.description',
                    label: 'myApp.permissions.templates.read.label',
                    value: 'templates.read'
                },
                { label: 'myApp.permissions.templates.edit.label', value: 'templates.edit' }
            ]
        }
    ]
});
```

-   **The value** is one array with every checked value, whatever its section, in the order of the sections and their
    options. A value no option offers is kept, after the others.
-   **The header** of each card is a button that folds and unfolds it, `aria-expanded`, with the icon, the label and a
    counter of the checked options, "3/6", that screen readers read as
    `angular-components.form.checkbox-sections.count` ("3 of 6 checked"). The chevron at its end folds it too.
-   **Select all.** Next to the counter, `select-all` checks every enabled option of the section and turns into
    `clear-all` once they all are, which unchecks them; a disabled option keeps its state. Screen readers name it with
    the section, `select-all-in` and `clear-all-in`. It reads as a link, in `--bey-form-checkbox-sections-link`, and
    takes `--bey-form-checkbox-sections-link-hover` and an underline under the pointer and on keyboard focus.
-   **Folding.** Every section starts folded, also those holding a checked option; the counter tells what each
    holds.
-   **The body** is a grid of checkboxes, as many per row as fit, four at most (`--bey-form-checkbox-sections-columns`),
    none narrower than `--bey-grid-column-min-width`. Each checkbox has its label in bold and, right under it, its
    description in a muted text, which describes the checkbox through `aria-describedby`; an option without one shows
    none. Every option sits at the top of its row, and its description keeps the same small gap under its label
    however tall the other options of the row are.
-   **The order** of the sections and of their options is the order of `sections` and of each `options`: the field
    never sorts them.
-   **Disabled**, the field reads as a list: every checkbox is disabled, no section offers select all, the labels keep
    their colour and the sections still fold.
-   **Required** means at least one option checked, as in a checkbox group. Once touched without one, the group sets
    `aria-invalid` and the cards take the error colour.

The whole field is a `group` named by its label. The texts of the field live under
`angular-components.form.checkbox-sections`, in English and Spanish.

| Variable                                  | Default                 |
| ----------------------------------------- | ----------------------- |
| `--bey-form-checkbox-sections-surface`    | `--bey-bg-page`         |
| `--bey-form-checkbox-sections-border`     | `--bey-border-subtle`   |
| `--bey-form-checkbox-sections-link`       | `--bey-text-link`       |
| `--bey-form-checkbox-sections-link-hover` | `--bey-text-link-hover` |
| `--bey-form-checkbox-sections-columns`    | `4`                     |

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
| `number`, `boolean`, `string[]`, `File` | number, checkbox, checkbox group, checkbox sections, chips, list, file     | `BeyFormFieldCustomValidator` only |

The length, pattern, email and url validators are written for text. On the other values they would do nothing
(a length on a number or a `File`), count something else (a length on the chips counts the chips, which
`maxItems` already covers) or fail every time (an email on a boolean). So the parameters of those seven fields
type `validators` as `BeyFormFieldCustomValidator[]`, and passing any other validator does not compile; a
custom validator receives the whole value: the number, the boolean, the array of chips, of checked values or of ids,
or the `File`. A required checkbox group needs at least one option checked, and a required list one id. On a select,
a radio or an autocomplete, the validators check the `value` of the chosen option, never its label nor the text typed
to filter.

The checks a field brings with it (`min` and `max`, `minDate` and `maxDate`, `maxItems`, `accept` and
`maxSizeBytes`) run together with its validators, and the field is valid only when all of them pass. The info and
notice fields and a list that only shows `items` have no control, so they have nothing to validate.

Every field flags itself once touched while any of them fails: `aria-invalid` on the control and the invalid
border, with no Bootstrap validation icon and the padding the control has while valid. The file field writes a
message for its own `accept` and `maxSizeBytes` checks.

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
