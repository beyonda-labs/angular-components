# Environment

`BEY_ENVIRONMENT_CONFIG` holds the addresses of the backends an app talks to, provided once by `provideBeyApp`, or
by `provideBeyEnvironment(config)` on its own. The page module builds its URLs as `baseUrl` + `webApiPath` +
`baseUrl` of the page, the login module and the session interceptor talk to `accessControlUrl`, and an app injects
the token to build the URL of a route of its own.

## Usage

```ts
private readonly envConfig = inject(BEY_ENVIRONMENT_CONFIG);

downloadPdf(id: string): Observable<DocumentPdf> {
    return this.http.get<DocumentPdf>(`${this.envConfig.baseUrl}${this.envConfig.webApiPath}/documents/${id}/pdf`);
}
```

## BeyEnvironmentConfig

| Field              | Required | Meaning                                                                      |
| ------------------ | -------- | ---------------------------------------------------------------------------- |
| `accessControlUrl` | yes      | Base URL of the authentication routes: login, register, OAuth and `/refresh` |
| `baseUrl`          | yes      | Origin of the API of the app                                                 |
| `webApiPath`       | yes      | Path of the API under `baseUrl`, such as `/api`                              |
| `appName`          | yes      | Name of the app; the library does not read it                                |
| `cookieName`       | yes      | Name of the session cookie; the library does not read it                     |
