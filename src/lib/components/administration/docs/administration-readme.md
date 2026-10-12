# Administration

The management pages of an app, gathered in one module: users, groups, roles and permissions, and organizations, and
the read-only summary of the organization of a member. Each page is built on [`bey-page`](../../page/docs/page-readme.md) over the matching module of express-components, is
meant as the content of an app page inside `bey-app-layout`, and offers only what the backend lets its caller do. The
pages live in sub-folders of the module, each with its own README, texts and specs; what more than one of them uses
sits at the root of the module: `UserOrganizationsService` (the organizations a superadmin reads from
`GET {usersUrl}/organizations`, through `UserOrganizationsHttpService`), `userRoleLabel` (the label of a role under
a `rolePrefix`), `buildDisabledOrganizationField` (the organization of a row in a disabled select, which the edit
forms of roles and groups show a superadmin), `RoleViewFormService` with the role permission functions and their
model (the read-only view of the permissions of a role, which the roles page, the groups of a member and the
organization summary open, and the checklist the role forms share), `userFullName`, `userDisplayName` and `userContactLabel` ("Name Surname (email)"),
`buildGroupMemberListRows` (each group under its name with its members in a read-only list, which the superadmin's
organization form shows) and the content counts the deletions of users and organizations
list. Each page owns its texts under `angular-components.<page>.*`, the `prefix` its config defaults to.

## Usage

```ts
readonly usersConfig = new BeyUsersConfig({ rolePrefix: 'myApp.roles' });
readonly groupsConfig = new BeyGroupsConfig();
readonly rolesConfig = new BeyRolesConfig({ permissionPrefix: 'myApp.permissions', rolePrefix: 'myApp.roles' });
readonly organizationsConfig = new BeyOrganizationsConfig();
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
| Organization summary  | `bey-organization-summary` | `BeyOrganizationSummaryConfig` | `angular-components.organization-summary.*` | [organization-summary-readme.md](../organization-summary/docs/organization-summary-readme.md) |

The errors of the server keep their own keys, `angular-components.http.error.<page>.*` and
`angular-components.http.title.<page>.*`, the ones the HTTP service reads for each message key of the server.

Wherever the name of a row opens something, a header action does the same for the selected row: Edit where the row
lists `edit`, and View, the standard `view` action of [the page](../../page/docs/page-readme.md#header-actions), where it
lists `view`, as the groups and the roles a caller may only read do.

## Members

Besides the managers, a member of an organization may see part of it through four permissions an extra role gives,
none held by default: `organization.read` the [summary](../organization-summary/docs/organization-summary-readme.md),
`organization.read-groups` their [groups](../groups/docs/groups-readme.md#members) and their members,
`organization.read-group-roles` the roles of those groups, and `organization.read-roles` their own
[roles](../roles/docs/roles-readme.md#members). The groups and roles pages turn read-only by themselves when the
answer of the server says so, and the users page is never offered to them.

Wherever the module names a user from data that may be `null`, a user or a row deleted since, it reads "Unknown"
(`angular-components.user-name.unknown`, "Desconocido" in Spanish), the text the owner cell, the usages and the edit lock
notice of the library share.
