# Groups

The groups page of an app, built on [`bey-page`](../../page/docs/page-readme.md) over the groups module of
express-components, for the managers of an organization and the superadmin, and meant as the content of an app page
inside `bey-app-layout`. A group belongs to one organization and holds users of that organization; it is what folders
will be shared with. The page lists the groups with their name, how many members they have and their creation date,
sorted by name, and searches them by name in the search box; a superadmin also sees the organization of each group and
filters by it, see [Organizations](#organizations). It creates a group, renames one, deletes groups after a
confirmation, and sets the members of one. Which actions it offers is up to the backend, as on any page: `create` when
`globalActions` lists it, and `edit`, `members` and `delete` for the rows whose `actions` list them. The name of a group
opens the rename form when the row lists `edit`.

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

| Field        | Default                       | Meaning                                                                                  |
| ------------ | ----------------------------- | ---------------------------------------------------------------------------------------- |
| `baseUrl`    | `'/groups'`                   | Path of the groups, resolved against the environment's `baseUrl` and `webApiPath`        |
| `usersUrl`   | `'/users'`                    | Path of the users, where a superadmin reads the organizations from                       |
| `prefix`     | `'angular-components.groups'` | i18n prefix of the page, as `bey-page` reads it                                          |
| `storageKey` | `'groups'`                    | Key under which the table remembers the columns the user hid                             |
| `height`     | `'calc(100vh - 220px)'`       | Height of the table                                                                      |

`baseUrl` follows the `path` of the groups module of express-components, and `usersUrl` the `path` of its users
module, as `baseUrl` of [`bey-users`](../../users/docs/users-readme.md) does.

## Requests

| Action    | Request                                                                                    | Form                                                       |
| --------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| List      | `GET {baseUrl}?search=<base64>`                                                            |                                                            |
| Organizations | `GET {usersUrl}/organizations`, for a superadmin only                                  |                                                            |
| `create`  | `POST {baseUrl}` `{ name, organizationId? }`                                               | The name, and the organization for a superadmin (required) |
| `edit`    | `PUT {baseUrl}/{id}` `{ name }`                                                            | The name, filled in with the current one                   |
| `delete`  | `DELETE {baseUrl}` `{ ids }`, after a confirmation                                         | None                                                       |
| `members` | `GET {baseUrl}/{id}/member-options` and `GET {baseUrl}/{id}/members`, then `PUT {baseUrl}/{id}/members` `{ userIds }` | The users of the organization of the group, the members checked |

The name is required, at most 100 characters and sent trimmed; the server keeps it unique within the organization,
without regard to case, and refuses a taken one with `groups.existing-name`. The search box sends its text as the
`text` of the search, which the backend matches against the name. The columns sort by `name`, `memberCount`,
`organizationName` and `createdAt`, the fields the server sorts by.

`delete` asks first with `modal.delete.title` and `.message`, which warns that the members lose the folders shared with
the groups, and the server drops their memberships with them.

`members` reads, at once, the users the group may hold, `{ users: [{ id, name, email }] }`, the users of its
organization by name with the superadmins left out, and its current members, `{ members: [...] }` in the same shape.
It then opens a form on the page with the name of the group and a checkbox per user, labelled "name (email)", or the
email alone when the user has no name, with the members checked; a member the options do not name is offered too, so
it can be unchecked. Saving sends the checked users, all of them, since the request replaces the members; then the
form closes, confirms with `toast.members-success` and reloads, so the member count follows. With no user to offer, the
form says so under the empty list (`members.main.user-ids.empty`). A user of another organization, a superadmin or an
unknown id is refused with `groups.invalid-members`.

The errors of the module are translated under `angular-components.http.error.groups` and `.title.groups`:
`existing-name` (with its `name`), `invalid-members` and `not-found`, which a group deleted meanwhile, or of an
organization out of reach, answers.

## Organizations

A manager reaches the groups of their own organization, and the server answers its rows without an organization, so
the page shows nothing about organizations to anyone but a superadmin. A superadmin reaches every group, and its rows
carry `organizationId` and `organizationName`, as [`BeyPageOrganizationItem`](../../page/docs/page-readme.md#organizations)
reads them.

The page knows a superadmin by the roles of the session user (`superadmin`), as
[`bey-users`](../../users/docs/users-readme.md#organizations) does, and nobody else sends the request. For a superadmin
it reads `GET {usersUrl}/organizations`, the active organizations by name, before the list shows; a failed answer
counts as none, with no error. Groups have no source of organizations of their own, and that answer is the one the
users page invites into, so a group is created in the same organizations a user is invited into.

-   **The column.** With two active organizations or more, every row shows its organization in an "Organization"
    column after the member count (`table.columns.organization`), sortable by `organizationName`. The groups of a
    deactivated organization stay, and show theirs. With one or none the column does not show, since every group
    belongs to an organization and there would be nothing to tell apart. The page decides before the list shows, from
    those organizations, so paging or filtering never makes the column come and go.
-   **The filter.** With two active organizations or more, the filters offer an "Organization" field, `organizationId`
    `equals`, with those organizations by name.
-   **The create form.** It always asks a superadmin for the organization, required, and sends it as
    `organizationId`. With a single active organization it comes chosen already, with several none is, and with none
    the form cannot be sent; the server offers `create` to a superadmin only while an organization is active. A manager
    is never asked: the group goes to their organization.

The rename form never offers the organization: groups do not move between organizations.

## Texts

Every text follows [the page](../../page/docs/page-readme.md#texts) under `prefix`: `title`, `actions.<key>.label` and
`.tooltip`, `table.columns.<key>`, `table.tooltips.<key>`, `table.empty`, `search.fields.<key>`, `form.create.title`,
`form.edit.title`, `form.main.<field>.label` and `.placeholder`, `modal.delete.title` and `.message`,
`toast.<key>-success`, and for the members `members.title`, `members.buttons.cancel` and `.submit`,
`members.main.group.label`, `members.main.user-ids.label` and `.empty`. The module ships all of them in English and
Spanish.
