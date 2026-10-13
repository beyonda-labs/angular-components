# Administration

The management pages of an app, gathered in one module: users, groups, roles and permissions, organizations and the
audit, each a list on [`bey-page`](../../page/docs/page-readme.md) over the matching module of express-components, and the
read-only summary of the organization of a member, in cards. Each page is meant as the content of an app page inside
`bey-app-layout` and offers only what the backend lets its caller do. The pages read alike wherever they meet: a
person in a list or a search is "Name Surname (email)", or the email alone; a base role is labelled from a
`rolePrefix`, or by its name; the permissions of a role open read-only in the same sections the role forms check; a
deletion lists, by kind, what it takes with it; and a superadmin sees the organization of a row, disabled in the edit
forms, and browses the [folders per organization](#folders-per-organization). Each page has its own README and owns its
texts under `angular-components.<page>.*`, the `prefix` its config defaults to. Besides the exports of each page, the
module exports `BeyRoleViewSettings`, the settings the permissions of a role follow wherever a page opens them (a
`BeyRolesConfig` fits), and `BeyRolePermissionEntry`, a permission `{ group, key }` as the roles page reads them.

## Usage

```ts
readonly usersConfig = new BeyUsersConfig({ rolePrefix: 'myApp.roles' });
readonly groupsConfig = new BeyGroupsConfig();
readonly rolesConfig = new BeyRolesConfig({ permissionPrefix: 'myApp.permissions', rolePrefix: 'myApp.roles' });
readonly organizationsConfig = new BeyOrganizationsConfig();
readonly auditConfig = new BeyAuditConfig({ entityLabels: { templates: 'myApp.audit.entities.templates' } });
readonly organizationSummaryConfig = new BeyOrganizationSummaryConfig();
```

```html
<bey-users [config]="usersConfig"></bey-users>
```

## Pages

| Page                  | Component                  | Config                         | Texts                                       | README                                                                                        |
| --------------------- | -------------------------- | ------------------------------ | ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Users                 | `bey-users`                | `BeyUsersConfig`               | `angular-components.users.*`                | [users-readme.md](../users/docs/users-readme.md)                                              |
| Groups                | `bey-groups`               | `BeyGroupsConfig`              | `angular-components.groups.*`               | [groups-readme.md](../groups/docs/groups-readme.md)                                           |
| Roles and permissions | `bey-roles`                | `BeyRolesConfig`               | `angular-components.roles.*`                | [roles-readme.md](../roles/docs/roles-readme.md)                                              |
| Organizations         | `bey-organizations`        | `BeyOrganizationsConfig`       | `angular-components.organizations.*`        | [organizations-readme.md](../organizations/docs/organizations-readme.md)                      |
| Audit                 | `bey-audit`                | `BeyAuditConfig`               | `angular-components.audit.*`                | [audit-readme.md](../audit/docs/audit-readme.md)                                              |
| Organization summary  | `bey-organization-summary` | `BeyOrganizationSummaryConfig` | `angular-components.organization-summary.*` | [organization-summary-readme.md](../organization-summary/docs/organization-summary-readme.md) |

The errors of the server keep their own keys, `angular-components.http.error.<page>.*` and
`angular-components.http.title.<page>.*`, the ones the HTTP service reads for each message key of the server.

Wherever the name of a row opens something, a header action does the same for the selected row: Edit where the row
lists `edit`, and View, the standard `view` action of [the page](../../page/docs/page-readme.md#header-actions), where it
lists `view`, as the groups and the roles a caller may only read do.

## Folders per organization

A superadmin belongs to no organization and sees the users, the groups and the roles of all of them, so those three
pages show it one folder per organization, browsed with the [categories](../../page/docs/page-readme.md#categories-and-trash)
of `bey-page`. Nobody else gets folders: a manager or a member keeps the flat list of their own organization, and the
page sends them no `parentId`. The page knows a superadmin by the roles of the session, as for the
[organization column](../users/docs/users-readme.md#organizations).

-   **The root** lists one folder per organization, deactivated ones included, and the rows that belong to none: the
    superadmins on the users page and the base roles on the roles page; nothing else on the groups page.
-   **A folder** is a row of the list with `entryType: 'category'`, its `id` the id of the organization, its `name`,
    `actions: []` and optionally `itemCount`. Its name, with a folder icon, opens it, with no tooltip, as the folders of
    every page; once open, the breadcrumb counts its rows. The page reads the folders by `entryType` (`typeField`), as
    base-entity does where rows have a type of their own, so a folder never clashes with a field of the rows, such as
    the type the roles show; the rows answered to the superadmin may carry `entryType: 'item'`.
-   **Inside a folder** the list shows the rows of that organization, under a breadcrumb "Users › Acme Legal" that
    starts at `categories.root` and counts what the folder holds.
-   **The folders are fixed**: they list no action, and the header offers none of the category actions, so none is
    created, renamed, moved, shared or deleted.
-   **A create inside a folder**, an invitation, a group or a role, comes with the organization of the folder chosen in
    its form, which the superadmin may still change; at the root it comes with none, or with the only active one. The
    form learns the folder from the open category `bey-page` hands to `toFormValue`, and the organization comes chosen
    only while the form offers it, never for a deactivated one.
-   **The search.** A search text or a filter at the root answers the matching rows of every organization, each with
    its organization in its column; inside a folder it stays within that folder. The page sends the search as usual and
    the backend decides what it spans.
-   **The organization column** shows only in that search at the root, the one list where rows of several
    organizations meet. Browsing the root, where every row is a folder or belongs to none, and inside a folder, with a
    search or without, it leaves the table with its cells. The pages give `bey-page` an
    [`isColumnShown`](../../page/docs/page-readme.md#sort-and-columns) that reads the column by its key,
    `organization`, so the column changes with the list that answers. The organization filter does not depend on it.

The list is asked as on any page with categories: `GET {baseUrl}?parentId=null&search=…` at the root and
`?parentId=<organizationId>` inside a folder, the breadcrumb from `GET {baseUrl}/categories/<organizationId>/path`,
which answers `[{ id, name }]`, and a create sends the `parentId` of the folder, or `null`, next to its
`organizationId`, the organization the row is created in. The users, groups and roles modules of express-components
serve it for the superadmin and ignore `parentId` for everyone else.

## Members

Besides the managers, a member of an organization may see part of it through four permissions an extra role gives,
none held by default: `organization.read` the [summary](../organization-summary/docs/organization-summary-readme.md),
`organization.read-groups` their [groups](../groups/docs/groups-readme.md#members) and their members,
`organization.read-group-roles` the roles of those groups, and `organization.read-roles` their own
[roles](../roles/docs/roles-readme.md#members). The groups and roles pages turn read-only by themselves when the
answer of the server says so, and the users page is never offered to them. The [audit](../audit/docs/audit-readme.md)
goes with `audit.read` (`BEY_AUDIT_READ_PERMISSION`), which an app gives its admin role and may grant to an extra role.

Wherever the module names a user from data that may be `null`, a user or a row deleted since, it reads "Unknown"
(`angular-components.user-name.unknown`, "Desconocido" in Spanish), the text the owner cell, the usages and the edit lock
notice of the library share.
