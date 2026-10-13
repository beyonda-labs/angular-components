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

| Field                       | Required | Default | Meaning                                                                  |
| --------------------------- | -------- | ------- | ------------------------------------------------------------------------ |
| `prefix`                    | yes      |         | i18n prefix every text of the form resolves from                         |
| `sections`                  | yes      |         | The sections, in order                                                   |
| `buttons`                   | no       | `[]`    | Buttons under the form                                                   |
| `buttonLayout`              | no       | `end`   | `end` lines them up to the right, `stretch` shares the whole width       |
| `footer`                    | no       |         | A `BeyFormFooter`: a divider and a note with the buttons, see below      |
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
`isTooltipVisible`, `prefix`, which lets two sections share the same texts, and `label`, a title that replaces
`<prefix>.<key>.label`. `BeyFormRow` takes `fields`
and an `alignment` of `start` or `end`. `BeyFormButton` takes `label`, `type`, an optional `action` that
receives the handle, `isHidden`, `tooltip` and `isDanger`, which paints a submit button in the danger colour
(`--bey-danger`, `--bey-danger-fg` and `--bey-danger-hover`) for a form whose submit deletes for good.

## Buttons

| Type        | What the form does with it                                                          |
| ----------- | ----------------------------------------------------------------------------------- |
| `Submit`    | Disabled until the form is valid and changed, then runs `onSubmit`                  |
| `Cancel`    | Disabled until something changed, then resets to `initialValue` and runs `onCancel` |
| `Secondary` | Runs its own `action` with the handle                                               |

A button with an `action` of its own is never disabled by the form, whatever its type.

## Footer

`footer` closes the form above its buttons: a divider line over the row of buttons, and a note at the start of that
row, after an info icon, while the buttons stay at its end. When the row is too narrow for both, the buttons wrap
under the note; with `buttonLayout: 'stretch'` the note takes a line of its own. The note describes the `Submit`
buttons through `aria-describedby`, so it is read with them. Without `footer`, the row holds the buttons alone.

```ts
footer: new BeyFormFooter({ note: 'myApp.account.password.note' });
```

| Field       | Default | Meaning                                                        |
| ----------- | ------- | -------------------------------------------------------------- |
| `isDivided` | `true`  | Draws the divider line over the buttons                        |
| `note`      |         | Translation key of the note, used as given; no note without it |

The footer belongs to the row of buttons: a form without a visible button shows neither, and a stepper shows it on
every step.

## The handle

The config never changes once built. Whatever has to happen to the live form goes through the
`BeyFormHandle` the callbacks receive:

| Member             | Meaning                                                   |
| ------------------ | --------------------------------------------------------- |
| `value()`          | The current value, disabled fields included               |
| `isDirty()`        | Whether anything changed since the last reset             |
| `patchValue(part)` | Writes into the form, section by section                  |
| `reset()`          | Back to `initialValue`                                    |
| `goToStep(key)`    | Opens that step                                           |
| `close()`          | Closes the modal hosting the form; does nothing elsewhere |
| `requestClose()`   | Same, asking first when there are changes                 |

## Rules

A field's `isHidden`, `isDisabled`, `isRequired` and `options`, an autocomplete's `excludedValues`, and a section's
`isHidden`, take a value, a signal or a function of the current form value. The form evaluates them on every change:

```ts
new BeyFormSelectField({ key: 'fileType', isHidden: value => value['main']['type'] !== 'file' }),
    new BeyFormTextField({ key: 'vatNumber', isRequired: value => value['main']['customer'] === 'company' });
```

A hidden field is also disabled, so its validators no longer hold the form back, and its value still comes
back in `value()` and `onSubmit`. A required rule adds and removes the required validator, and the marker next
to the label, as its result changes.

## Data that arrives later

Whatever a field needs that is not there when the config is built, such as a catalogue still loading or the
names already taken, reaches the form through a signal, never through a mutable object or a field written
after construction. A rule may be the signal itself or a function that reads it, and a
`BeyFormFieldCustomValidator` may read it too: the form evaluates the rule, or runs the validator, again as
soon as the signal changes.

```ts
readonly cities = signal<City[]>([]);
readonly takenNames = signal(new Set<string>());

new BeyFormTextField({
    key: 'name',
    validators: [new BeyFormFieldCustomValidator(control => (this.takenNames().has(control.value) ? { taken: true } : null))]
}),
new BeyFormAutocompleteField({
    key: 'city',
    options: value => this.cities().filter(city => city.country === value['trip']['country']).map(toOption)
})
```

A custom validator is also run again whenever the form value changes, so one that reads another field through
`control.parent` stays current when that field changes.

## Options that change

When the options of a select, a radio or an autocomplete change and no longer list the value of the field, the
form clears it, and `value()`, `onValueChange` and `onSubmit` see it cleared. Only a change of the options
drops a value: an initial value is kept while its options are still loading, and cleared only if they arrive
without it. A list that holds ids and has no `search` in its picker, or no picker, drops the ids its options no longer
list in the same way; the options of a list fed by a `search` only name its rows, so it keeps every id it holds.

## Steps

```ts
steps: [
    new BeyFormStep({ key: 'who', sections: ['person'] }),
    new BeyFormStep({ key: 'how', sections: ['contact', 'consent'] })
];
```

Every section keeps its controls from the start; a step only chooses which ones render. The form adds a
back button on every step but the first and a next button on every step but the last, enabled once the
sections of the current step are valid. The config buttons show on the last step only. The labels come from
`angular-components.form.steps.next` and `.back`.

## Texts

With `prefix: 'myApp.contact'`, a section `person` and its field `name`:

| Key                                     | Shown as                          |
| --------------------------------------- | --------------------------------- |
| `myApp.contact.person.label`            | Section title                     |
| `myApp.contact.person.tooltip`          | Section tooltip, when enabled     |
| `myApp.contact.person.name.label`       | Field label                       |
| `myApp.contact.person.name.placeholder` | Field placeholder, unless given   |
| `myApp.contact.person.name.tooltip`     | Field label tooltip, when enabled |

A section with `prefix: 'person'` resolves its texts from `myApp.contact.person.*` whatever its key.

The form builds each key as `<prefix>.<section>.<field>.<text>`. The config `prefix` is used as given; the
section `prefix` (or its `key`) and the field `key` become kebab-case segments, so a field `valueString` in a
section `mainData` reads `myApp.contact.main-data.value-string.label`. A run of capitals is one word
(`pdfURL` is `pdf-url`) and a digit stays with the word before it (`line2Height` is `line2-height`). The key
itself does not change: the control, its `id` and the form value keep `valueString`. Anything the config gives
as a full translation key, such as `placeholder`, `hint`, a button `label`, an option `label` or the footer `note`,
is used as it is.

## Modal form

`BeyModalFormService.open(config)` shows the same form inside a modal. `BeyModalFormConfig` takes everything
`BeyFormConfig` does, `footer` among it, except `buttons`, which it builds itself, plus:

| Field            | Default                   | Meaning                                                                        |
| ---------------- | ------------------------- | ------------------------------------------------------------------------------ |
| `title`          | `<prefix>.title`          | Title of the dialog                                                            |
| `size`           | `BeyModalFormSize.Large`  | Bootstrap modal size                                                           |
| `cancelLabel`    | `<prefix>.buttons.cancel` | Label of the cancel button                                                     |
| `submitLabel`    | `<prefix>.buttons.submit` | Label of the submit button                                                     |
| `isSubmitHidden` | `false`                   | Leaves only the cancel button, for a form that only shows                      |
| `isSubmitDanger` | `false`                   | Paints the submit button as a danger, for a confirmation that deletes for good |

Submit does not close the dialog: call `handle.close()` once the operation succeeds, or open it with
`BeyModalFormService.openWithRequest(config, submit)`, whose submit sends `submit(value)` and closes the dialog once
that request answers, keeping it open when it fails and reporting nothing beyond what the request shows, such as the
error modal of `BeyHttpService`; the config's own `onSubmit` is replaced. A config spread into a new one keeps its
labels, `isSubmitHidden` and `isSubmitDanger`, so it can be copied. A form that only shows, with every field disabled
or an info field, sets `isSubmitHidden` and names its cancel button "Close" through `cancelLabel`.

The dialog is at most `--bey-modal-form-max-height` high, by default the `--bey-dialog-max-height` token: its title
and its buttons stay in place and the sections scroll between them, so a long form never makes the page scroll, and a
short one keeps its own height. Cancel, the cross and `handle.requestClose()` ask for confirmation when there are
changes. The backdrop and Escape do nothing, so the confirmation cannot be skipped. `beyModalFormGuard` on a route
closes pristine dialogs on navigation and asks before leaving a changed one.

## Fields

See [form-fields-readme.md](./form-fields-readme.md).

## Theming

| Variable                                   | Default                                                                                               |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `--bey-form-sections-max-height`           | `none`                                                                                                |
| `--bey-form-field-fg`                      | `--bey-text-primary`                                                                                  |
| `--bey-form-field-placeholder`             | `--bey-text-disabled`                                                                                 |
| `--bey-form-field-control-height`          | `2.125rem`                                                                                            |
| `--bey-form-field-label`                   | `--bey-text-muted`                                                                                    |
| `--bey-form-field-hint`                    | `--bey-text-muted`                                                                                    |
| `--bey-form-field-error`                   | `--bey-danger`                                                                                        |
| `--bey-form-field-required`                | `--bey-text-disabled`                                                                                 |
| `--bey-form-field-required-invalid`        | `--bey-danger`                                                                                        |
| `--bey-form-field-action-fg`               | `--bey-secondary`                                                                                     |
| `--bey-form-field-action-fg-hover`         | `--bey-text-primary`                                                                                  |
| `--bey-form-field-action-bg-hover`         | `--bey-bg-active`                                                                                     |
| `--bey-form-field-action-bg-active`        | `--bey-bg-hover`                                                                                      |
| `--bey-form-textarea-min-height`           | `5.25rem`                                                                                             |
| `--bey-form-autocomplete-panel-max-height` | `13rem`                                                                                               |
| `--bey-form-checkbox-switch-track`         | `--bey-bg-muted`                                                                                      |
| `--bey-form-checkbox-switch-track-on`      | `--bey-primary`                                                                                       |
| `--bey-form-checkbox-switch-border`        | `--bey-secondary`                                                                                     |
| `--bey-form-checkbox-switch-knob`          | `--bey-bg-page`                                                                                       |
| `--bey-form-checkbox-switch-width`         | `2.125rem`                                                                                            |
| `--bey-form-checkbox-switch-height`        | `1.125rem`                                                                                            |
| `--bey-form-chips-chip-bg`                 | `--bey-bg-active`                                                                                     |
| `--bey-form-chips-input-min-width`         | `6rem`                                                                                                |
| `--bey-form-file-button-bg`                | `--bey-bg-active`                                                                                     |
| `--bey-form-file-button-bg-hover`          | `--bey-bg-hover`                                                                                      |
| `--bey-form-file-muted`                    | `--bey-secondary`                                                                                     |
| `--bey-form-file-error`                    | `--bey-danger`                                                                                        |
| `--bey-form-list-border`                   | `--bey-border-default`                                                                                |
| `--bey-form-list-empty`                    | `--bey-text-disabled`                                                                                 |
| `--bey-form-list-fg`                       | `--bey-text-primary`                                                                                  |
| `--bey-form-list-max-height`               | seven and a half rows of `--bey-font-size-md` at `--bey-line-height-base`, and the padding of the box |
| `--bey-form-list-link`                     | `--bey-text-link`                                                                                     |
| `--bey-form-list-link-hover`               | `--bey-text-link-hover`                                                                               |

The panel of an autocomplete floats in `document.body`, so it reads `--bey-form-autocomplete-panel-max-height` from its
field every time it opens: a length set on the field, on an ancestor or on `:root` reaches it.

The variables of the checkbox sections are in [form-fields-readme.md](./form-fields-readme.md#checkbox-sections).
The modal form renders in `document.body`, so its variables are read from `:root` or an ancestor of the dialog, and
one set nowhere takes its default:

| Variable                          | Default               |
| --------------------------------- | --------------------- |
| `--bey-modal-form-fg`             | `--bey-text-primary`  |
| `--bey-modal-form-fg-muted`       | `--bey-text-muted`    |
| `--bey-modal-form-accent`         | `--bey-primary`       |
| `--bey-modal-form-accent-soft`    | `--bey-primary-soft`  |
| `--bey-modal-form-border`         | `--bey-border-subtle` |
| `--bey-modal-form-surface`        | `--bey-bg-surface`    |
| `--bey-modal-form-close-bg-hover` | `--bey-bg-active`     |

The dialog stops at `--bey-modal-form-max-height`, read the same way; set nowhere, at `--bey-dialog-max-height`.
