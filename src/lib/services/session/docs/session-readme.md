# Session

`BeySessionService` keeps the signed-in user of an app: the access token and the user decoded from it (`email`,
`name`, `surname`, `roles` and `allowedPaths`, whose first entry is the `redirectPath`), in signals and only in
memory. The refresh token never reaches the front: the server keeps it in an httpOnly cookie it sets on sign-in,
registration and OAuth, rotates on every refresh and clears on logout, so a reload opens the session again by
asking the server for a new access token. `beyAuthGuard` lets a route through only to a signed-in user whose
`allowedPaths` include it, `beyLoginGuard` sends a signed-in user away from the login, and `beySessionInterceptor`
adds the `Bearer` token to every request and, on a `401`, refreshes the token through the cookie while the other
requests wait and sends the request again, or clears the session and goes to `loginRoute`. A `401` from
`accessControlUrl/login`, `/register`, `/refresh` or `/logout` reaches the caller as it is. `provideBeyApp`
registers it all.

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
readonly logoutAction = new BeyAppLayoutBottomAction({
    key: 'logout',
    icon: faRightFromBracket,
    action: () => this.session.logout()
});
```

## BeySessionService

| Member                    | Meaning                                                                       |
| ------------------------- | ----------------------------------------------------------------------------- |
| `isAuthenticated`         | Signal, `true` while there is a token                                         |
| `token`, `user`           | Signals of the access token and of the user                                   |
| `setToken(token)`         | Keeps the access token and the user decoded from it                           |
| `setUser(user)`           | Keeps the user as it is                                                       |
| `getToken()`, `getUser()` | The current values, or `null`                                                 |
| `restore()`               | `Observable<boolean>`: asks the server for an access token through the cookie |
| `logout()`                | Signs the user out at the server, clears the session and goes to `loginRoute` |
| `clear()`                 | Forgets the token and the user in this page only; the server keeps the cookie |

## Restoring the session

`restore()` sends `POST accessControlUrl/refresh` with the credentials and no body. A `200` with
`{ accessToken }` keeps the token and emits `true`; anything else emits `false`, without the error modal, since a
visitor without a session is no error. The calls made while the request is out share it, so the guards and the
interceptor never send two at once. Once it failed, or once the session was cleared or closed, it emits `false`
without a request until a session opens again, by a sign-in, a registration, an OAuth callback or `setToken`.

Both guards restore the session when there is no token: `beyAuthGuard` then lets the route through or sends the
user to `loginRoute` or to their `redirectPath`, and `beyLoginGuard` sends a restored user to their
`redirectPath` or opens the login page.

## Logging out

`logout()` sends `POST accessControlUrl/logout` with the credentials and the token, so the server clears its cookie,
and then clears the session and goes to `loginRoute`, also when the request fails. `clear()` alone leaves the cookie
on the server, and the next page load would open the session again: an app signs the user out with `logout()`.

## Requests

The session talks to `HttpClient` directly rather than through `BeyHttpService`: it sits under the interceptor every
request goes through, and the HTTP service pulls ngx-translate, which may send a request of its own while it is
being created. Neither request shows an error.

Every session request is sent with the credentials, so the cookie travels also when the api lives on another origin;
the server then has to allow that origin with credentials. On the same origin the browser sends it anyway.

## Upgrading from the tokens in storage

Older versions kept the tokens and the user in `localStorage`. The service removes those keys (`bey_token`,
`bey_refresh_token` and `bey_user`) when it is created, so no token is left behind; an app that had configured its
own keys removes them itself.

## BeySessionConfig

| Field        | Default    | Meaning                                                    |
| ------------ | ---------- | ---------------------------------------------------------- |
| `loginRoute` | `'/login'` | Where the guard and the interceptor send a signed-out user |
