# Users

The users page of an app, built on [`bey-page`](../../page/docs/page-readme.md) over the users module of
express-components and meant as the content of an app page inside `bey-app-layout`. It lists every account with its
name and surname, email, roles and extra roles, status, last sign-in and creation date (hidden at first), sorted by email, and searches
them by name or email in the search box and by status and role in the filters; a superadmin also sees the organization
of each user and filters by it, see [Organizations](#organizations). It invites a user, edits one, their status
included, and sends their invitation again. The roles it offers come from `GET {baseUrl}/roles`, read before the
list shows; when they cannot be read the list shows anyway, with no role to offer. Which actions it offers is up to the
backend, as on any page: `create` when `globalActions` lists it, and `edit` and `resend-invitation` for the rows whose
`actions` list them. A user's name opens the edit form when the row lists `edit`.

## Usage

```ts
readonly layoutConfig = this.appShellService.buildConfig();
readonly usersConfig = new BeyUsersConfig({ rolePrefix: 'myApp.roles' });
```

```html
<bey-app-layout [config]="layoutConfig">
    <bey-users [config]="usersConfig"></bey-users>
</bey-app-layout>
```

```ts
{ path: 'users', component: UsersPageComponent, canActivate: [beyAuthGuard] }
```

The route must be in the `allowedPaths` of the users who manage the others, which the server decides from their
permissions.

## BeyUsersConfig

| Field        | Default                      | Meaning                                                                               |
| ------------ | ---------------------------- | ------------------------------------------------------------------------------------- |
| `baseUrl`    | `'/users'`                   | Path of the users, resolved against the environment's `baseUrl` and `webApiPath`      |
| `prefix`     | `'angular-components.users'` | i18n prefix of the page, as `bey-page` reads it                                       |
| `rolePrefix` | `<prefix>.roles`             | i18n prefix the labels of the roles are read from, see [Roles](#roles)                |
| `storageKey` | `'users'`                    | Key under which the table remembers the columns the user hid                          |
| `height`     | `'calc(100vh - 220px)'`      | Height of the table                                                                   |

`baseUrl` follows the `path` of the users module of express-components.

## Requests

| Action              | Request                                                       | Form                                                         |
| ------------------- | ------------------------------------------------------------- | ------------------------------------------------------------ |
| List                | `GET {baseUrl}?search=<base64>`                               |                                                              |
| Organizations       | `GET {baseUrl}/organizations`, for a superadmin only          |                                                              |
| Invite (`create`)   | `POST {baseUrl}` `{ email, roles, extraRoleIds?, name?, surname?, language?, organizationId? }` | Email, name, surname, the organization for a superadmin (required), roles, extra roles and the language of the invitation |
| `edit`              | `PUT {baseUrl}/{id}` `{ name?, surname?, status?, roles?, extraRoleIds? }` | The email to read, name, surname, status, roles and extra roles, see [Editable fields](#editable-fields) |
| `resend-invitation` | `POST {baseUrl}/{id}/invitation`                              | None                                                         |

A name, a surname or a language left empty is not sent, and at least one role must be checked. The search box sends its
text as the `text` of the search, which the backend matches against the email, the name and the surname at once
(`textField` of [the page](../../page/docs/page-readme.md#search)); the filters send `status` and `role`. The languages
of the invitation are the `languages` of the [preferences](../../../services/preferences/docs/preferences-readme.md),
and none picked sends the invitation in the default language of the mail.

Each status has its badge: `active` success, `invited` info, `unverified` warning and `inactive` neutral. Every guard
(nobody deactivates themselves, only a superadmin touches a superadmin, the last superadmin stays, nobody grants or
removes the superadmin role) runs on the server, whose errors the module translates under
`angular-components.http.error.users`, such as `superadmin-role-fixed`.

## Editable fields

There is one action to change a user, `edit`, and its form shows every field: the email to read, the name and the
surname, the status ("Status", `form.main.status`, "Active" or "Inactive"), the roles and the extra roles. Each row
says which of them its caller may change as `editableFields`, a subset of `name`, `surname`, `roles`, `extraRoleIds`
and `status` (`BeyUserEditableField`); every field the row leaves out shows disabled, never hidden, and the request
sends only the fields the row names, the status only when it changes. The server checks every field again.

-   **Another superadmin**, seen by a superadmin, lets only its `status` change.
-   **An invited or unverified user** shows its status disabled, as it stands: only an account that signed in is active
    or inactive, and the invitation is what brings it in.
-   **The own row** lists no `edit`: names are changed on the account page.

A row without `editableFields`, from a server before express-components 1.3.0, keeps every field enabled and shows no
status, as before. The change of a status follows the server: `active → inactive` and `inactive → active`, an account
brought back coming back as `invited`, `unverified` or `active`, as the backend decides.

## Organizations

Every user belongs to one organization, except the superadmins: support accounts of the system, outside every
organization, whose rows carry `organizationId` and `organizationName` `null`. A manager sees and invites only within
their own organization and never sees a superadmin, and the server strips the organization from the rows it answers
them, so the page shows nothing about organizations to anyone but a superadmin.

The page knows a superadmin by the roles of the session user (`superadmin`, read from the token by
[the session](../../../services/session/docs/session-readme.md)), rather than by asking and failing: nobody else sends
the request. For a superadmin it reads `GET {baseUrl}/organizations`, which answers `{ organizations: [{ id, name }] }`,
the active organizations sorted by name, together with the roles and before the list shows; a failed answer counts as
none, with no error.

-   **The column.** A superadmin sees every user, the superadmins included and itself among them, so what it sees spans
    the active organizations plus the superadmins, who count as one value more. With one active organization or more,
    every row shows its organization in an "Organization" column after the email (`table.columns.organization`),
    sortable by `organizationName`, and the row of a superadmin shows "System" there (`table.system`). The users of a
    deactivated organization still show theirs. With no active organization only the superadmins are left to tell
    apart, and the column does not show. The page decides before the list shows, from those organizations, not from the
    rows of the page in view, so paging or filtering never makes the column come and go.
-   **The filter.** With two active organizations or more, the filters offer an "Organization" field, `organizationId`
    `equals`, with those organizations by name. It offers only the active organizations, the ones a user can be invited
    into, so the users of a deactivated organization are found through the search box. A superadmin matches no
    organization, so its row shows only with no organization filter.
-   **The invitation.** The invite form always asks a superadmin for the organization, required, and sends it as
    `organizationId`: a superadmin belongs to none, so nothing is taken from the session. With a single active
    organization it comes chosen already, with several none is, and with none the form cannot be sent. The server offers
    `create` to a superadmin only while an organization is active, so the invitation is not offered when it cannot
    succeed.

The edit form never offers the organization: users do not move between organizations. Nor does the page ever offer
the superadmin role, which is fixed and comes from the seeding only: `GET {baseUrl}/roles` never lists it, the row of
a superadmin never lets its roles change, and the server refuses an invitation or an edit that grants or removes it
with `users.superadmin-role-fixed`. The row of another superadmin lists `edit` to a superadmin, with only its status to
change; the own row lists nothing.

## Roles

A role is labelled `<rolePrefix>.<role>`, with the role as a kebab-case segment, and shows its own name when that key
has no translation. The roles are the app's, so the app translates them under a node of its own and points
`rolePrefix` at it:

```ts
new BeyUsersConfig({ rolePrefix: 'myApp.roles' });
```

```json
{ "myApp": { "roles": { "admin": "Administrator", "editor": "Editor" } } }
```

The module only ships `angular-components.users.roles.superadmin`, read while `rolePrefix` keeps its default.

## Extra roles

An organization may have extra roles of its own, which [the roles page](../../roles/docs/roles-readme.md) defines and
which only add permissions to the base role of whoever holds them. `GET {baseUrl}/roles` answers them together with
the base roles, `{ roles, extraRoles: [{ id, name, organizationId }] }`: those of the organization of the caller, or of
every organization for a superadmin. A server that answers no `extraRoles` counts as one without extra roles. Every
row lists the extra roles of its user as `extraRoles: [{ id, name }]`.

-   **The table.** The roles column shows the extra roles of the user by name after its roles, in a badge of their own.
-   **The forms.** The invite and edit forms offer the extra roles of the organization of the user as checkboxes,
    "Additional roles" (`form.main.extra-role-ids`), after the roles, and send the ones checked as `extraRoleIds`; an
    edit sends them all, so unchecking one takes it away. For a superadmin, the invitation offers those of the
    organization chosen in the form and follows the choice, sending only those of the organization chosen at last, and
    the edit offers those of the organization of the user. An extra role the user holds and the answer does not name is
    offered too, so it can be unchecked. The group does not show, and nothing is sent, when the organization has no
    extra roles.
-   **The filter.** The role filter offers the extra roles after the roles, by name, and for a superadmin of two active
    organizations or more with the organization of each, "Reviewers (Acme)"; it sends the `id` of the extra role as the
    value of `role`.

An extra role of another organization, or an unknown one, is refused with `users.invalid-extra-roles`. A change of the
roles of a user reaches them at the next refresh of their session, within the lifetime of the access token.

## Texts

Every text follows [the page](../../page/docs/page-readme.md#texts) under `prefix`: `title`, `actions.<key>.label` and
`.tooltip`, `table.columns.<key>`, `table.tooltips.<key>`, `table.empty`, `table.no-name` (the name of a user who has
none), `table.system` (the organization of a superadmin), `search.fields.<key>`, `status.<status>`,
`form.create.title`, `form.edit.title`, `form.main.<field>.label` and `.placeholder`, and `toast.<key>-success`. The module ships all of them in English and Spanish.
