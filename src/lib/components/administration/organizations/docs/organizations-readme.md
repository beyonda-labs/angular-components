# Organizations

The organizations page of an app, built on [`bey-page`](../../../page/docs/page-readme.md) over the organizations module
of express-components, for the superadmin only, and meant as the content of an app page inside `bey-app-layout`. It
lists every organization with its name, its status, how many users belong to it, active or not, and its creation date,
sorted by name, and searches them by name in the search box and by status in the filters. It creates an organization
and edits one: its name and its status in one form, which also shows its administrators, its groups with their members
and its members in no group; and it deletes a deactivated one with everything in it, see [Deletion](#deletion). Which
actions it offers is up to the backend, as on any page: `create` when `globalActions` lists it, and `edit` and `delete`
for the rows whose `actions` list them. The name of an organization opens the edit form when the row lists `edit`, as
Edit in the header does for the selected row. The first admin of an organization is invited from
[the users page](../../users/docs/users-readme.md#organizations), where the superadmin chooses the organization and the
roles.

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

| Field           | Default                              | Meaning                                                                                                                                              |
| --------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseUrl`       | `'/organizations'`                   | Path of the organizations, resolved against the environment's `baseUrl` and `webApiPath`                                                             |
| `prefix`        | `'angular-components.organizations'` | i18n prefix of the page, as `bey-page` reads it                                                                                                      |
| `contentLabels` | `{}`                                 | The translation key that labels each kind of content the counts of a deletion name, by the key the server counts it under, see [Deletion](#deletion) |
| `storageKey`    | `'organizations'`                    | Key under which the table remembers the columns the user hid                                                                                         |
| `height`        | `'calc(100vh - 220px)'`              | Height of the table                                                                                                                                  |

`baseUrl` follows the path of the organizations module of express-components.

## Requests

| Action   | Request                                                               | Form                                              |
| -------- | --------------------------------------------------------------------- | ------------------------------------------------- |
| List     | `GET {baseUrl}?search=<base64>`                                       |                                                   |
| `create` | `POST {baseUrl}` `{ name }`                                           | The name                                          |
| `edit`   | `GET {baseUrl}/{id}`, then `PUT {baseUrl}/{id}` `{ name, status? }`   | The name and the status, and its people read-only |
| `delete` | `GET {baseUrl}/{id}/content`, then `DELETE {baseUrl}/{id}` `{ name }` | The counts of what goes, and the name to type     |

The name is required, at most 100 characters and sent trimmed; the server keeps it unique app-wide, without regard to
case. The search box sends its text as the `text` of the search, which the backend matches against the name; the
filter sends `status`. The columns sort by `name`, `userCount` and `createdAt`, the fields the server sorts by; the
status does not sort.

`edit` reads the organization first, `{ ...row, administrators, groups: [{ id, name, members }], ungroupedMembers }`,
every member as `{ id, name, email }` and its groups by name, and opens one form on the page, "Edit organization", with:

-   **the name**, filled in with the current one;
-   **"Status"** (`form.main.status`), "Active" or "Inactive", filled in with the current one;
-   **"Administrators"** (`form.administrators.label`), read-only: the users holding a base role that manages the
    organization, or `form.administrators.no-members` ("No administrators yet") when none is active;
-   **"Groups"** (`form.groups.label`), read-only: each group under its name with its members, or
    `form.groups.no-members` for a group without members, and `form.groups.empty` ("This organization has no groups
    yet.") when it has none; last, **"No group"** (`form.groups.ungrouped`), the members who are in no group, which is
    not a group and shows only when someone is in it.

Every list names a member "name (email)", or by the email alone when the user has no name, and holds active members
only, as [the organization summary](../../organization-summary/docs/organization-summary-readme.md) does; the server
answers them so.

Saving sends the name, trimmed, and the status only when it changes; then the form closes, confirms with
`toast.edit-success` and reloads. The status changes `active → inactive` and `inactive → active`, for every
organization, the initial one included. The users of a deactivated organization can no longer sign in nor refresh their
session. The superadmins belong to no organization, so a deactivation never touches them, and they never count in the
user count. Each status has its badge: `active` success and `inactive` neutral.

## Deletion

The server offers `delete` to the superadmin on a deactivated organization, the initial one included, one row at a
time, in the menu of the header. The page reads `GET {baseUrl}/{id}/content`, `{ counts: { users, groups, roles, [key]:
number } }`, `roles` being its extra roles, and opens "Delete organization" (`delete.title`): what goes for good
(`delete.message`, with the name), the counts of what it holds above zero, "Users: 3" (`content.count`, labelled
`content.users`, `.groups` and `.roles` unless `contentLabels` names them, and every other key by `contentLabels` or by
the key itself), or "It holds nothing." (`content.empty`), and a required text field, "Type «Acme» to confirm"
(`delete.confirm`). Its danger button "Delete" (`delete.submit`) stays disabled until the field holds the name exactly,
case and spaces included; another text shows "The name does not match." (`delete.name-mismatch`). It sends
`DELETE {baseUrl}/{id}` `{ name }`, confirms with `toast.delete-success` and reloads. Every user of the organization, of
any status, goes with what they own, and its groups, extra roles, shares and edit locks too; the server takes a backup
of the database first.

The errors of the module are translated under `angular-components.http.error.organizations` and
`.title.organizations`: `existing-name` (with its `name`), `not-found`, `active` (a delete of an organization still
active) and `name-mismatch`.

## Texts

Every text follows [the page](../../../page/docs/page-readme.md#texts) under `prefix`: `title`, `actions.<key>.label` and
`.tooltip`, `table.columns.<key>`, `table.tooltips.<key>`, `table.empty`, `search.fields.<key>`, `status.<status>`,
`form.create.title`, `form.edit.title`, `form.main.name.label` and `.placeholder`, `form.main.status.label` and
`.placeholder`, `form.administrators.label` and `.no-members`, `form.groups.label`, `.empty`, `.no-members` and
`.ungrouped`, `content.label`, `.count`, `.empty`, `.users`, `.groups` and `.roles`, `delete.title`, `.message`,
`.confirm`, `.name-mismatch`, `.submit` and `.main.name.placeholder`, and `toast.<key>-success`. The module ships all of
them in English and Spanish.
