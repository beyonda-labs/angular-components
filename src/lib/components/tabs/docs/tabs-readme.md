# Tabs

A horizontal tab bar driven by a config model. It owns which tab is active and reports every change through
`onTabChange`; the consumer renders the content for that key. Tabs that do not fit collapse into an overflow
menu rather than being clipped.

## Usage

```ts
const tabs = new BeyTabsConfig({
    prefix: 'myPage',
    tabs: [new BeyTab({ key: 'overview' }), new BeyTab({ key: 'details', icon: faList })],
    onTabChange: key => this.show(key)
});
```

```html
<bey-tabs [config]="tabs"></bey-tabs>
```

## BeyTabsConfig

| Field         | Required | Default             | Meaning                                                       |
| ------------- | -------- | ------------------- | ------------------------------------------------------------- |
| `prefix`      | yes      |                     | i18n prefix used to resolve labels a tab does not carry       |
| `tabs`        | yes      |                     | The tabs, in display order                                    |
| `activeTab`   | no       | the first tab's key | Which tab starts selected                                     |
| `variant`     | no       | `Underline`         | `Underline` or `Segmented`                                    |
| `onTabChange` | no       |                     | Called with the new key whenever the selection actually moves |

## BeyTab

| Field             | Required | Default       | Meaning                                               |
| ----------------- | -------- | ------------- | ----------------------------------------------------- |
| `key`             | yes      |               | Identifies the tab and is what `onTabChange` reports  |
| `label`           | no       | `<key>.label` | A literal label, or a key resolved against `prefix`   |
| `labelParameters` | no       | none          | Interpolation parameters of the label key             |
| `tooltip`         | no       | none          | A literal tooltip, or a key resolved against `prefix` |
| `icon`            | no       | none          | FontAwesome icon shown before the label               |
| `isDisabled`      | no       | `false`       | Cannot be selected, by click or keyboard              |

A default label uses the key as a kebab-case segment: `billingDetails` reads
`<prefix>.tabs.billing-details.label`, and so does a `tooltip` left as `<key>.tooltip`. `onTabChange` still
reports `billingDetails`.

`labelParameters` go to the translate pipe with the label key, in the bar and in the overflow menu alike. With
`"step": "Step {{number}}"`, a tab with `label: 'myPage.step'` and `labelParameters: { number: 2 }` reads
"Step 2" and follows a language change on its own.

## Replacing the config

The config is read as the initial state, never written to. To move the selection from outside the component,
build a new `BeyTabsConfig` with the `activeTab` you want and bind that; the component follows the new
instance. Mutating the one you passed in has no effect.

## Keyboard

`ArrowLeft` and `ArrowRight` walk the enabled tabs and wrap around; `Home` and `End` jump to the first and
last. Disabled tabs are skipped.

## Overflow

Tab widths are measured only while every tab is still rendered, then cached, so the measurement is never taken
from an already-collapsed bar. A container width of zero means layout has not happened yet — during first
paint, or while hidden — and everything stays visible rather than being guessed into the menu. The active tab
is never pushed into the overflow menu without remaining visible. When a rendered tab changes width after it was
measured — translations that arrive after the first paint, a language switch, a web font — the cache is dropped
and every tab is measured again. A replaced config drops it too, so new `labelParameters` are measured like a new
label.

## Theming

| Variable                      | Default              |
| ----------------------------- | -------------------- |
| `--bey-tabs-accent`           | `--bey-primary`      |
| `--bey-tabs-text`             | `--bey-text-muted`   |
| `--bey-tabs-border`           | `--bey-bg-active`    |
| `--bey-tabs-hover`            | `--bey-text-primary` |
| `--bey-tabs-active-underline` | `--bey-tabs-accent`  |
