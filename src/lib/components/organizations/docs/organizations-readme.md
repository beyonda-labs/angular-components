# Organizations

The organizations page of an app, built on [`bey-page`](../../page/docs/page-readme.md) over the organizations module
of express-components, for the superadmin only, and meant as the content of an app page inside `bey-app-layout`. It
lists every organization with its name, its status, how many users belong to it, active or not, and its creation date,
sorted by name, and searches them by name in the search box and by status in the filters. It creates an organization
and edits one: its name and its status in one form, which also shows its groups and their members; it never deletes
one. Which actions it offers is up to the backend, as on any page: `create` when `globalActions` lists it, and `edit`
for the rows whose `actions` list it. The name of an organization opens the edit form when the row lists `edit`. The
first admin of an organization is invited from [the users page](../../users/docs/users-readme.md#organizations), where
the superadmin chooses the organization and the roles.

## Usage

```ts
readonly layoutConfig = this.appShellService.buildConfig();
readonly organizationsConfig = new BeyOrganizationsConfig();
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
| `prefix`     | `'angular-components.organizations'` | i18n prefix of the page, as `bey-page` reads it                                  |
| `storageKey` | `'organizations'`                    | Key under which the table remembers the columns the user hid                     |
| `height`     | `'calc(100vh - 220px)'`              | Height of the table                                                              |

`baseUrl` follows the path of the organizations module of express-components.

## Requests

| Action           | Request                                                                                | Form                                                  |
| ---------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| List             | `GET {baseUrl}?search=<base64>`                                                        |                                                       |
| `create`         | `POST {baseUrl}` `{ name }`                                                            | The name                                              |
| `edit`           | `GET {baseUrl}/{id}`, then `PUT {baseUrl}/{id}` `{ name, status? }`                    | The name and the status, and the groups read-only     |

The name is required, at most 100 characters and sent trimmed; the server keeps it unique app-wide, without regard to
case. The search box sends its text as the `text` of the search, which the backend matches against the name; the
filter sends `status`. The columns sort by `name`, `userCount` and `createdAt`, the fields the server sorts by; the
status does not sort.

`edit` reads the organization first, `{ ...row, groups: [{ id, name, members: [{ id, name, email }] }] }`, its groups
by name, and opens one form on the page, "Edit organization", with:

-   **the name**, filled in with the current one;
-   **"Status"** (`form.main.status`), "Active" or "Inactive", filled in with the current one;
-   **"Groups"** (`form.groups.label`), read-only: each group under its name with its members, "name (email)" or the
    email alone when the user has no name, or `form.groups.no-members` for a group without members, and
    `form.groups.empty` ("This organization has no groups yet.") when it has none.

Saving sends the name, trimmed, and the status only when it changes; then the form closes, confirms with
`toast.edit-success` and reloads. The status changes `active → inactive` and `inactive → active`, for every
organization, the initial one included. The users of a deactivated organization can no longer sign in nor refresh their
session. The superadmins belong to no organization, so a deactivation never touches them, and they never count in the
user count. Each status has its badge: `active` success and `inactive` neutral.

The errors of the module are translated under `angular-components.http.error.organizations` and
`.title.organizations`: `existing-name` (with its `name`) and `not-found`.

## Texts

Every text follows [the page](../../page/docs/page-readme.md#texts) under `prefix`: `title`, `actions.<key>.label` and
`.tooltip`, `table.columns.<key>`, `table.tooltips.<key>`, `table.empty`, `search.fields.<key>`, `status.<status>`,
`form.create.title`, `form.edit.title`, `form.main.name.label` and `.placeholder`, `form.main.status.label` and
`.placeholder`, `form.groups.label`, `.empty` and `.no-members`, and `toast.<key>-success`. The module ships all of them
in English and Spanish.
