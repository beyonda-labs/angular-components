# Administration

The management pages of an app, gathered in one module: users, groups, roles and permissions, and organizations. Each
page is built on [`bey-page`](../../page/docs/page-readme.md) over the matching module of express-components, is
meant as the content of an app page inside `bey-app-layout`, and offers only what the backend lets its caller do. The
pages live in sub-folders of the module, each with its own README, texts and specs; what more than one of them uses
sits at the root of the module: `UserOrganizationsService` (the organizations a superadmin reads from
`GET {usersUrl}/organizations`, through `UserOrganizationsHttpService`) and `userRoleLabel` (the label of a role under
a `rolePrefix`). Each page owns its texts under `angular-components.<page>.*`, the `prefix` its config defaults to.

## Usage

```ts
readonly usersConfig = new BeyUsersConfig({ rolePrefix: 'myApp.roles' });
readonly groupsConfig = new BeyGroupsConfig();
readonly rolesConfig = new BeyRolesConfig({ permissionPrefix: 'myApp.permissions', rolePrefix: 'myApp.roles' });
readonly organizationsConfig = new BeyOrganizationsConfig();
```

```html
<bey-users [config]="usersConfig"></bey-users>
```

## Pages

| Page                  | Component           | Config                   | Texts                                | README                                                                   |
| --------------------- | ------------------- | ------------------------ | ------------------------------------ | ------------------------------------------------------------------------ |
| Users                 | `bey-users`         | `BeyUsersConfig`         | `angular-components.users.*`         | [users-readme.md](../users/docs/users-readme.md)                         |
| Groups                | `bey-groups`        | `BeyGroupsConfig`        | `angular-components.groups.*`        | [groups-readme.md](../groups/docs/groups-readme.md)                      |
| Roles and permissions | `bey-roles`         | `BeyRolesConfig`         | `angular-components.roles.*`         | [roles-readme.md](../roles/docs/roles-readme.md)                         |
| Organizations         | `bey-organizations` | `BeyOrganizationsConfig` | `angular-components.organizations.*` | [organizations-readme.md](../organizations/docs/organizations-readme.md) |

The errors of the server keep their own keys, `angular-components.http.error.<page>.*` and
`angular-components.http.title.<page>.*`, the ones the HTTP service reads for each message key of the server.
