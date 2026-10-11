# Roles

The roles and permissions page of an app, built on [`bey-page`](../../../page/docs/page-readme.md) over the roles module
of express-components, for the managers of an organization the app grants `roles.manage` to and the superadmin, and
meant as the content of an app page inside `bey-app-layout`. Every user holds a base role of the application, whose
permissions the app declares, and the managers add extra roles to the members of their organization: a name, an
optional description and a set of permissions that only add to the base role of whoever holds it. The page lists the
base roles first, read-only, and then the extra roles of the organization, each with its type ("Base" or
"Additional"), how many permissions it gives, how many users hold it directly, how many groups hold it ("Groups",
`groupCount`, whose members all get its permissions) and its description, in the order the server answers them, and searches them by name in the search box; a superadmin also sees the organization of each role and
filters by it, see [Organizations](#organizations). It creates an extra role, edits one, deletes extra roles after a
confirmation, and shows the permissions of a base role. Which actions it offers is up to the backend, as on any page:
`create` when `globalActions` lists it, and `edit` and `delete` for the rows whose `actions` list them, which are the
extra roles; a base role lists none. The extra roles are given to users on [the users page](../../users/docs/users-readme.md#extra-roles),
and to groups on [the groups page](../../groups/docs/groups-readme.md), whose members all get their permissions.

## Usage

```ts
readonly layoutConfig = this.appShellService.buildConfig();
readonly rolesConfig = new BeyRolesConfig({
    groupIcons: { documents: faFileLines, templates: faFolderOpen },
    groupOrder: ['templates', 'documents'],
    permissionPrefix: 'myApp.permissions',
    rolePrefix: 'myApp.roles'
});
```

```html
<bey-app-layout [config]="layoutConfig">
    <bey-roles [config]="rolesConfig"></bey-roles>
</bey-app-layout>
```

```ts
{ path: 'roles', component: RolesPageComponent, canActivate: [beyAuthGuard] }
```

The route must be in the `allowedPaths` of whoever holds `roles.manage`, which the server decides from the
`permissions` of its route permissions; anyone else gets `404` from `/roles`.

## BeyRolesConfig

| Field              | Default                                  | Meaning                                                                            |
| ------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------- |
| `baseUrl`          | `'/roles'`                               | Path of the roles, resolved against the environment's `baseUrl` and `webApiPath`   |
| `usersUrl`         | `'/users'`                               | Path of the users, where a superadmin reads the organizations from                 |
| `prefix`           | `'angular-components.roles'`             | i18n prefix of the page, as `bey-page` reads it                                    |
| `rolePrefix`       | `'angular-components.users.roles'`       | i18n prefix the labels of the base roles are read from, the `rolePrefix` of the users page |
| `permissionPrefix` | `'angular-components.roles.permissions'` | i18n prefix the labels of the permissions are read from, see [Permissions](#permissions) |
| `groupIcons`       | `{}`                                     | The icon of the section of each permission group, by group, see [Permissions](#permissions) |
| `groupOrder`       | `[]`                                     | The groups whose sections come first, in this order; the others follow in the order of the server, see [Order](#order) |
| `actionOrder`      | The default order of [Order](#order)     | The actions whose permissions come first in each section, in this order; the others follow in the order of the server |
| `storageKey`       | `'roles'`                                | Key under which the table remembers the columns the user hid                       |
| `height`           | `'calc(100vh - 220px)'`                  | Height of the table                                                                |

`baseUrl` follows the `path` of the roles module of express-components, and `usersUrl` the `path` of its users
module, as `baseUrl` of [`bey-users`](../../users/docs/users-readme.md) does.

## Requests

| Action        | Request                                                                              | Form                                                              |
| ------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| List          | `GET {baseUrl}?search=<base64>`                                                      |                                                                   |
| Permissions   | `GET {baseUrl}/permissions`                                                          |                                                                   |
| Organizations | `GET {usersUrl}/organizations`, for a superadmin only                                |                                                                   |
| `create`      | `POST {baseUrl}` `{ name, description, permissions, organizationId? }`               | Name, description, the organization for a superadmin (required) and the permissions |
| `edit`        | `PUT {baseUrl}/{id}` `{ name, description, permissions }`                            | The same, filled in with the role, without the organization       |
| `delete`      | `DELETE {baseUrl}` `{ ids }`, after a confirmation                                   | None                                                              |
| Permissions of a base role | None                                                                    | The name, the description and the permissions, read-only           |

The page reads, before the list shows, what the caller may put in a role: `GET {baseUrl}/permissions` answers
`{ permissions: [{ group, key }] }`, the permissions the caller holds, every one for a superadmin, without those that
manage users, the organization or roles, which no extra role holds. A failed answer counts as none, with no error, as a
caller without access gets `404` there and from the list. A superadmin reads them once, for every organization alike.

The name is required, at most 60 characters and sent trimmed; the server keeps it unique within the organization,
without regard to case, refuses the name of a base role, and answers both with `roles.existing-name`. The description
is optional and always sent, trimmed, so emptying it in an edit removes it. The permissions are sent as one list, every
one checked in any section, and at least one is required: while none is checked the form cannot be sent. The search box sends its text as the `text` of the search, which the backend matches against the name.
No column sorts, since the server keeps the base roles first.

The name of an extra role opens the edit form when the row lists `edit`. The name of a base role, or of any role the
caller cannot edit, opens its permissions instead (`table.view-permissions` as its tooltip): the same checklist with
the permissions of the role checked and every box disabled, nothing to select and the sections still folding, under
its name and description, closed with its only button (`view.buttons.close`).

`delete` asks first with `modal.delete.title` and `.message`, which warns that the users who hold the roles lose the
permissions they give, and the server takes the roles from them. A change of a role, or of who holds it, reaches a user
at the next refresh of their session, within the lifetime of the access token.

The errors of the module are translated under `angular-components.http.error.roles` and `.title.roles`:
`existing-name`, `invalid-permissions` (a permission the caller cannot give, or one that manages users, organizations
or roles), `not-found`, which a role deleted meanwhile, or of an organization out of reach, answers, and `base-role`,
a change or a delete of a base role.

## Permissions

The checklist is a [`BeyFormCheckboxSectionsField`](../../../form/docs/form-fields-readme.md#checkbox-sections) under the
label `form.permissions.label` ("Permissions:"): a foldable section per `group` of the answer, the resource the
permission belongs to, with the permissions of each group, both ordered as [Order](#order) says. Each section shows its icon, its label, how many of its permissions are checked ("3/6") and "Select all", which
turns into "Clear all" once they all are; its body is a grid of checkboxes, each with its label and, under it, its
description. Every section starts folded; its counter tells how many permissions of the role it holds. A permission the role holds that the answer leaves out, such as one the editor does not hold, is offered
too in the section of its prefix, so it can be unchecked; the read-only view of a base role shows that way the
permissions of the base role nobody can put in an extra role.

A permission `<group>.<action>` is labelled `<permissionPrefix>.<group>.<action>.label` and described by
`<permissionPrefix>.<group>.<action>.description`, and its section by `<permissionPrefix>.<group>.label`, every part
as a kebab-case segment; an action with dots of its own adds a level per part. A key the app does not translate is
read under the library's own node, `angular-components.roles.permissions`. Without a label there either, the label is
the action made readable, `templates.change-status` showing "Change status", and the section the group made readable,
"Templates"; without a description the permission shows none. The permissions are the app's, so the app translates
them under a node of its own and points `permissionPrefix` at it:

```ts
new BeyRolesConfig({ permissionPrefix: 'myApp.permissions' });
```

```json
{
    "myApp": {
        "permissions": {
            "templates": {
                "label": "Templates",
                "edit": { "label": "Edit templates", "description": "Can change the templates." }
            }
        }
    }
}
```

The icon of a section is the one `groupIcons` gives its group, an `IconDefinition` such as an outline icon of
`@fortawesome/free-regular-svg-icons`; the library's own groups have theirs (`users`, `organization`, `roles`), and any
other group shows `faRectangleList`.

The module ships the labels and descriptions of the library's own permissions: `users.read`, `users.invite`,
`users.edit`, `users.change-status`, `organization.manage` and `roles.manage`, with the labels of their groups.

### Order

The sections follow `groupOrder`: the groups it lists come first, in its order, and every other group after them, in
the order the server answers them. `groupOrder` is empty by default, so the sections keep the order of the server.
Inside a section the permissions follow `actionOrder`, matched on the action of each key (`templates.read` is `read`,
`templates.category.create` is `category.create`): the ones it lists come first, in its order, and the others after
them, in the order of the server. A permission the role holds that the answer leaves out is ordered by the same rule,
as if the server had answered it last. The library's own groups, `users`, `organization` and `roles`, follow both
lists like any other. Nothing else sorts them on the way: neither the request nor the checklist. The roles module of
express-components answers the permissions sorted by group and key, so without either list they read in that order.

The default `actionOrder` puts reading first, then the changes of an item, then its folders and its trash, and the
administration last: `read`, `read-definition`, `create`, `edit`, `edit-definition`, `delete`, `duplicate`,
`complete`, `download`, `change-status`, `convert-to-block`, `convert-to-template`, `replace-content`, `export`,
`import`, `share`, `create-category`, `edit-category`, `delete-category`, `move`, `restore-trash-item`,
`delete-trash-item`, `empty-trash`, `invite` and `manage`. An `actionOrder` of the app replaces the whole list, and
`[]` keeps the order of the server.

```ts
new BeyRolesConfig({
    actionOrder: ['read', 'edit', 'publish'],
    groupOrder: ['templates', 'documents', 'global-variables', 'attachments']
});
```

## Organizations

A manager reaches the extra roles of their own organization, and the server answers its rows without an organization,
so the page shows nothing about organizations to anyone but a superadmin. A superadmin reaches the extra roles of
every organization, and their rows carry `organizationId` and `organizationName`, as
[`BeyPageOrganizationItem`](../../../page/docs/page-readme.md#organizations) reads them; a base role carries `null`.

The page knows a superadmin by the roles of the session user (`superadmin`), as
[`bey-groups`](../../groups/docs/groups-readme.md#organizations) does, and reads `GET {usersUrl}/organizations` for it
alone, before the list shows; a failed answer counts as none, with no error.

-   **The column.** With two active organizations or more, every row shows its organization in an "Organization"
    column after the group count (`table.columns.organization`), and a base role shows "All" there
    (`table.every-organization`). With one or none the column does not show.
-   **The filter.** With two active organizations or more, the filters offer an "Organization" field, `organizationId`
    `equals`, with those organizations by name.
-   **The create form.** It always asks a superadmin for the organization, required, and sends it as
    `organizationId`. With a single active organization it comes chosen already, with several none is, and with none
    the form cannot be sent; the server offers `create` to a superadmin only while an organization is active. A manager
    is never asked: the role goes to their organization.

The edit form never offers the organization: roles do not move between organizations.

## Texts

Every text follows [the page](../../../page/docs/page-readme.md#texts) under `prefix`: `title`, `actions.<key>.label` and
`.tooltip`, `table.columns.<key>`, `table.tooltips.<key>`, `table.empty`, `table.every-organization`,
`table.view-permissions`, `type.base` and `.extra`, `search.fields.<key>`, `form.create.title`, `form.edit.title`,
`form.main.<field>.label` and `.placeholder`, `form.permissions.label` (the label above the checklist) and `.empty`
(when there is nothing to give), `modal.delete.title` and `.message`, `toast.<key>-success`, and for the read-only view
`view.title`, `view.buttons.close`, `view.main.name.label`, `view.main.description.label`,
`view.permissions.label` and `.empty` (a role with no permission to show). The module ships all of them in English
and Spanish.
