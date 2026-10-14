# Audit

The audit page of an app, built on [`bey-page`](../../../page/docs/page-readme.md) over the audit module of
express-components, and meant as the content of an app page inside `bey-app-layout`. It lists, newest first, who did
what, when and from where: every change to the rows of an entity, the administration of users, groups, roles and
organizations, the sign-ins, failed or not, the sign-outs, the lockouts and the password changes and recoveries, as the
server records them. It is read-only: it searches, filters, exports the selection to a CSV file and opens one event in
a read-only view, and it creates, edits and deletes nothing. An organization admin sees the events of their own
organization; the superadmin sees all of them and filters by organization, see [Organizations](#organizations).

## Usage

```ts
readonly layoutConfig = this.appShellService.buildConfig();
readonly auditConfig = new BeyAuditConfig({
    entityLabels: { templates: 'myApp.audit.entities.templates' },
    actionLabels: { publish: 'myApp.audit.verbs.publish' }
});
```

```html
<bey-app-layout [config]="layoutConfig">
    <bey-audit [config]="auditConfig"></bey-audit>
</bey-app-layout>
```

```ts
{ path: 'audit', component: AuditPageComponent, canActivate: [beyAuthGuard] }
```

The route must be in the `allowedPaths` of those who hold `audit.read`, `BEY_AUDIT_READ_PERMISSION`, which an app gives
its admin role and may grant to an extra role; the superadmin always passes. The [roles page](../../roles/docs/roles-readme.md#permissions)
labels it "See the audit", in an "Audit" section.

## BeyAuditConfig

| Field          | Default                      | Meaning                                                                                                                        |
| -------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `baseUrl`      | `'/audit'`                   | Path of the audit, resolved against the environment's `baseUrl` and `webApiPath`                                               |
| `usersUrl`     | `'/users'`                   | Path of the users, where a superadmin reads the organizations from                                                             |
| `entityLabels` | `{}`                         | The translation key that labels each entity of the app, by the name the server records, see [Labels](#labels)                  |
| `actionLabels` | `{}`                         | The translation key that labels each verb of the app the library does not know, see [Labels](#labels)                          |
| `prefix`       | `'angular-components.audit'` | i18n prefix of the page, as `bey-page` reads it                                                                                |
| `storageKey`   | `'audit'`                    | Key under which the table remembers the columns the user hid                                                                   |
| `height`       | none                         | Height of the table, any CSS length; without it the page fills the content area of the app layout and the table scrolls inside |

`baseUrl` follows the `path` of the audit module of express-components, and `usersUrl` the `path` of its users module,
as the [groups page](../../groups/docs/groups-readme.md) does.

## BeyAuditEventRow

The row the server answers, typed for a consumer that reads one: `{ id, occurredAt, action, entity, userId, userName,
userEmail, entityId, entityName, organizationId, organizationName?, ip, requestId, details?, actions }`. `occurredAt` is
in epoch milliseconds, `organizationName` comes only in the answers of the superadmin, and `details` is a small record,
such as `{ from: 'draft', to: 'published' }`. The names and the email are copies the server took when the event
happened, so an event stays readable once the user or the row is gone; whatever has no copy reads "Unknown"
(`angular-components.user-name.unknown`).

## Requests

| Action        | Request                                                                        |
| ------------- | ------------------------------------------------------------------------------ |
| List          | `GET {baseUrl}?search=<base64>`, the protocol of `bey-page`                    |
| Organizations | `GET {usersUrl}/organizations`, for a superadmin only                          |
| User filter   | `GET {baseUrl}/user-options?search=<text>&limit=20`, while the filter is typed |
| `export`      | `GET {baseUrl}/export?search=<base64>`, the CSV file                           |
| `view`        | `GET {baseUrl}/{id}`                                                           |

The list answers `{ results, globalActions: ['export'], search: { total } }`, every row with `actions: ['view']`. It starts
sorted by `occurredAt`, newest first. The columns "Date and time", "User" (by `userName`), "Row" (`entityName`), "IP"
and, for the superadmin, "Organization" (`organizationName`) sort from their headers; "Action" does not.

## Columns

-   **Date and time**, in the language of the user (`Intl.DateTimeFormat`, medium date and time).
-   **User**, "Name (email)", the name or the email alone when only one is known, or "Unknown". A failed sign-in names
    the email that was tried.
-   **Action**, the label of the entity and the label of the verb, "Templates · Create", see [Labels](#labels).
-   **Row**, the name of the row as it was. It opens the [view](#view) when the row lists `view`. An event about no
    row, such as a sign-in, leaves it empty; a row with no name copied reads "Unknown".
-   **IP**, where the request came from.
-   **Organization**, for the superadmin only, see [Organizations](#organizations).

## Search and filters

The search box sends its text as the `text` of the search, which the server matches against the name and the email of
the user, the name of the row and the IP, whatever the case and the accents. The filters panel offers:

-   **From** and **To**, the date fields of [`beyPageDateRangeFields`](../../../page/docs/page-readme.md#search):
    `from` sends the first millisecond of its day (`greaterThanOrEquals`) and `to` the last one of its day
    (`lessThanOrEquals`), both included and in the time zone of the browser.
-   **User** (`userId`, `equals`), typed: once typing settles the page asks `user-options`, which answers
    `{ options: [{ value, label }], hasMore }`, the users the caller may see, and offers them; picking one filters by
    its id. With `hasMore` the suggestions say there are more matches.
-   **Entity** (`entity`, `equals`), the entities of the app, those of `entityLabels`, then the library's own: `auth`,
    `account`, `users`, `groups`, `roles` and `organizations`.
-   **Action** (`action`, `equals`), every verb the library labels, then those of `actionLabels`.
-   **Organization** (`organizationId`, `equals`), for the superadmin only, with two organizations or more.

## Export

"Export" (`actions.export`, a global action at the right of the header, shown while `globalActions` lists `export`) asks
`GET {baseUrl}/export` with the search of the list in view, its text, its filters and its sort, through the HTTP
service of the library, so the request carries the session like any other, and saves the answer as
`audit-<yyyymmdd>.csv`, today in the time zone of the browser. The server answers exactly the rows those filters select,
with no paging; the file keeps the raw names of the entities and the verbs. A failed export opens the error modal.

## View

The name of a row, or "View" in the header once a row is selected (the standard `view` action of
[the page](../../../page/docs/page-readme.md#header-actions), with the tooltip `actions.view.tooltip`), reads the event
from `GET {baseUrl}/{id}` and opens it read-only in "Audit event" (`view.title`), closed with its only button
(`view.buttons.close`): the date and time, the user (the id on its tooltip), the action, the row (the id on its tooltip),
the organization for the superadmin, the IP, the request id and the details, one "key: value" line each, the details
only when the event has any. A value the server did not record reads "Not recorded" (`view.none`).

## Labels

The library labels its own entities under `angular-components.audit.entities.<entity>` and every verb the audit
module of express-components records under `angular-components.audit.verbs.<verb>`: those of base-entity (`create`,
`edit`, `delete`, `duplicate`, `change-status`, `move`, `restore`, `delete-trash-item`, `empty-trash`, `share`,
`unshare`, `create-category`, `edit-category`, `delete-category`, `import`), those of the sessions (`sign-in`,
`sign-in-failed`, `sign-out`, `locked`), those of the account (`register`, `accept-invitation`, `verify-email`,
`change-password`, `reset-password`) and those of the users (`invite`, `resend-invitation`, `transfer-content`). The
entities of the app are the app's: `entityLabels` gives each one its translation key, by the `name` of its entity
config on the server, and `actionLabels` does the same for a verb of the app the library does not know; a key given
there replaces the library's for that name. An entity or a verb nobody labels shows its raw name.

```ts
new BeyAuditConfig({
    entityLabels: { templates: 'myApp.audit.entities.templates', documents: 'myApp.audit.entities.documents' }
});
```

## Organizations

The page knows a superadmin by the roles of the session user (`superadmin`), as the [users page](../../users/docs/users-readme.md#organizations)
does, and nobody else sends the request. For a superadmin it reads `GET {usersUrl}/organizations` before the list
shows; a failed answer counts as none, with no error.

-   **The column.** "Organization" (`table.columns.organization`) shows for the superadmin only while the list in view
    spans two organizations or more, an event of none counting as one, and leaves the table otherwise, so it follows
    each answer. An event of a deleted organization reads "Unknown", and one of none, such as the superadmin's own
    sign-in, leaves it empty.
-   **The filter.** With two organizations or more, the filters offer "Organization" with those organizations by name.

## Texts

Every text follows [the page](../../../page/docs/page-readme.md#texts) under `prefix`: `title`, `actions.export.label`
and `.tooltip`, `actions.view.tooltip`, `table.columns.<key>`, `table.tooltips.<key>`, `table.empty`,
`search.fields.<key>`, `view.title`, `view.buttons.close`, `view.main.<field>.label` and `view.none`; the labels of
[Labels](#labels) under `angular-components.audit.entities` and `.verbs`, whatever the `prefix`. The From and To filters
read the texts of the page module. The module ships all of them in English and Spanish.
