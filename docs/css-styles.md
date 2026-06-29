# CSS Style Guide

## Class naming

### General principle

Name classes by **responsibility and context**, not by visual appearance. The name should still make sense even if the design changes.

```css
/* ✗ Describes appearance — breaks if the design changes */
.blue-box {
}
.big-text {
}
.rounded-card {
}

/* ✓ Describes responsibility */
.user-card {
}
.section-title {
}
.auth-card {
}
```

---

### Custom class structure

Use the **component + part + modifier** pattern:

```
.{component}                   root component
.{component}__{part}           internal element of the component
.{component}--{modifier}       variant or state of the component or part
```

| Type           | Example                   |
| -------------- | ------------------------- |
| Root component | `.form-section`           |
| Internal part  | `.form-section__title`    |
| Variant        | `.form-section--compact`  |
| State          | `.form-section--readonly` |

**Rules:**

-   The part separator is `__` (double underscore).
-   The modifier separator is `--` (double dash).
-   Modifiers are not nested: `.form-section--readonly__title` is not valid; use `.form-section__title.is-readonly` if you need to modify a part in a specific state.
-   Dynamic states (active, disabled, loading) are expressed with `is-*` or `has-*` helper classes added via Angular binding:

```html
<div class="form-section" [class.is-readonly]="isReadonly">
    <h2 class="form-section__title">...</h2>
</div>
```

```css
.form-section.is-readonly .form-section__title {
    color: var(--bey-color-fg-muted);
}
```

---

### Bootstrap first

Before writing a custom class, check if Bootstrap already provides the needed utility. A new class is only created when Bootstrap does not cover the case or when the style is semantic and specific to the component.

```html
<!-- ✗ unnecessary custom class for something Bootstrap already handles -->
<div class="flex-row gap-small">...</div>

<!-- ✓ direct Bootstrap utility -->
<div class="d-flex gap-2">...</div>
```

```html
<!-- ✓ justified custom class: semantic component style -->
<aside class="bey-login__intro-card">...</aside>
```

---

### Custom class prefix

All library components use the `bey-` prefix in their classes to avoid collisions with Bootstrap or other libraries:

```css
/* ✓ */
.bey-header__logo {
}
.bey-table__row--selected {
}

/* ✗ no prefix — collision risk */
.header__logo {
}
.row--selected {
}
```

---

## CSS Variables

### Mandatory rule

Colors, sizes and design values **must never be used as literal values** in CSS rules. Always use CSS variables.

### Reuse existing variables

Before defining a new variable, check if an equivalent already exists in the component's context or in the global tokens:

```css
/* ✗ Literal value */
.form-section__title {
    color: #3d3d3c;
    font-size: 14px;
}

/* ✗ New variable when an equivalent already exists */
:host {
    --form-title-color: #3d3d3c;
}

/* ✓ Reuse the existing variable from the context */
.form-section__title {
    color: var(--bey-login-fg-2);
    font-size: var(--bey-login-font-size-sm, 14px);
}
```

### Defining new variables

A new variable is only defined when the value is not covered by existing tokens. It is declared in `:host` of the component and overridden in the dark theme block:

```css
:host {
    --bey-form-section-bg: #ffffff;
    --bey-form-section-border: #e7e7e5;
}

:host-context(body.dark) {
    --bey-form-section-bg: #0a0a0a;
    --bey-form-section-border: #232322;
}

.form-section {
    background: var(--bey-form-section-bg);
    border: 1px solid var(--bey-form-section-border);
}
```

### Variable prefix

Project CSS variables use the prefix `--bey-{component}-{property}`:

| Component     | Prefix           |
| ------------- | ---------------- |
| Login         | `--bey-login-*`  |
| Floating pill | `--bey-fp-*`     |
| (new)         | `--bey-{name}-*` |

---

## Dark mode

### How it works

Dark mode is managed by adding the `dark` class to the `<body>` element. When `body` has that class, components and global styles switch their CSS variables to the dark value set.

The class is managed internally by `bey-floating-preferences`: each time the user selects a theme, the component toggles `body.classList` directly. No parent component needs to control this.

```typescript
// floating-preferences.component.ts — internal logic
@Input({ required: true })
set config(value: FloatingPreferencesConfig) {
    this._config = value;
    this.document.body.classList.toggle('dark', value?.theme === 'dark');
}
```

---

### Dark styles in components

Each component defines its own dark values in a `:host-context(body.dark)` block. Light values are the defaults in `:host`.

```css
:host {
    --bey-my-component-bg: #ffffff;
    --bey-my-component-fg: #0a0a0a;
    --bey-my-component-border: #e7e7e5;
}

:host-context(body.dark) {
    --bey-my-component-bg: #0a0a0a;
    --bey-my-component-fg: #f5f5f3;
    --bey-my-component-border: #232322;
}

.my-component {
    background: var(--bey-my-component-bg);
    color: var(--bey-my-component-fg);
    border: 1px solid var(--bey-my-component-border);
}
```

`:host-context(body.dark)` applies when any ancestor of the component matches `body.dark`. Angular handles this correctly with `ViewEncapsulation.Emulated`.

---

### Shared global styles

Values that affect Bootstrap, the datepicker or other global utilities go in `src/lib/assets/styles/overrides.css` inside a `body.dark { }` block, overriding the variables defined in `:root`.

```css
/* overrides.css */
:root {
    --bey-datepicker-surface-color: #ffffff;
    --bey-datepicker-text-color: #0a0a0a;
}

body.dark {
    --bs-dark: #f5f5f3;
    --bey-datepicker-surface-color: #131313;
    --bey-datepicker-text-color: #f5f5f3;
}
```

**Rule:** if the dark style only affects one component → put it in the component CSS with `:host-context(body.dark)`. If it affects global utilities or Bootstrap variables → put it in `overrides.css` under `body.dark`.

---

### Reference palette

**Light:**

| Role                 | Suggested variable  | Value     |
| -------------------- | ------------------- | --------- |
| Primary background   | `--bey-*-bg`        | `#ffffff` |
| Secondary background | `--bey-*-bg-2`      | `#fafaf9` |
| Primary text         | `--bey-*-fg`        | `#0a0a0a` |
| Secondary text       | `--bey-*-fg-2`      | `#3d3d3c` |
| Muted text           | `--bey-*-fg-3`      | `#6b6b69` |
| Very muted text      | `--bey-*-fg-4`      | `#a3a3a1` |
| Primary border       | `--bey-*-line`      | `#e7e7e5` |
| Secondary border     | `--bey-*-line-2`    | `#d8d8d5` |
| Accent               | `--bey-*-accent`    | `#0a0a0a` |
| Accent foreground    | `--bey-*-accent-fg` | `#ffffff` |

**Dark:**

| Role                 | Suggested variable  | Value     |
| -------------------- | ------------------- | --------- |
| Primary background   | `--bey-*-bg`        | `#0a0a0a` |
| Secondary background | `--bey-*-bg-2`      | `#131313` |
| Primary text         | `--bey-*-fg`        | `#f5f5f3` |
| Secondary text       | `--bey-*-fg-2`      | `#c8c8c6` |
| Muted text           | `--bey-*-fg-3`      | `#8f8f8d` |
| Very muted text      | `--bey-*-fg-4`      | `#5a5a58` |
| Primary border       | `--bey-*-line`      | `#232322` |
| Secondary border     | `--bey-*-line-2`    | `#2e2e2c` |
| Accent               | `--bey-*-accent`    | `#f5f5f3` |
| Accent foreground    | `--bey-*-accent-fg` | `#0a0a0a` |

---

## Rules summary

| Rule                              | Correct                            | Incorrect                             |
| --------------------------------- | ---------------------------------- | ------------------------------------- |
| Name by responsibility            | `.auth-card`                       | `.blue-rounded-box`                   |
| Component/part/modifier structure | `.form-section__title--error`      | `.formTitleError`                     |
| Bootstrap before custom class     | `d-flex gap-2`                     | `.flex-row-gap`                       |
| CSS variables, never literals     | `var(--bey-login-fg)`              | `#0a0a0a`                             |
| Reuse existing variables          | `var(--bey-login-bg-2)`            | `--bey-new-bg: #fafaf9`               |
| `bey-` prefix on custom classes   | `.bey-table__cell`                 | `.table__cell`                        |
| Component dark styles             | `:host-context(body.dark) { }`     | `:host([data-theme='dark']) { }`      |
| Global dark styles                | `body.dark { }` in `overrides.css` | Variables in `:root` without override |
| Who toggles `body.dark`           | `bey-floating-preferences`         | The consumer component                |
