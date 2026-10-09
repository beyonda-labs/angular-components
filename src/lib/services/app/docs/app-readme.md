# App

`provideBeyApp(config)` registers in one call what every app of the library needs: `HttpClient` with the session
interceptor first and the app's own after it, the environment, `BeyHttpService`, the modals, the session, the toasts,
ngx-translate, which loads `<translationsPath><lang>.json`, and the preferences, which start the app in its language as
soon as it starts.

## Usage

```ts
export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideBeyApp({
            environment: {
                accessControlUrl: environment.accessControlUrl,
                appName: environment.appName,
                baseUrl: environment.baseUrl,
                cookieName: environment.cookieName,
                webApiPath: environment.webApiPath
            },
            preferences: { defaultLanguage: 'en', languages: ['en', 'es'] },
            session: { loginRoute: '/login' }
        })
    ]
};
```

## BeyAppConfig

| Field              | Required | Default            | Meaning                                                                                              |
| ------------------ | -------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| `environment`      | yes      |                    | A `BeyEnvironmentConfig`, see the [environment README](../../environment/docs/environment-readme.md) |
| `interceptors`     | no       | `[]`               | The app's own `HttpInterceptorFn`s, run after the session interceptor                                |
| `preferences`      | no       | the defaults       | A `BeyPreferencesConfig`, see the [preferences README](../../preferences/docs/preferences-readme.md) |
| `session`          | no       | the defaults       | A `BeySessionConfig`, see the [session README](../../session/docs/session-readme.md)                 |
| `translationsPath` | no       | `'./assets/i18n/'` | Folder the translation files are read from                                                           |

A spec registers `provideBeyTesting(config?)` from the testing entry point instead, its counterpart without a
server: see the [testing README](../../../../../testing/docs/testing-readme.md).
