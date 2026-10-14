# Groups

The groups page of an app, built on [`bey-page`](../../../page/docs/page-readme.md) over the groups module of
express-components, for the managers of an organization and the superadmin, and meant as the content of an app page
inside `bey-app-layout`. A group belongs to one organization and holds users of that organization; it is what folders
are shared with, and it may hold extra roles of its organization, whose permissions every member gets as if they held
them. The page lists the groups with their name, how many members they have, how many extra roles they hold ("Roles",
`extraRoleCount`) and their creation date, sorted by name, and searches them by name in the search box; a superadmin
also sees the organization of each group and filters by it, see [Organizations](#organizations). It creates a group,
edits one (its name, its members and its extra roles, in one form), and deletes groups after a confirmation. Which
actions it offers is up to the backend, as on any page: `create` when `globalActions` lists it, and `edit` and `delete`
for the rows whose `actions` list them. The name of a group opens the edit form when the row lists `edit`, as Edit in
the header does for the selected row. A member who may only see their own groups gets the same page read-only, see
[Members](#members).

## Usage

```ts
readonly layoutConfig = this.appShellService.buildConfig();
readonly groupsConfig = new BeyGroupsConfig();
```

```html
<bey-app-layout [config]="layoutConfig">
    <bey-groups [config]="groupsConfig"></bey-groups>
</bey-app-layout>
```

```ts
{ path: 'groups', component: GroupsPageComponent, canActivate: [beyAuthGuard] }
```

The route must be in the `allowedPaths` of the managers and the superadmin, which the server decides from the route
permissions; anyone else gets `404` from `/groups`.

## BeyGroupsConfig

| Field           | Default                          | Meaning                                                                                                                                                                                                                           |
| --------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseUrl`       | `'/groups'`                      | Path of the groups, resolved against the environment's `baseUrl` and `webApiPath`                                                                                                                                                 |
| `usersUrl`      | `'/users'`                       | Path of the users, where a superadmin reads the organizations from                                                                                                                                                                |
| `rolesConfig`   | the defaults of `BeyRolesConfig` | The settings of the roles page the permissions of a role follow in [Members](#members): `actionOrder`, `groupIcons`, `groupOrder`, `permissionPrefix`, `prefix` and `rolePrefix` (`BeyRoleViewSettings`); a `BeyRolesConfig` fits |
| `prefix`        | `'angular-components.groups'`    | i18n prefix of the page, as `bey-page` reads it                                                                                                                                                                                   |
| `storageKey`    | `'groups'`                       | Key under which the table remembers the columns the user hid                                                                                                                                                                      |
| `foldersHeight` | none                             | Height of the table while it shows the folders of the superadmin, `height` when not given                                                                                                                                         |
| `height`        | none                             | Height of the table, any CSS length; without it the page fills the content area of the app layout and the table scrolls inside                                                                                                    |

`baseUrl` follows the `path` of the groups module of express-components, and `usersUrl` the `path` of its users
module, as `baseUrl` of [`bey-users`](../../users/docs/users-readme.md) does.

## Requests

| Action        | Request                                                                                                                                                | Form                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| List          | `GET {baseUrl}?search=<base64>`, with `parentId` for a superadmin, see [Organizations](#organizations)                                                 |                                                                                |
| Organizations | `GET {usersUrl}/organizations`, for a superadmin only                                                                                                  |                                                                                |
| `create`      | `POST {baseUrl}` `{ name, organizationId? }`                                                                                                           | The name, and the organization for a superadmin (required)                     |
| `edit`        | `GET {baseUrl}/{id}`, then `PUT {baseUrl}/{id}` `{ name, userIds, extraRoleIds }`                                                                      | The name, the members and the extra roles, filled in with what the group holds |
| Searches      | `GET {baseUrl}/{id}/member-options?search=<text>&limit=<n>` and `GET {baseUrl}/{id}/role-options?search=<text>&limit=<n>`, while the edit form is open |                                                                                |
| `delete`      | `DELETE {baseUrl}` `{ ids }`, after a confirmation                                                                                                     | None                                                                           |
| `view`        | `GET {baseUrl}/{id}`, for a member, see [Members](#members)                                                                                            | The name, the members and, when answered, the roles, read-only                 |

The name is required, at most 100 characters and sent trimmed; the server keeps it unique within the organization,
without regard to case, and refuses a taken one with `groups.existing-name`. The search box sends its text as the
`text` of the search, which the backend matches against the name. The columns sort by `name`, `memberCount`,
`extraRoleCount`, `organizationName` and `createdAt`, the fields the server sorts by.

`delete` asks first with `modal.delete.title` and `.message`, which warns that the members lose the folders shared with
the groups, and the server drops their memberships with them.

`edit` reads the group with its members and extra roles, `{ ...row, members: [{ id, name, email }], extraRoles:
[{ id, name }] }`, and opens one form on the page, "Edit group", with:

-   **the name**, filled in with the current one;
-   **the organization**, for a superadmin only, disabled, see [Organizations](#organizations);
-   **"Members"** (`form.main.user-ids`), a search above the list of the members, each "name (email)", or the email
    alone when the user has no name, with a remove button; "This group has no members yet." (`form.main.user-ids.empty`)
    while it has none;
-   **"Additional roles"** (`form.main.extra-role-ids`), the same for the extra roles, each by name; "This group has no
    additional roles yet." (`form.main.extra-role-ids.empty`) while it has none.

Both are [lists that hold ids](../../../form/docs/form-fields-readme.md#lists-that-hold-ids), so the organization is
never read whole, however many users it has:

-   **The search** asks the server as soon as it opens, for `''`, and again for the text typed once typing settles:
    `member-options` answers `{ users: [{ id, name, email }] }`, the users of the organization of the group, by name,
    with the superadmins left out, matching the email, the name or "name surname"; `role-options` answers
    `{ extraRoles: [{ id, name }] }`, the extra roles of the organization, matching the name. Both match whatever the
    case and the accents, so "nora", "nora lec", "nora@" and "INIGO" find who they name.
-   **The limit.** The server does not leave out who the list holds already, so the form asks for `20` more than the
    list holds, `50` at most, leaves those out and suggests the first `20` of the rest. When the server answered as
    many as asked for, or more than `20` are left, the suggestions end with "There are more matches: type more to
    narrow them down." (`hasMore` of [the search](../../../form/docs/form-fields-readme.md#searching-and-picking)).
-   **Picking** a suggestion adds its row and empties the search; the remove button of a row takes it out. Either one
    changes the form, so it can be saved.

Saving sends the name and every member and extra role of the lists, since the request replaces them; then the form
closes, confirms with `toast.edit-success` and reloads, so the counts follow. A user of another
organization, a superadmin or an unknown id is refused with `groups.invalid-members`, and an extra role of another
organization or an unknown one with `groups.invalid-extra-roles`. What the extra roles of a group give reaches its
members at the next refresh of their session, within the lifetime of the access token.

The errors of the module are translated under `angular-components.http.error.groups` and `.title.groups`:
`existing-name` (with its `name`), `invalid-members`, `invalid-extra-roles` and `not-found`, which a group deleted
meanwhile, or of an organization out of reach, answers.

## Members

The groups module of express-components answers a member who holds `organization.read-groups`, and not
`organization.manage`, only the groups they belong to, `{ id, name, memberCount, createdAt, actions: ['view'] }`, with
`roleCount` too when they also hold `organization.read-group-roles`, and no `globalActions`. The page reads that from the
answer: rows whose actions list nothing but `view`, and no `create`, turn it read-only where it stands, its columns
following, without asking for the groups again.

-   **The columns** are "Name", "Members", "Roles" (`table.columns.role-count`, the `roleCount` of each group) only while
    the rows count them, and "Created". An empty answer leaves the columns as they were.
-   **The name** of a group opens it (`table.view-group` as its tooltip), read from `GET {baseUrl}/{id}`, `{ id, name,
members: [{ id, name, surname, email }], extraRoles? }`, in "Group details" (`view.title`), closed with its only
    button (`view.buttons.close`): its name, "Members" (`view.main.members`) in the look of a read-only list, each
    "Name Surname (email)", or the email alone, and "This group has no members yet." (`view.main.members.empty`) without
    any.
-   **View.** Once a row that lists `view` is selected, "View" in the header opens the same, next to where Edit sits so
    it shows directly: the standard `view` action of [the page](../../../page/docs/page-readme.md#header-actions), with
    the label of the page module and the tooltip `actions.view.tooltip` ("See the members of the selected group").
-   **The roles.** When the answer brings `extraRoles: [{ id, name, description?, permissions }]`, the view lists them too,
    "Additional roles" (`view.main.extra-roles`, or "This group gives no additional roles."), each name a link that opens
    its permissions in the read-only view of [the roles page](../../roles/docs/roles-readme.md), the checklist disabled, in
    the sections, icons and order `rolesConfig` sets. That view shows the permissions the role holds; the list of every
    permission is not asked for, since a member who reads their groups may not read it.

Holding only `organization.read-group-roles` shows nothing: both requests answer `404`.

## Organizations

A manager reaches the groups of their own organization, and the server answers its rows without an organization, so
the page shows nothing about organizations to anyone but a superadmin. A superadmin reaches every group, and its rows
carry `organizationId` and `organizationName`, as [`BeyPageOrganizationItem`](../../../page/docs/page-readme.md#organizations)
reads them.

The page knows a superadmin by the roles of the session user (`superadmin`), as
[`bey-users`](../../users/docs/users-readme.md#organizations) does, and nobody else sends the request. For a superadmin
it reads `GET {usersUrl}/organizations`, the active organizations by name, before the list shows; a failed answer
counts as none, with no error. Groups have no source of organizations of their own, and that answer is the one the
users page invites into, so a group is created in the same organizations a user is invited into.

-   **The column.** A superadmin sees an "Organization" column after the extra role count in a search at the root
    (`table.columns.organization`), sortable by `organizationName`, however many organizations are active, so the
    organization of every group found shows even when there is a single one. The groups of a deactivated organization
    stay, and show theirs. Browsing the folders the column leaves the table, see the folders below.
-   **The filter.** With two active organizations or more, the filters offer an "Organization" field, `organizationId`
    `equals`, with those organizations by name.
-   **The create form.** It always asks a superadmin for the organization, required, and sends it as
    `organizationId`. With a single active organization it comes chosen already, with several none is, and with none
    the form cannot be sent; the server offers `create` to a superadmin only while an organization is active. A manager
    is never asked: the group goes to their organization.
-   **The edit form** shows a superadmin the organization of the group after the name, in a disabled select, and never
    sends it: groups do not move between organizations. A manager does not see it.
-   **The folders.** A superadmin sees one folder per organization at the root, and nothing else there, and the groups
    of an organization inside its folder; a search text or a filter at the root finds the groups of every organization,
    the one list with the organization column, which inside a folder, searching or not, the page leaves out. A group
    created inside a folder comes with its organization chosen, which the superadmin may still change. A root
    of folders alone keeps the page as it was, since only groups tell what the caller may do. See
    [folders per organization](../../docs/administration-readme.md#folders-per-organization).

## Texts

Every text follows [the page](../../../page/docs/page-readme.md#texts) under `prefix`: `title`, `actions.<key>.label` and
`.tooltip` (only the tooltip for `view`, whose label is the page module's), `table.columns.<key>`,
`table.tooltips.<key>`, `table.empty`, `categories.root` (the root of its breadcrumb), `count.categories.one` and
`.other` and `count.items.one` and `.other` (its count), `search.fields.<key>`,
`form.create.title`,
`form.edit.title`, `form.main.<field>.label` and `.placeholder`, the placeholder of a search, `form.main.user-ids.empty`
and `form.main.extra-role-ids.empty`, `modal.delete.title` and `.message`, `table.view-group`, `view.title`,
`view.buttons.close`, `view.main.<field>.label`, `view.main.members.empty` and `view.main.extra-roles.empty`, and
`toast.<key>-success`. The module ships all of them in English and Spanish.
