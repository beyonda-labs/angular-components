# Design tokens

The catalogue of design values of the library. Every CSS rule reads from here; nothing else holds a literal.
How the layers work and when a module may declare its own variable is in `rules/angular/styles.md`.
They live in `src/lib/assets/styles/tokens.css`.

All tokens are declared on `:root` and re-declared under `body.dark`. A token that does not appear in the dark
column keeps its light value.

---

## Colour

### Primitives

Raw values. A component never reads a primitive; it reads a semantic token.

| Token            | Light     | Dark      |
| ---------------- | --------- | --------- |
| `--bey-white`    | `#ffffff` | —         |
| `--bey-black`    | `#000000` | —         |
| `--bey-gray-50`  | `#f5f5f5` | —         |
| `--bey-gray-100` | `#f0f0f0` | —         |
| `--bey-gray-200` | `#e9ecef` | —         |
| `--bey-gray-300` | `#ced4da` | —         |
| `--bey-gray-400` | `#adb5bd` | —         |
| `--bey-gray-500` | `#80868b` | —         |
| `--bey-gray-600` | `#575757` | —         |
| `--bey-gray-700` | `#454749` | —         |
| `--bey-gray-800` | `#2c2d2e` | —         |
| `--bey-gray-900` | `#252525` | —         |
| `--bey-red`      | `#b31914` | `#c96b68` |
| `--bey-orange`   | `#ffa624` | `#d49a2e` |
| `--bey-teal`     | `#20c997` | `#2db896` |
| `--bey-blue`     | `#3b5b8c` | `#6f93c9` |
| `--bey-purple`   | `#7c5cbf` | `#a58ddb` |
| `--bey-pink`     | `#c9536f` | `#d98aa0` |

`--bey-white-rgb`, `--bey-black-rgb`, `--bey-red-rgb`, `--bey-orange-rgb` and `--bey-teal-rgb` carry the same
colours as bare channels, for the rules that need `rgba()`.

### Surfaces

| Token              | Light            | Dark             | Used for                         |
| ------------------ | ---------------- | ---------------- | -------------------------------- |
| `--bey-bg-page`    | `--bey-white`    | `--bey-black`    | The page behind everything       |
| `--bey-bg-surface` | `--bey-gray-50`  | `--bey-gray-900` | Cards, menus, floating panels    |
| `--bey-bg-muted`   | `--bey-gray-100` | `--bey-gray-700` | Secondary areas                  |
| `--bey-bg-subtle`  | `--bey-gray-50`  | `--bey-gray-800` | Barely separated from the page   |
| `--bey-bg-hover`   | `--bey-gray-100` | `--bey-gray-700` | Hover on any interactive surface |
| `--bey-bg-active`  | `--bey-gray-200` | `--bey-gray-600` | Selected or pressed              |
| `--bey-bg-inverse` | `--bey-gray-900` | `--bey-white`    | Inverted areas                   |

### Text

| Token                  | Light            | Dark             | Used for                     |
| ---------------------- | ---------------- | ---------------- | ---------------------------- |
| `--bey-text-primary`   | `--bey-gray-900` | `--bey-gray-50`  | Body copy and headings       |
| `--bey-text-secondary` | `--bey-gray-700` | `--bey-gray-400` | Supporting copy              |
| `--bey-text-muted`     | `--bey-gray-500` | `--bey-gray-500` | Labels, placeholders, hints  |
| `--bey-text-disabled`  | `--bey-gray-400` | `--bey-gray-600` | Disabled controls            |
| `--bey-text-inverse`   | `--bey-white`    | `--bey-gray-900` | Text over an inverse surface |

### Borders

| Token                  | Light            | Dark             | Used for                    |
| ---------------------- | ---------------- | ---------------- | --------------------------- |
| `--bey-border-subtle`  | `--bey-gray-200` | `--bey-gray-800` | Dividers inside a surface   |
| `--bey-border-default` | `--bey-gray-300` | `--bey-gray-700` | Outline of inputs and cards |
| `--bey-border-strong`  | `--bey-gray-400` | `--bey-gray-600` | Emphasis, focus rings       |

### Intent

| Token              | Light            | Dark          |
| ------------------ | ---------------- | ------------- |
| `--bey-primary`    | `--bey-black`    | `--bey-white` |
| `--bey-primary-fg` | `--bey-white`    | `--bey-black` |
| `--bey-secondary`  | `#949b98`        | `#7a8380`     |
| `--bey-success`    | `--bey-teal`     | —             |
| `--bey-danger`     | `--bey-red`      | —             |
| `--bey-warning`    | `--bey-orange`   | —             |

---

## Spacing

One 2px-based scale, in t-shirt sizes so it never reads like a Bootstrap utility number: `--bey-space-lg` is
not `p-4`.

| Token             | Value      | px  |
| ----------------- | ---------- | --- |
| `--bey-space-3xs` | `0.125rem` | 2   |
| `--bey-space-2xs` | `0.25rem`  | 4   |
| `--bey-space-xs`  | `0.375rem` | 6   |
| `--bey-space-sm`  | `0.5rem`   | 8   |
| `--bey-space-md`  | `0.75rem`  | 12  |
| `--bey-space-lg`  | `1rem`     | 16  |
| `--bey-space-xl`  | `1.5rem`   | 24  |
| `--bey-space-2xl` | `2rem`     | 32  |

## Radius

| Token                 | Value      | Used for                    |
| --------------------- | ---------- | --------------------------- |
| `--bey-radius-xs`     | `0.25rem`  | Focus outlines, tiny chips  |
| `--bey-radius-sm`     | `0.375rem` | Inputs, buttons             |
| `--bey-radius-md`     | `0.5rem`   | Cards, panels               |
| `--bey-radius-lg`     | `0.75rem`  | Dialogs                     |
| `--bey-radius-xl`     | `1rem`     | Large containers            |
| `--bey-radius-pill`   | `999px`    | Badges, pills               |
| `--bey-radius-circle` | `50%`      | Avatars, round icon buttons |

## Typography

| Token                 | Value       | px  | Used for           |
| --------------------- | ----------- | --- | ------------------ |
| `--bey-font-size-2xs` | `0.6875rem` | 11  | Captions, counters |
| `--bey-font-size-xs`  | `0.75rem`   | 12  | Hints, metadata    |
| `--bey-font-size-sm`  | `0.8125rem` | 13  | Dense UI text      |
| `--bey-font-size-md`  | `0.875rem`  | 14  | Default UI text    |
| `--bey-font-size-lg`  | `1rem`      | 16  | Emphasised text    |
| `--bey-font-size-xl`  | `1.125rem`  | 18  | Section titles     |
| `--bey-font-size-2xl` | `1.25rem`   | 20  | Page titles        |
| `--bey-font-size-3xl` | `1.75rem`   | 28  | Hero titles        |
| `--bey-font-size-4xl` | `2.25rem`   | 36  | Display text       |

| Token                        | Value |
| ---------------------------- | ----- |
| `--bey-font-weight-regular`  | `400` |
| `--bey-font-weight-medium`   | `500` |
| `--bey-font-weight-semibold` | `600` |
| `--bey-font-weight-bold`     | `700` |

| Token                     | Value  | Used for             |
| ------------------------- | ------ | -------------------- |
| `--bey-line-height-none`  | `1`    | Icons, single glyphs |
| `--bey-line-height-tight` | `1.2`  | Headings             |
| `--bey-line-height-base`  | `1.35` | UI text              |
| `--bey-line-height-loose` | `1.6`  | Paragraphs           |

## Borders, elevation and motion

| Token                      | Light                                           | Dark                  |
| -------------------------- | ----------------------------------------------- | --------------------- |
| `--bey-border-width`       | `1px`                                           | —                     |
| `--bey-border-width-thick` | `2px`                                           | —                     |
| `--bey-shadow-rgb`         | `var(--bey-black-rgb)`                          | —                     |
| `--bey-shadow-sm`          | `0 1px 2px rgba(var(--bey-shadow-rgb), 0.25)`   | —                     |
| `--bey-shadow-md`          | `0 16px 48px rgba(var(--bey-shadow-rgb), 0.14)` | same geometry, `0.4`  |
| `--bey-shadow-lg`          | `0 24px 64px rgba(var(--bey-shadow-rgb), 0.16)` | same geometry, `0.5`  |
| `--bey-duration-fast`      | `150ms`                                         | —                     |
| `--bey-duration-base`      | `200ms`                                         | —                     |
| `--bey-duration-slow`      | `300ms`                                         | —                     |
| `--bey-easing-standard`    | `ease`                                          | —                     |
| `--bey-opacity-disabled`   | `0.5`                                           | —                     |
| `--bey-opacity-muted`      | `0.9`                                           | —                     |

## Stacking

Aligned with the Bootstrap scale, so a library panel never lands between two of its layers.

| Token              | Value  | Used for                       |
| ------------------ | ------ | ------------------------------ |
| `--bey-z-base`     | `1`    | Inside the normal flow         |
| `--bey-z-raised`   | `10`   | Anchored elements, chevrons    |
| `--bey-z-sticky`   | `20`   | Sticky headers and toolbars    |
| `--bey-z-dropdown` | `1000` | Menus and pickers              |
| `--bey-z-modal`    | `1050` | Dialogs and their backdrop     |
| `--bey-z-tooltip`  | `1080` | Tooltips, on top of everything |

---

## Theming the library

A consuming app applies its own theme by re-declaring semantic tokens after importing the library styles.
Primitives are the fallback, not the interface: overriding `--bey-gray-500` changes whatever happens to use it
today, while overriding `--bey-text-muted` says what is meant.

```css
@import '@beyonda-labs/angular-components/assets/styles/index.css';

:root {
    --bey-primary: #1f4fd8;
    --bey-primary-fg: #ffffff;
    --bey-radius-sm: 0.25rem;
    --bey-font-size-md: 0.9375rem;
}

body.dark {
    --bey-primary: #7ea2ff;
    --bey-primary-fg: #0a0a0a;
}
```

The `dark` class on `body` is toggled by `bey-floating-preferences`; no consumer component manages it.

A module that exposes extra customisation points declares them in its own `:host` as `--bey-<module>-*`, always
reading from a token here. Those are listed in the module README, not in this file.

## Where the scales come from

Snapped from what the codebase already used, not invented: 36 distinct font sizes collapse into 7 steps, 20
radii into 7, and roughly 20 spacing values into 8. The colour values are those of the existing palette; what
disappears is the duplicate grey scale (`--bey-color-dark-*`, `--bey-color-neutral-*`) and the unprefixed
`--text-*` tokens, which could collide with a consuming app.
