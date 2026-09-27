# Form

A form built from a config: sections of rows of fields, the buttons under them and the callbacks the
consumer cares about. `bey-form` owns the controls; the consumer talks to them through a handle.

## Usage

```ts
readonly form = new BeyFormConfig<ContactValue>({
    prefix: 'myApp.contact',
    sections: [
        new BeyFormSection({
            key: 'person',
            rows: [
                new BeyFormRow({
                    fields: [
                        new BeyFormTextField({ key: 'name', columns: 6, isRequired: true }),
                        new BeyFormTextField({ key: 'email', columns: 6, validators: [new BeyFormFieldEmailValidator()] })
                    ]
                })
            ]
        })
    ],
    buttons: [
        new BeyFormButton({ label: 'myApp.contact.cancel', type: BeyFormButtonType.Cancel }),
        new BeyFormButton({ label: 'myApp.contact.save', type: BeyFormButtonType.Submit })
    ],
    initialValue: { person: { name: 'Ada', email: '' } },
    onSubmit: (value, handle) => this.save(value).subscribe(() => handle.reset())
});
```

```html
<bey-form [config]="form" />
```

## BeyFormConfig

| Field                       | Required | Default | Meaning                                                                 |
| --------------------------- | -------- | ------- | ----------------------------------------------------------------------- |
| `prefix`                    | yes      |         | i18n prefix every text of the form resolves from                         |
| `sections`                  | yes      |         | The sections, in order                                                   |
| `buttons`                   | no       | `[]`    | Buttons under the form                                                   |
| `buttonLayout`              | no       | `end`   | `end` lines them up to the right, `stretch` stacks them full width       |
| `initialValue`              | no       |         | Value the form starts from and cancel goes back to                       |
| `allowSubmitWithoutChanges` | no       | `false` | Lets a valid but untouched form be submitted                             |
| `steps`                     | no       | `[]`    | Turns the form into a stepper, see below                                 |
| `onReady`                   | no       |         | Run with the handle once the controls exist                              |
| `onValueChange`             | no       |         | Run with the whole value and the handle after every change               |
| `onSubmit`                  | no       |         | Run with the value and the handle when submit is pressed on a valid form |
| `onCancel`                  | no       |         | Run after cancel has reset the form                                      |
| `onStepChange`              | no       |         | Run with the key of the step that just opened                            |

The value is one object per section, keyed by the section key, with one entry per field:
`{ person: { name: 'Ada', email: '' } }`.

`BeyFormSection` takes `key`, `rows`, and optionally `isHidden` (a rule, see below), `isTitleVisible`,
`isTooltipVisible` and `prefix`, which lets two sections share the same texts. `BeyFormRow` takes `fields`
and an `alignment` of `start` or `end`. `BeyFormButton` takes `label`, `type`, an optional `action` that
receives the handle, `isHidden` and `tooltip`.

## Buttons

| Type        | What the form does with it                                                              |
| ----------- | --------------------------------------------------------------------------------------- |
| `Submit`    | Disabled until the form is valid and changed, then runs `onSubmit`                      |
| `Cancel`    | Disabled until something changed, then resets to `initialValue` and runs `onCancel`     |
| `Secondary` | Runs its own `action` with the handle                                                   |

A button with an `action` of its own is never disabled by the form, whatever its type.

## The handle

The config never changes once built. Whatever has to happen to the live form goes through the
`BeyFormHandle` the callbacks receive:

| Member             | Meaning                                                            |
| ------------------ | ------------------------------------------------------------------ |
| `value()`          | The current value, disabled fields included                         |
| `isDirty()`        | Whether anything changed since the last reset                       |
| `patchValue(part)` | Writes into the form, section by section                            |
| `reset()`          | Back to `initialValue`                                              |
| `goToStep(key)`    | Opens that step                                                     |
| `close()`          | Closes the modal hosting the form; does nothing elsewhere           |
| `requestClose()`   | Same, asking first when there are changes                           |

## Rules

A field's `isHidden`, `isDisabled` and `options`, and a section's `isHidden`, take either a value or a
function of the current form value. The form evaluates them on every change:

```ts
new BeyFormSelectField({ key: 'fileType', isHidden: value => value['main']['type'] !== 'file' })
```

A hidden field is also disabled, so its validators no longer hold the form back, and its value still comes
back in `value()` and `onSubmit`. A rule may read a signal of its own: the form re-evaluates it when that
signal changes too.

## Steps

```ts
steps: [
    new BeyFormStep({ key: 'who', sections: ['person'] }),
    new BeyFormStep({ key: 'how', sections: ['contact', 'consent'] })
]
```

Every section keeps its controls from the start; a step only chooses which ones render. The form adds a
back button on every step but the first and a next button on every step but the last, enabled once the
sections of the current step are valid. The config buttons show on the last step only. The labels come from
`angular-components.form.steps.next` and `.back`.

## Texts

With `prefix: 'myApp.contact'`, a section `person` and its field `name`:

| Key                                    | Shown as                            |
| -------------------------------------- | ----------------------------------- |
| `myApp.contact.person.label`           | Section title                       |
| `myApp.contact.person.tooltip`         | Section tooltip, when enabled       |
| `myApp.contact.person.name.label`      | Field label                         |
| `myApp.contact.person.name.placeholder`| Field placeholder, unless given     |
| `myApp.contact.person.name.tooltip`    | Field label tooltip, when enabled   |

A section with `prefix: 'person'` resolves its texts from `myApp.contact.person.*` whatever its key.

The form builds each key as `<prefix>.<section>.<field>.<text>`. The config `prefix` is used as given; the
section `prefix` (or its `key`) and the field `key` become kebab-case segments, so a field `valueString` in a
section `mainData` reads `myApp.contact.main-data.value-string.label`. A run of capitals is one word
(`pdfURL` is `pdf-url`) and a digit stays with the word before it (`line2Height` is `line2-height`). The key
itself does not change: the control, its `id` and the form value keep `valueString`. Anything the config gives
as a full translation key, such as `placeholder`, a button `label` or an option `label`, is used as it is.

## Modal form

`BeyModalFormService.open(config)` shows the same form inside a modal. `BeyModalFormConfig` takes everything
`BeyFormConfig` does except `buttons`, which it builds itself, plus:

| Field         | Default                    | Meaning                          |
| ------------- | -------------------------- | -------------------------------- |
| `title`       | `<prefix>.title`           | Title of the dialog              |
| `size`        | `BeyModalFormSize.Large`   | Bootstrap modal size             |
| `cancelLabel` | `<prefix>.buttons.cancel`  | Label of the cancel button       |
| `submitLabel` | `<prefix>.buttons.submit`  | Label of the submit button       |

Submit does not close the dialog: call `handle.close()` once the operation succeeds. Cancel, the cross and
`handle.requestClose()` ask for confirmation when there are changes. The backdrop and Escape do nothing, so
the confirmation cannot be skipped. `beyModalFormGuard` on a route closes pristine dialogs on navigation and
asks before leaving a changed one.

## Fields

See [form-fields-readme.md](./form-fields-readme.md).

## Customisation

| Variable                          | Default                |
| --------------------------------- | ---------------------- |
| `--bey-form-sections-max-height`  | `none`                 |
| `--bey-form-field-fg`             | `--bey-text-primary`   |
| `--bey-form-field-placeholder`    | `--bey-text-disabled`  |
| `--bey-form-field-control-height` | `2.125rem`             |
| `--bey-form-field-label`          | `--bey-text-muted`     |
| `--bey-modal-form-body-max-height`| `min(70vh, 34rem)`     |
