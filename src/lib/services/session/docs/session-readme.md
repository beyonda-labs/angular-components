# Session

`BeySessionService` keeps the signed-in user of an app: the access token, the refresh token and the user decoded
from the token (`email`, `name`, `surname`, `roles` and `allowedPaths`, whose first entry is the `redirectPath`), in
signals backed by `BeyStorageService`, so a reload keeps the session. `beyAuthGuard` lets a route through only to a
signed-in user whose `allowedPaths` include it, `beyLoginGuard` sends a signed-in user away from the login, and
`beySessionInterceptor` adds the `Bearer` token to every request and, on a `401`, refreshes the tokens once at
`accessControlUrl/refresh` while the other requests wait, or clears the session and goes to `loginRoute`.
`provideBeyApp` registers it all.

## Usage

```ts
export const routes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [beyLoginGuard] },
    { path: 'documents', component: DocumentsComponent, canActivate: [beyAuthGuard] }
];
```

```ts
private readonly session = inject(BeySessionService);

readonly userName = computed(() => this.session.user()?.name ?? '');

logout(): void {
    this.session.clear();
    this.router.navigate(['/login']);
}
```

## BeySessionService

| Member                                         | Meaning                                              |
| ---------------------------------------------- | ---------------------------------------------------- |
| `isAuthenticated`                              | Signal, `true` while there is a token                |
| `token`, `user`                                | Signals of the access token and of the user          |
| `setToken(token)`                              | Stores the access token and the user decoded from it |
| `setRefreshToken(token)`                       | Stores the refresh token                             |
| `setUser(user)`                                | Stores the user as it is                             |
| `getToken()`, `getUser()`, `getRefreshToken()` | The stored values, or `null`                         |
| `clear()`                                      | Signs the user out: removes the tokens and the user  |

## BeySessionConfig

| Field             | Default               | Meaning                                                    |
| ----------------- | --------------------- | ---------------------------------------------------------- |
| `loginRoute`      | `'/login'`            | Where the guard and the interceptor send a signed-out user |
| `tokenKey`        | `'bey_token'`         | Storage key of the access token                            |
| `refreshTokenKey` | `'bey_refresh_token'` | Storage key of the refresh token                           |
| `userKey`         | `'bey_user'`          | Storage key of the user                                    |
