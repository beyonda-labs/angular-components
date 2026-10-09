# Preferences

`BeyPreferencesService` keeps the language and the theme of an app, signed in or not. The browser remembers both:
the language in `localStorage` under `bey-language`, the theme under `bey-theme` through `BeyThemeService`. When the app
starts it uses the language the user chose last, or else the language of the browser when the app offers it, or else
the default one, which is also the fallback of every missing text. A session that opens, and every new token after it,
applies and remembers the `language` and the `theme` the user saved on the server, when the token carries them and the
app offers them. What a signed-in user picks is also saved to their account with `PUT {webApi}{accountUrl}`, sending only
what changed (`{ language }` or `{ theme }`), and kept on the session user; a failed save is not shown to the user, who
keeps what they picked. `bey-floating-preferences`, and the footer and the login that embed it, change both through
the service. `provideBeyApp` registers it and starts it, so an app sets no language of its own.

## Usage

```ts
export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideBeyApp({
            environment,
            preferences: { defaultLanguage: 'en', languages: ['en', 'es'] }
        })
    ]
};
```

```ts
private readonly preferences = inject(BeyPreferencesService);

useSpanish(): void {
    this.preferences.setLanguage('es');
}
```

## BeyPreferencesConfig

Given as `preferences` of `provideBeyApp`, or to `provideBeyPreferences(config)` in an app that registers the services
one by one.

| Field             | Default          | Meaning                                                                                           |
| ----------------- | ---------------- | ------------------------------------------------------------------------------------------------- |
| `languages`       | `['en', 'es']`   | The languages the app offers, in the order the selector lists them; the app ships a file for each |
| `defaultLanguage` | `'en'`           | The language used when neither the user nor the browser speaks one of them, and the fallback      |
| `accountUrl`      | `'/account'`     | Path of the account of the signed-in user, resolved against `baseUrl` and `webApiPath`           |

`accountUrl` follows the `path` of the account module of express-components, `/account` by default.

## BeyPreferencesService

| Member                  | Meaning                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| `languages`             | The languages of the app as `BeyPreferencesLanguage`, `{ code, name }`, each named in itself |
| `setLanguage(language)` | Uses and remembers a language the app offers, and saves it for a signed-in user              |
| `setTheme(theme)`       | Applies and remembers a theme, and saves it for a signed-in user                             |
| `start()`               | Sets the default language and uses the first one of the start-up order                       |

A language the app does not offer is ignored, whether the user, the browser or the token names it, and so is a saved
theme other than `light` or `dark`. Applying what the token carries never sends a request.
