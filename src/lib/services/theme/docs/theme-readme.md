# Theme

`BeyThemeService` switches an app between the light and the dark theme: the dark one toggles the `dark` class on
`<body>`, which the design tokens follow, and the choice is kept in `localStorage` under `bey-theme`, so the next
visit starts with it; without a stored choice, or without storage, the theme is light. The floating preferences
offer the switch to the user.

## Usage

```ts
private readonly theme = inject(BeyThemeService);

toggleTheme(): void {
    this.theme.setTheme(this.theme.currentTheme === 'dark' ? 'light' : 'dark');
}
```

## BeyThemeService

| Member            | Meaning                                                            |
| ----------------- | ------------------------------------------------------------------ |
| `theme$`          | Observable of the theme in use, `'light'` or `'dark'` (`BeyTheme`) |
| `currentTheme`    | The theme in use                                                   |
| `setTheme(theme)` | Applies a theme and stores it                                      |
