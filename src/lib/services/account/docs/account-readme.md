# Account

The account of the signed-in user, behind [`bey-account-data`](../../../components/account-data/docs/account-data-readme.md)
and [`bey-password-change`](../../../components/password-change/docs/password-change-readme.md). It follows the account
module of express-components: `GET {baseUrl}` reads the profile, `PUT {baseUrl}` saves part of it and
`PUT {baseUrl}/password` changes the password, sent with the cookies, and answers a new session. A root service keeps
the profile for every block on the page: it asks for it once while a request for the same `baseUrl` is on its way, so
two blocks send a single `GET`, and it forgets the previous one and asks again whenever a block is created, so a new
visit or another user never sees a stale profile. Saving the profile keeps what the account answers and puts the name
and the surname on the session user; changing the password opens the session it answers. The
[preferences](../../preferences/docs/preferences-readme.md) save the language and the theme through the same
`PUT {baseUrl}`, without showing a failure. Only the type of the profile is public: the blocks are the way to use it.

## Usage

```ts
import { BeyAccountProfile } from '@beyonda-labs/angular-components';

const profile: BeyAccountProfile = { email: 'ada@example.com', hasPassword: true, id: 'u1', roles: ['editor'] };
```

## BeyAccountProfile

| Field         | Meaning                                                            |
| ------------- | ------------------------------------------------------------------ |
| `id`          | The id of the user                                                 |
| `email`       | The email the user signs in with, which the account cannot change  |
| `hasPassword` | `false` for an account that only signs in through another provider |
| `roles`       | The roles of the user                                              |
| `name`        | The name, absent until the user gives one                          |
| `surname`     | The surname, absent until the user gives one                       |
| `language`    | The language the user saved, applied by the preferences            |
| `theme`       | The theme the user saved, applied by the preferences               |
