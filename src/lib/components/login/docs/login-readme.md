# Login

A full-page sign-in screen: a presentation card with the organisation and the product, a card with the
credentials form and the OAuth providers the backend offers, and the shared footer. When the backend defines
register fields, the same screen offers a multi-step registration; when the config allows it, a link to reset a
forgotten password. Three more pages share the same look for the links the server mails: choosing a new password,
verifying an email address and accepting an invitation.

## Usage

```ts
readonly config = new BeyLoginConfig({
    iconSrc: 'assets/logo.svg',
    isPasswordResetEnabled: true,
    productName: 'myApp.login.product',
    productDescription: 'myApp.login.pitch'
});
```

```html
<bey-login [config]="config" />
```

The route the OAuth providers return to renders `BeyLoginOAuthCallbackComponent`. The server lands there once it
has set the refresh cookie, with no token in the URL, or with `?error=unauthorized` when the provider refused,
`?error=account-inactive` for a deactivated account or `?error=organization-inactive` for a user of a deactivated
organization: the component goes back to `loginRoute` on any error, without saying which yet, and otherwise restores
the session through the cookie and goes to the `redirectPath` of the user, or to `loginRoute` when nothing can be
restored:

```ts
{ path: 'oauth/callback', component: BeyLoginOAuthCallbackComponent }
```

## The pages of the emailed links

The server mails links to `/reset-password`, `/verify-email` and `/accept-invitation`, each with `?token=`. The app
routes each path to a page that renders the matching component with the same `BeyLoginConfig` as the login, and
no guard: whoever opens the link has no session yet.

```html
<bey-login-reset-password [config]="config" />
<bey-login-verify-email [config]="config" />
<bey-login-accept-invitation [config]="config" />
```

An app that enables `withComponentInputBinding()` in its router can instead route the components themselves and
give the config as route data, `data: { config }`.

| Component                           | Selector                      | What it does                                                                  |
| ----------------------------------- | ----------------------------- | ----------------------------------------------------------------------------- |
| `BeyLoginResetPasswordComponent`    | `bey-login-reset-password`    | Asks for the new password twice and saves it with the token                   |
| `BeyLoginVerifyEmailComponent`      | `bey-login-verify-email`      | Sends the token as soon as it opens, showing the progress                     |
| `BeyLoginAcceptInvitationComponent` | `bey-login-accept-invitation` | Reads the invitation, prefills the name and asks for the details and password |

Each one opens the session the server answers, exactly as a sign-in does, and goes to the `redirectPath` of the
user. The new password of the reset and of the invitation is checked against the password policy of the server, as is
the `password` field of the registration: the rules show under the field as the user types, the form holds back a
password that breaks one, and the confirmation (`password2`) lists none. The
[password policy service](../../../services/password-policy/docs/password-policy-readme.md) asks for the policy the
first time one of those fields shows, so the sign-in alone never asks for it. A link without a token, or one the server refuses with `account.token-invalid`, shows why the link no longer
works and a link back to `loginRoute`; the reset page also links to `loginRoute?view=forgot-password`, which opens
the login on the forgotten password view when `isPasswordResetEnabled` is set. When the verification or the
invitation cannot be read for any other reason, the page offers to try again.

## BeyLoginConfig

| Field                    | Required | Default                      | Meaning                                                    |
| ------------------------ | -------- | ---------------------------- | ---------------------------------------------------------- |
| `iconSrc`                | yes      |                              | Organisation icon, in the card and in the footer           |
| `productName`            | yes      |                              | i18n key of the product name                               |
| `productDescription`     | yes      |                              | i18n key of the pitch under the product name               |
| `isPasswordResetEnabled` | no       | `false`                      | Offers "Forgot your password?"; the server needs its links |
| `orgName`                | no       | `'Beyonda Labs'`             | Organisation name, shown as it is                          |
| `prefix`                 | no       | `'angular-components.login'` | Prefix the titles, labels and buttons resolve from         |
| `privacyUrl`             | no       | none                         | Route of the privacy link in the footer                    |
| `termsUrl`               | no       | none                         | Route of the terms link in the footer                      |

## What the backend provides

Everything else comes from the access control api at `accessControlUrl` of the environment config:

| Endpoint                    | Gives                                                                 | Used for                                   |
| --------------------------- | --------------------------------------------------------------------- | ------------------------------------------ |
| `GET /providers`            | `{ id, authUrl }[]`, ids among google, microsoft, facebook            | The provider buttons under the form        |
| `GET /register/fields`      | `{ name, type, required?, step? }[]`                                  | The registration form, one step per `step` |
| `GET /password-policy`      | `{ minLength, maxLength, is…Required }`                               | The rules listed under a new password      |
| `POST /login`               | `{ accessToken }`, and the refresh cookie                             | Signing in                                 |
| `POST /register`            | `{ accessToken }` and the cookie, or `{ verificationRequired: true }` | Registering                                |
| `POST /password/forgot`     | `204`, whether the account exists or not                              | Asking for a reset link                    |
| `POST /verification/resend` | `204`, whether a mail left or not                                     | Asking for a new verification link         |
| `POST /password/reset`      | `{ accessToken }`, and the refresh cookie                             | Saving the new password of a reset link    |
| `POST /verification`        | `{ accessToken }`, and the refresh cookie                             | Verifying an email address                 |
| `GET /invitation?token=`    | `{ email, name?, surname? }`                                          | Showing an invitation                      |
| `POST /invitation`          | `{ accessToken }`, and the refresh cookie                             | Accepting it                               |

A failing `/providers` or `/register/fields` is not an error: the screen just offers nothing. A failing
`/password-policy` is not one either: the fields check the library defaults, a minimum of 8 characters, and the server
still refuses what breaks its own policy with one of the `password.*` errors, shown in the error modal. A provider the
component has no icon for is skipped.

Every request that answers a session is sent with the credentials, so the browser keeps the httpOnly cookie the
server sets with the refresh token; the front never sees it. Once a sign-in, a registration, an OAuth callback or
an emailed link succeeds, the access token goes to `BeySessionService` and the router goes to the `redirectPath`
of the session user, or to the root when there is none. A failed request shows the reason the server gives under
`angular-components.http.error.login.*` or `.account.*`, such as `invalid-credentials`,
`invalid-credentials-attempts-left` with the `attemptsLeft` before the lock and its `minutes`, `account-locked` with the
`minutes` left after too many failed attempts, `account-inactive` for a deactivated account, `organization-inactive`
for a user of a deactivated organization other than a superadmin, both answered only after the right password, or
`token-invalid` for an emailed link that no longer works; `invalid-origin` is the answer to a refresh or a logout sent
from another site. A session whose account or organization is deactivated meanwhile ends at its next refresh, which
the server refuses, and the user lands on `loginRoute`. A new password the server refuses answers `.password.*`, such
as `too-short` with its `min`.

A registration answered with `{ verificationRequired: true }` opens no session: the screen asks to check the inbox
instead. A sign-in refused with `login.email-not-verified` offers, under the form, to resend the verification email
to the `email` of the refusal. The forgotten password and the resend confirm in the same neutral words whatever the
server did, so they tell nobody whether an account exists.

Each registration step is a fresh `bey-form`: the fields of the form module bind to the control they were
created with, so a replaced config would leave them writing into a group nobody reads.

## Accessibility

Each view moves the focus to its first field, unless something else holds it already, such as the error modal.
The fields carry their autofill hints (`email`, `current-password`, `new-password`, `given-name`, `family-name`), the
confirmation of a new password is refused while it differs from the password, the rules of the password policy are a
polite live region that describes the new password, and the progress and the confirmations are written into a
`role="status"` region.

## Texts

With the default prefix, the keys are `angular-components.login.title.login`, `.title.register`,
`.login.button.login`, `.login.email.label`, `.register.button.next` and so on. A consumer with its own
prefix provides the same tree under it. A register field reads `.register.<name>.label`, with its `name` in
kebab-case: `firstName` is `.register.first-name.label`.

The views of the account flows read `.title.<view>` (`forgot-password`, `registered`, `reset-password`,
`verify-email`, `accept-invitation`, `invalid-link`), and the groups `.forgot-password.*`, `.reset-password.*`,
`.verify-email.*`, `.accept-invitation.*`, `.link-error.*`, `.login.unverified.*`, `.registered.*` and
`.validation.*`, plus `.back-to-sign-in`.

## Background

The body shows `assets/angular-components/images/login-bg-light.avif` or `login-bg-dark.avif` depending on
the current theme. Both ship with the library assets.

## Customisation

The variables are declared on each of the four pages, `bey-login` and the three of the emailed links, so an
override names the ones it changes: `:root bey-login, :root bey-login-reset-password { … }`.

| Variable                  | Default               |
| ------------------------- | --------------------- |
| `--bey-login-card-bg`     | `--bey-bg-page`       |
| `--bey-login-card-border` | `--bey-border-subtle` |
| `--bey-login-card-radius` | `--bey-radius-xl`     |
| `--bey-login-card-shadow` | `--bey-shadow-md`     |
| `--bey-login-card-width`  | `20.625rem`           |
| `--bey-login-overlay`     | `--bey-bg-page`       |
