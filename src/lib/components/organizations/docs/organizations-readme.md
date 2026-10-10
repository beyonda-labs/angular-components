# Organizations

The organizations page of an app, built on [`bey-page`](../../page/docs/page-readme.md) over the organizations module
of express-components, for the superadmin only, and meant as the content of an app page inside `bey-app-layout`. It
lists every organization with its name, its status, how many users belong to it, active or not, and its creation date,
sorted by name, and searches them by name in the search box and by status in the filters. It creates an organization,
renames one, deactivates or reactivates it, and invites its first admin; it never deletes one. Which actions it offers
is up to the backend, as on any page: `create` when `globalActions` lists it, and `edit`, `change-status` and
`invite-admin` for the rows whose `actions` list them. The name of an organization opens the rename form when the row
lists `edit`.

## Usage

```ts
readonly layoutConfig = this.appShellService.buildConfig();
readonly organizationsConfig = new BeyOrganizationsConfig({ adminRole: 'adminuser' });
```

```html
<bey-app-layout [config]="layoutConfig">
    <bey-organizations [config]="organizationsConfig"></bey-organizations>
</bey-app-layout>
```

```ts
{ path: 'organizations', component: OrganizationsPageComponent, canActivate: [beyAuthGuard] }
```

The route must be in the `allowedPaths` of the superadmin only, which the server decides from the route permissions;
anyone else gets `404` from `/organizations`.

## BeyOrganizationsConfig

| Field        | Default                              | Meaning                                                                          |
| ------------ | ------------------------------------ | -------------------------------------------------------------------------------- |
| `baseUrl`    | `'/organizations'`                   | Path of the organizations, resolved against the environment's `baseUrl` and `webApiPath` |
| `usersUrl`   | `'/users'`                           | Path of the users, where the invitation of an admin goes                         |
| `adminRole`  | `'adminuser'`                        | The role the invited admin gets                                                  |
| `prefix`     | `'angular-components.organizations'` | i18n prefix of the page, as `bey-page` reads it                                  |
| `storageKey` | `'organizations'`                    | Key under which the table remembers the columns the user hid                     |
| `height`     | `'calc(100vh - 220px)'`              | Height of the table                                                              |

`baseUrl` follows the path of the organizations module of express-components, and `usersUrl` the `path` of its users
module, as `baseUrl` of [`bey-users`](../../users/docs/users-readme.md) does.

## Requests

| Action           | Request                                                                                | Form                                                  |
| ---------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| List             | `GET {baseUrl}?search=<base64>`                                                        |                                                       |
| `create`         | `POST {baseUrl}` `{ name }`                                                            | The name                                              |
| `edit`           | `PUT {baseUrl}/{id}` `{ name }`                                                        | The name, filled in with the current one              |
| `change-status`  | `POST {baseUrl}/{id}/status` `{ status }`                                              | The status the current one reaches                    |
| `invite-admin`   | `POST {usersUrl}` `{ email, organizationId, roles: [adminRole], name?, surname?, language? }` | The organization to read, email, name, surname and the language of the invitation |

The name is required, at most 100 characters and sent trimmed; the server keeps it unique app-wide, without regard to
case. The search box sends its text as the `text` of the search, which the backend matches against the name; the
filter sends `status`. The columns sort by `name`, `userCount` and `createdAt`, the fields the server sorts by; the
status does not sort.

The status changes `active → inactive` and `inactive → active`. The users of a deactivated organization can no longer
sign in nor refresh their session, superadmins excepted. The server leaves `change-status` out of the actions of an
organization that holds an active superadmin, so the page never offers it there, and refuses it anyway with
`organizations.has-superadmin`. Each status has its badge: `active` success and `inactive` neutral.

`invite-admin` opens a form on the page with the name of the organization, the email (required), the name, the surname
and the language of the invitation, whose languages are the `languages` of the
[preferences](../../../services/preferences/docs/preferences-readme.md). It sends the invitation to the users module
with the organization and the `adminRole`, a name, a surname or a language left empty not sent, then closes the form,
confirms with `toast.invite-admin-success` and reloads, so the user count grows. A refused invitation shows the
server's reason: the `users.*` errors of [`bey-users`](../../users/docs/users-readme.md), such as an email in use, or
`organizations.not-found` for an organization deactivated meanwhile.

The errors of the module are translated under `angular-components.http.error.organizations` and
`.title.organizations`: `existing-name` (with its `name`), `has-superadmin` and `not-found`.

## Texts

Every text follows [the page](../../page/docs/page-readme.md#texts) under `prefix`: `title`, `actions.<key>.label` and
`.tooltip`, `table.columns.<key>`, `table.tooltips.<key>`, `table.empty`, `search.fields.<key>`, `status.<status>`,
`form.create.title`, `form.edit.title`, `form.main.name.label` and `.placeholder`, `change-status.*`,
`toast.<key>-success`, and for the invitation `invite-admin.title`, `invite-admin.buttons.cancel` and `.submit`, and
`invite-admin.main.<field>.label` and `.placeholder`. The module ships all of them in English and Spanish.
