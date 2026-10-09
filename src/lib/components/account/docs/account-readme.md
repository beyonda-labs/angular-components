# Account

The page where the signed-in user looks after their own account, meant as the content of an app page inside
`bey-app-layout`. It reads the account from `GET {baseUrl}` and shows two sections. The profile shows the email, which
cannot change, and the name and surname, saved with `PUT {baseUrl}` `{ name, surname }`; the page confirms it with
`<prefix>.toast.profile-success` and puts the new names on the session user, so whatever shows them follows. The
password asks for the current one, the new one and its confirmation, which must match before it can be sent, and
sends them with `PUT {baseUrl}/password` `{ currentPassword, password, password2 }`; the answer is a new session, which
the page opens with `BeySessionService.setToken`, confirms with `<prefix>.toast.password-success` and empties the form.
An account without a password, one that only signs in through another provider, is told instead how to set one: with
"Forgot your password?" on the sign-in page. The requests follow the account module of express-components; a wrong
current password answers `account.wrong-password` and an account without a password `account.no-password`, whose texts
the module ships under `angular-components.http`.

## Usage

```ts
readonly layoutConfig = this.appShellService.buildConfig();
readonly accountConfig = new BeyAccountConfig();
```

```html
<bey-app-layout [config]="layoutConfig">
    <bey-account [config]="accountConfig"></bey-account>
</bey-app-layout>
```

```ts
{ path: 'account', component: AccountPageComponent, canActivate: [beyAuthGuard] }
```

The route must be in the `allowedPaths` of every user who may open it, which the server decides.

## BeyAccountConfig

| Field     | Default                        | Meaning                                                                         |
| --------- | ------------------------------ | ------------------------------------------------------------------------------- |
| `baseUrl` | `'/account'`                   | Path of the account, resolved against the environment's `baseUrl` and `webApiPath` |
| `prefix`  | `'angular-components.account'` | i18n prefix every text of the page resolves from                                |

`baseUrl` follows the `path` of the account module of express-components. The language and the theme of the account
are saved by the [preferences](../../../services/preferences/docs/preferences-readme.md), not by this page.

## Texts

| Key                                                                 | Shown as                                     |
| ------------------------------------------------------------------- | -------------------------------------------- |
| `<prefix>.title`                                                    | Page title                                   |
| `<prefix>.profile.title`, `<prefix>.password.title`                 | Section titles                               |
| `<prefix>.profile.<field>.label` / `.placeholder`                   | `email`, `name`, `surname`                   |
| `<prefix>.profile.save`, `<prefix>.profile.cancel`                  | Profile buttons                              |
| `<prefix>.password.<field>.label` / `.placeholder`                  | `current-password`, `password`, `password2`  |
| `<prefix>.password.password2.mismatch`                              | Under the confirmation while it differs      |
| `<prefix>.password.save`, `<prefix>.password.no-password`           | Password button, and the text without one    |
| `<prefix>.toast.profile-success`, `<prefix>.toast.password-success` | Success toasts                               |
