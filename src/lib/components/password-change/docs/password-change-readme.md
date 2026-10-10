# Password change

The password of the signed-in user, one of the blocks an app composes into its own account page inside
`bey-app-layout`, next to [`bey-account-data`](../../account-data/docs/account-data-readme.md), whose usage shows the
whole page. It is a card across the whole width: its title and a short description on top, and the form under them,
across the card. It reads the account through the [account service](../../../services/account/docs/account-readme.md),
from `GET {baseUrl}`, and asks for the current password, the new one and its confirmation, which must match. The new
password is checked against the policy of the server, which the
[password policy service](../../../services/password-policy/docs/password-policy-readme.md) reads from
`GET {accessControlUrl}/password-policy` the first time the form shows: its rules are listed under the field as the user
types, as the [form fields](../../form/docs/form-fields-readme.md#password-policy) describe; the confirmation lists none.
A divider closes the form above its single button, which is enabled once the three are valid, and sends them with
`PUT {baseUrl}/password` `{ currentPassword, password, password2 }`; the answer is a new session, which the block opens
with `BeySessionService.setToken`, confirms with `<prefix>.toast.success` and empties the form. An account without a
password (`hasPassword: false`), one that only signs in through another provider, is told instead, under the same title
and description, how to set one: with "Forgot your password?" on the sign-in page, and the policy is not asked for. A
wrong current password answers `account.wrong-password` and an account without a password `account.no-password`, whose
texts the module ships under `angular-components.http`; a new password the server refuses answers one of the
`password.*` errors of the policy, whose texts the password policy service ships.

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
| `<prefix>.title`, `<prefix>.description`           | The title and the text under it             |
| `<prefix>.password.<field>.label` / `.placeholder` | `current-password`, `password`, `password2` |
| `<prefix>.password.password2.mismatch`             | Under the confirmation while it differs     |
| `<prefix>.save`                                    | The button                                  |
| `<prefix>.no-password`                             | The text shown instead of the form          |
| `<prefix>.toast.success`                           | The toast once the password changes         |
