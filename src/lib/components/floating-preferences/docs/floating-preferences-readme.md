# Floating preferences

Two selectors, language and theme, that manage themselves. There is no config: the component reads and writes
`TranslateService` and `BeyThemeService` directly, so a parent never has to hold the state.

## Usage

```html
<bey-floating-preferences></bey-floating-preferences>

<bey-floating-preferences [usePill]="false"></bey-floating-preferences>
```

| Input     | Default | Meaning                                                                        |
| --------- | ------- | ------------------------------------------------------------------------------ |
| `usePill` | `true`  | Wrap the selectors in the floating pill. Turn it off to embed them, as the footer does |

## Theme

Picking a theme calls `BeyThemeService.setTheme`, which toggles the `dark` class on `<body>` and remembers the
choice in `localStorage`. Mounting the component on another route picks the saved theme back up, so nothing
else has to remember it.

To react to the theme elsewhere, inject `BeyThemeService` and read `theme$`, or write CSS against
`:host-context(body.dark)`. Which of the two applies is in [tokens.md](../../../../../docs/tokens.md).

## Theming

| Variable                                    | Default                  |
| ------------------------------------------- | ------------------------ |
| `--bey-floating-preferences-fg`             | `--bey-text-secondary`   |
| `--bey-floating-preferences-fg-hover`       | `--bey-text-primary`     |
| `--bey-floating-preferences-fg-muted`       | `--bey-text-muted`       |
| `--bey-floating-preferences-bg-hover`       | `--bey-bg-hover`         |
| `--bey-floating-preferences-border-focus`   | `--bey-border-default`   |
| `--bey-floating-preferences-pill-bg`        | translucent page background |
| `--bey-floating-preferences-pill-border`    | `--bey-border-subtle`    |
