# Login

A full-page sign-in screen: a presentation card with the organisation and the product, a card with the
credentials form and the OAuth providers the backend offers, and the shared footer. When the backend defines
register fields, the same screen offers a multi-step registration.

## Usage

```ts
readonly config = new BeyLoginConfig({
    iconSrc: 'assets/logo.svg',
    productName: 'myApp.login.product',
    productDescription: 'myApp.login.pitch'
});
```

```html
<bey-login [config]="config" />
```

The route the OAuth providers return to renders `BeyLoginOAuthCallbackComponent`, which reads the tokens from
the query string and opens the session:

```ts
{ path: 'oauth/callback', component: BeyLoginOAuthCallbackComponent }
```

## BeyLoginConfig

| Field                | Required | Default                    | Meaning                                              |
| -------------------- | -------- | -------------------------- | ---------------------------------------------------- |
| `iconSrc`            | yes      |                            | Organisation icon, in the card and in the footer      |
| `productName`        | yes      |                            | i18n key of the product name                          |
| `productDescription` | yes      |                            | i18n key of the pitch under the product name          |
| `orgName`            | no       | `'Beyonda Labs'`           | Organisation name, shown as it is                     |
| `prefix`             | no       | `'angular-components.login'` | Prefix the titles, labels and buttons resolve from |
| `privacyUrl`         | no       | none                       | Route of the privacy link in the footer               |
| `termsUrl`           | no       | none                       | Route of the terms link in the footer                 |

## What the backend provides

Everything else comes from the access control api at `accessControlUrl` of the environment config:

| Endpoint           | Gives                                               | Used for                                   |
| ------------------ | --------------------------------------------------- | ------------------------------------------ |
| `/providers`       | `{ id, authUrl }[]`, ids among google, microsoft, facebook | The provider buttons under the form  |
| `/register/fields` | `{ name, type, required?, step? }[]`                | The registration form, one step per `step` |
| `/login`           | `{ accessToken, refreshToken }`                     | Signing in                                 |
| `/register`        | `{ accessToken, refreshToken }`                     | Registering                                |

A failing `/providers` or `/register/fields` is not an error: the screen just offers nothing. A provider the
component has no icon for is skipped.

Once a sign-in, a registration or an OAuth callback succeeds, both tokens go to `BeySessionService` and the
router goes to the `redirectPath` of the session user, or to the root when there is none.

Each registration step is a fresh `bey-form`: the fields of the form module bind to the control they were
created with, so a replaced config would leave them writing into a group nobody reads.

## Texts

With the default prefix, the keys are `angular-components.login.title.login`, `.title.register`,
`.login.button.login`, `.login.email.label`, `.register.button.next` and so on. A consumer with its own
prefix provides the same tree under it. A register field reads `.register.<name>.label`, with its `name` in
kebab-case: `firstName` is `.register.first-name.label`.

## Background

The body shows `assets/angular-components/images/login-bg-light.avif` or `login-bg-dark.avif` depending on
the current theme. Both ship with the library assets.

## Customisation

| Variable                    | Default               |
| --------------------------- | --------------------- |
| `--bey-login-card-bg`       | `--bey-bg-page`       |
| `--bey-login-card-border`   | `--bey-border-subtle` |
| `--bey-login-card-radius`   | `--bey-radius-xl`     |
| `--bey-login-card-shadow`   | `--bey-shadow-md`     |
| `--bey-login-card-width`    | `20.625rem`           |
| `--bey-login-overlay`       | `--bey-bg-page`       |
