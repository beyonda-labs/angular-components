# Badge

A small pill of text with a variant that sets its colour. The header, the table's badge cells and the
properties-menu cards render theirs through it, so a status looks the same wherever it appears.

## Usage

```ts
readonly status = new BeyBadgeConfig({ label: 'myApp.status.active', variant: BeyBadgeVariant.Success });
```

```html
<bey-badge [config]="status" />
```

## BeyBadgeConfig

| Field          | Required | Default   | Meaning                                                      |
| -------------- | -------- | --------- | ------------------------------------------------------------ |
| `label`        | yes      |           | The text, a translation key unless `isTranslated` is `false` |
| `variant`      | no       | `Neutral` | One of `BeyBadgeVariant`                                     |
| `isTranslated` | no       | `true`    | Run the label through the translate pipe                     |

## Variants

| Variant                                             | Look                                                        |
| --------------------------------------------------- | ----------------------------------------------------------- |
| `Neutral`                                           | Light grey with a border, the default for a plain tag       |
| `Outline`                                           | No fill, text-coloured border                               |
| `Strong`                                            | Inverse fill, for the one badge that must stand out         |
| `Primary`                                           | Solid primary fill, for the main or active state            |
| `Secondary`, `Success`, `Warning`, `Danger`, `Info` | A light tint of the semantic colour, legible in both themes |
| `Purple`, `Teal`, `Pink`                            | The same tint on the extra palette hues                     |

## Tokens

| Token                | Default                      |
| -------------------- | ---------------------------- |
| `--bey-badge-bg`     | Set by the variant           |
| `--bey-badge-fg`     | Set by the variant           |
| `--bey-badge-border` | `transparent` or the variant |
| `--bey-badge-tint`   | `15%` of the hue in the fill |
| `--bey-badge-shade`  | `55%` of the hue in the text |
