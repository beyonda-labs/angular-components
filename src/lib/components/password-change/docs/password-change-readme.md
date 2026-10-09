# Password change

The password of the signed-in user, one of the blocks an app composes into its own account page inside
`bey-app-layout`, next to [`bey-account-data`](../../account-data/docs/account-data-readme.md), whose usage shows the
whole page. It is a card across the whole width, with its title and a short description beside the form (above it
below the `lg` breakpoint). It reads the account through the
[account service](../../../services/account/docs/account-readme.md), from `GET {baseUrl}`, and asks for the current
password, the new one, of at least 8 characters as express-components asks, and its confirmation, which must match.
Its single button is enabled once the three are valid, and sends them with `PUT {baseUrl}/password`
`{ currentPassword, password, password2 }`; the answer is a new session, which the block opens with
`BeySessionService.setToken`, confirms with `<prefix>.toast.success` and empties the form. An account without a
password (`hasPassword: false`), one that only signs in through another provider, is told instead how to set one: with
"Forgot your password?" on the sign-in page. A wrong current password answers `account.wrong-password` and an account
without a password `account.no-password`, whose texts the module ships under `angular-components.http`.

## Usage

```ts
readonly passwordChangeConfig = new BeyPasswordChangeConfig();
```

```html
<bey-password-change [config]="passwordChangeConfig"></bey-password-change>
```

## BeyPasswordChangeConfig

| Field     | Default                                | Meaning                                                                            |
| --------- | -------------------------------------- | ---------------------------------------------------------------------------------- |
| `baseUrl` | `'/account'`                           | Path of the account, resolved against the environment's `baseUrl` and `webApiPath` |
| `prefix`  | `'angular-components.password-change'` | i18n prefix every text of the block resolves from                                  |

`baseUrl` follows the `path` of the account module of express-components.

## Texts

| Key                                                | Shown as                                    |
| -------------------------------------------------- | ------------------------------------------- |
| `<prefix>.title`, `<prefix>.description`           | The title and the text beside it            |
| `<prefix>.password.<field>.label` / `.placeholder` | `current-password`, `password`, `password2` |
| `<prefix>.password.password2.mismatch`             | Under the confirmation while it differs     |
| `<prefix>.save`                                    | The button                                  |
| `<prefix>.no-password`                             | The text shown instead of the form          |
| `<prefix>.toast.success`                           | The toast once the password changes         |
