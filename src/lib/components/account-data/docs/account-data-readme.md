# Account data

The profile of the signed-in user, one of the blocks an app composes into its own account page inside
`bey-app-layout`, next to [`bey-password-change`](../../password-change/docs/password-change-readme.md). It is a card
across the whole width, with its title and a short description beside the form (above it below the `lg` breakpoint).
It reads the account through the [account service](../../../services/account/docs/account-readme.md), from
`GET {baseUrl}`, and shows the `fields` of the config in their order and widths, a row taking fields until they fill
its 12 columns: the email, which cannot change, and the name and the surname. Its single button is enabled once the
form has a valid change, and saves with `PUT {baseUrl}` only the editable fields the config lists, trimmed, such as
`{ name, surname }`; the block confirms it with `<prefix>.toast.success` and puts the names the account answers on the
session user, so whatever shows them follows. A config that lists only the email offers no button.

## Usage

```ts
readonly layoutConfig = this.appShellService.buildConfig();
readonly headerConfig = new BeyHeaderConfig({ prefix: 'my-app.account', title: 'my-app.account.title' });
readonly accountDataConfig = new BeyAccountDataConfig({
    fields: [
        new BeyAccountDataField({ key: BeyAccountDataFieldKey.Email }),
        new BeyAccountDataField({ isRequired: true, key: BeyAccountDataFieldKey.Name })
    ]
});
readonly passwordChangeConfig = new BeyPasswordChangeConfig();
```

```html
<bey-app-layout [config]="layoutConfig">
    <div class="d-flex flex-column gap-3">
        <bey-header [config]="headerConfig"></bey-header>
        <bey-account-data [config]="accountDataConfig"></bey-account-data>
        <bey-password-change [config]="passwordChangeConfig"></bey-password-change>
    </div>
</bey-app-layout>
```

```ts
{ path: 'account', component: AccountPageComponent, canActivate: [beyAuthGuard] }
```

The route must be in the `allowedPaths` of every user who may open it, which the server decides.

## BeyAccountDataConfig

| Field     | Default                             | Meaning                                                                            |
| --------- | ----------------------------------- | ---------------------------------------------------------------------------------- |
| `baseUrl` | `'/account'`                        | Path of the account, resolved against the environment's `baseUrl` and `webApiPath` |
| `fields`  | the email, the name and the surname | The `BeyAccountDataField`s shown, in order                                         |
| `prefix`  | `'angular-components.account-data'` | i18n prefix every text of the block resolves from                                  |

`baseUrl` follows the `path` of the account module of express-components. A `fields` list with a key the account does
not store, or with the same key twice, throws when the config is built. The language and the theme of the account are
saved by the [preferences](../../../services/preferences/docs/preferences-readme.md), not by this block.

## BeyAccountDataField

| Field        | Default                              | Meaning                                                                                 |
| ------------ | ------------------------------------ | --------------------------------------------------------------------------------------- |
| `key`        |                                      | `BeyAccountDataFieldKey.Email`, `Name` or `Surname`, what the account module stores     |
| `columns`    | `12` for the email, `6` for the rest | Width on the 12-column grid; a field that does not fit in its row starts the next one   |
| `isRequired` | `false`                              | Holds the button back while the field is empty; ignored for the email, always read-only |

## Texts

| Key                                               | Shown as                         |
| ------------------------------------------------- | -------------------------------- |
| `<prefix>.title`, `<prefix>.description`          | The title and the text beside it |
| `<prefix>.profile.<field>.label` / `.placeholder` | `email`, `name`, `surname`       |
| `<prefix>.save`                                   | The button                       |
| `<prefix>.toast.success`                          | The toast once the profile saves |
