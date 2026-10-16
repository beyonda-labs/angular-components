# Page

A self-managing page: a header with actions, an optional search bar, a table with pagination, and the
create, edit and delete flows against a backend that follows the contract below. It is meant to sit inside
the content area of `bey-app-layout`.

## Usage

```ts
interface User extends BeyPageItem {
    email: string;
    name: string;
}

interface UserFormValue {
    user: { email: string; name: string };
}

readonly config = new BeyPageConfig<UserFormValue, User>({
    prefix: 'myApp.users',
    baseUrl: '/users',
    headerConfig: new BeyPageHeaderConfig({
        actions: [
            beyPageStandardAction(BeyPageStandardAction.Create),
            beyPageStandardAction(BeyPageStandardAction.Edit),
            new BeyPageAction({ key: 'invite', scope: BeyPageActionScope.Single, zone: BeyPageActionZone.Menu, action: ([user]) => this.invite(user) }),
            beyPageStandardAction(BeyPageStandardAction.Delete)
        ]
    }),
    tableConfig: new BeyPageTableConfig({
        columns: [new BeyTableColumn({ key: 'name' }), new BeyTableColumn({ key: 'email' })],
        loadRow: user => [new BeyTextTableCell({ content: user.name }), new BeyTextTableCell({ content: user.email })]
    }),
    formConfig: new BeyPageFormConfig<UserFormValue, User>({
        prefix: 'myApp.users.form',
        buildSections: user => [...],
        toFormValue: user => (user ? { user: { email: user.email, name: user.name } } : undefined)
    }),
    onReady: handle => (this.page = handle)
});
```

```html
<bey-page [config]="config" />
```

## BeyPageConfig

| Field               | Required | Meaning                                                                                                                                                                                                                                                         |
| ------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prefix`            | yes      | i18n prefix every text of the page resolves from                                                                                                                                                                                                                |
| `baseUrl`           | no       | Path of the resource, resolved against the environment's `baseUrl` and `webApiPath`; without it nothing is loaded                                                                                                                                               |
| `headerConfig`      | no       | `title` and the `actions` catalogue                                                                                                                                                                                                                             |
| `tableConfig`       | no       | Columns, `loadRow`, `height` (none, see [Height](#height)), `order`, `search`, `canSelect` and `isPaginationShown` (both `true`), `categoriesConfig`, `isTrashEnabled` and `isSharedEnabled` (both `false`), `isColumnShown`, `onSelectionChange`, `storageKey` |
| `formConfig`        | no       | How the create and edit modal forms are built, see below                                                                                                                                                                                                        |
| `statusConfig`      | no       | `BeyPageStatusConfig`: the status field (`field`, `status` by default) and its `transitions`, for `change-status`                                                                                                                                               |
| `duplicationConfig` | no       | `BeyPageDuplicationConfig`: the field that names a row (`nameField`, `name` by default), the validators of the name of a copy (`nameValidators`) and what joins the copy suffix to it (`copySeparator`, a space by default), for `duplicate`                    |
| `onDataLoaded`      | no       | Run with the backend response after every load                                                                                                                                                                                                                  |
| `onReady`           | no       | Run with the page handle once the page exists                                                                                                                                                                                                                   |
| `views`             | no       | `BeyPageView`s shown as tabs after the main one, see [Views](#views)                                                                                                                                                                                            |
| `usagesConfig`      | no       | `BeyPageUsagesConfig`: warns before deleting a row other rows use, see [Usages](#usages)                                                                                                                                                                        |
| `transferConfig`    | no       | `BeyPageTransferConfig`: the `notice` of the form of `transfer`, see [Change owner](#change-owner)                                                                                                                                                              |

The config is never written to. What the consumer needs to do to the live page goes through the
`BeyPageHandle` that `onReady` delivers: `refresh()` reloads the current page, `openCategory(category)` drills
into a category, `openEdit(row)` opens the edit form of a row as the `edit` action does (the categories form for a
category), `selected()` and `viewMode()` read the state, `search()` the search the list in view was asked with,
as the page sends it (the filters of the [view](#views) first and the [`textField`](#search) as its `text`), and `openForm(config, submit)` opens a
`BeyModalFormConfig` for an action of the page: its submit sends `submit(value)`, and the modal closes and the page
reloads once that request answers, or stays open when it fails. The config's own `onSubmit` is replaced.

## Height

The page fills the height of its container, `height: 100%`: inside `bey-app-layout`, the content area between the
breadcrumb bar and the footer, where it should be the only content. The header, the toolbar, the breadcrumb of the
folders and the pagination take their natural height, and the table takes the rest, scrolling its rows inside under a
header that stays in place. A window too short to leave the table and its pagination `15rem` scrolls the content area
instead. In a container of no set height the page grows with its rows.

`tableConfig.height`, any CSS length, overrides it: the table keeps that height and the pagination follows it, as in
a demo or a page that shares the area with other content.

## Row types

`BeyPageConfig<TValue, TItem, TCategory, TCategoryValue>` is generic over the form value, the rows, the
category rows and the categories form value. Every callback that sees a row or a form value sees its type:
`loadRow`, `onSelectionChange`, the `action` and `confirmation` of an action, `buildSections`, `toFormValue`, `toItem`,
`afterCreate`, `confirmSave`, `onDataLoaded` and the handle, so a typed page needs no cast. `TItem` and
`TCategory` extend `BeyPageItem`, `TCategory` defaults to `TItem`, the rows default to `BeyPageItem` and both form
values to `unknown`. The rows are typed, not checked: the page trusts the backend to answer with them. A nested config
infers its types from the page, except a form config, whose value would be inferred from `toFormValue`: it takes them
explicitly, `new BeyPageFormConfig<UserFormValue, User>`. The categories form works the same way,
`new BeyPageFormConfig<FolderFormValue, Folder>`, and carries its value up through
`BeyPageCategoriesConfig<Folder, FolderFormValue>` and `BeyPageTableConfig<User, Folder, FolderFormValue>`, which
infer it from that form, to `BeyPageConfig<UserFormValue, User, Folder, FolderFormValue>`.

## Backend contract

| Operation     | Request                                                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| List          | `GET {baseUrl}?search=<base64 json>` when `tableConfig.search` is set, plain `GET` otherwise; a view may list elsewhere, see [Views](#views)  |
| Create        | `POST {baseUrl}` with the form value mapped through `toItem`, plus with categories the `parentField` of the open category, `null` at the root |
| Edit          | `PUT {baseUrl}/{id}`                                                                                                                          |
| Delete        | `DELETE {baseUrl}` with `{ ids }`                                                                                                             |
| Duplicate     | `POST {baseUrl}/{id}/duplicate` with `{ [nameField]: name }`                                                                                  |
| Status        | `POST {baseUrl}/{id}/status` with `{ [field]: status }`                                                                                       |
| Owners        | `GET {baseUrl}/owners` for the owner filter, see [Owners](#owners)                                                                            |
| Organizations | `GET {baseUrl}/organizations` for the organization column and filter, see [Organizations](#organizations)                                     |
| Shared        | `GET {baseUrl}/shared` and the shares of a folder, see [Sharing](#sharing)                                                                    |
| Change owner  | `GET {baseUrl}/transfer-targets` and `POST {baseUrl}/transfer`, see [Change owner](#change-owner)                                             |

The list answers with `{ globalActions, results, search? }`: `globalActions` names the global actions the
user may see, each result may carry its own `actions`, and `search.total` feeds the paginator and the count of the
breadcrumb, so it counts every row the list shows across its pages, categories included. With categories,
`search.categoryTotal` says how many of those `total` rows are categories, so the count tells folders from items; an
answer without it counts every row as an item. A category row may carry `isShared: true`, see [Sharing](#sharing). The
`search` query is `{ filters, page, size, sort?, text? }`, with the filters of the search module.

With `categoriesConfig` the resource also serves, under `{baseUrl}`: `/categories/{id}/path`,
`/categories/tree` (`?ownerId=` narrows it to one owner, see [Owners](#owners)), `POST /categories`,
`PUT /categories/{id}`, `DELETE /categories` with `{ ids }`, `PUT /move` with `{ items: [{ id, type }], targetId }`,
and with `usagesConfig` `/categories/usages`, see [Usages](#usages). With `tableConfig.isTrashEnabled` it serves
`GET`, `PUT` and `DELETE /trash` with `{ items }` and `DELETE /trash/all`, see
[Categories and trash](#categories-and-trash). Every call goes through `BeyHttpService`, so errors open the standard
modal and writes show their success toast. A new load of the list cancels the one still out, so a slow answer never
replaces a newer list.

## Header actions

An action has a `key`, a `scope`, a `zone` and optionally an `icon`, a `label`, a `tooltip`, a `type` (text in
`Left` and `Menu`, a secondary button in `Right` by default), an `action`, a `confirmation` and `subActions`.

| Scope    | Shown when                                                                  | `action` receives            |
| -------- | --------------------------------------------------------------------------- | ---------------------------- |
| `Global` | The backend listed its key in `globalActions`                               | `[]`                         |
| `Group`  | Any of its `subActions` is shown; the group itself is never checked         | `[]`                         |
| `Item`   | Something is selected and every selected row lists the key in its `actions` | The selected rows            |
| `Single` | Exactly one row is selected and it lists the key in its `actions`           | That row, as a one-row array |

Zones are `Left` next to the title, `Right` for the main buttons and `Menu` for the kebab. A standard key
(`create`, `edit`, `delete`, `duplicate`, `change-status`, `move`, `create-category`, `edit-category`,
`delete-category`, `restore-trash-item`, `delete-trash-item`, `empty-trash`, `share`, `transfer`) needs no `action`; `edit`, `edit-category` and `view` need exactly one row
whatever their scope, `move` rows of a single owner, see [Owners](#owners), and `share` a folder, see [Sharing](#sharing). An `action` always receives an array, so a single-row action reads `([user]) => …`; given
to a standard key it replaces the standard behaviour. The page does no permission logic of its own.

`view` is the one standard key with no behaviour of its own, since only the page knows how to show a row read-only: it
needs an `action`, which opens what the name of the row opens, so that a row whose name opens something always offers
the same from the header. It sits next to `edit`, where it shows directly rather than in the menu, and carries texts of
the page module, "View" (`angular-components.page.actions.view.label`) with a tooltip (`.tooltip`), so it needs no
key under the `prefix` of the page; a `label` or `tooltip` override replaces them. `transfer` carries texts of the
page module too, "Change owner" (`angular-components.page.actions.transfer.label`) with a tooltip, and the
`faPeopleArrows` icon, see [Change owner](#change-owner).

`delete`, `delete-category`, `delete-trash-item` and `empty-trash` ask before sending their request, with
`<prefix>.modal.<key>.title` and `.message` and a `count` parameter (none for `empty-trash`). A `confirmation(items, confirmation)` on the
action returns the confirmation to show instead, built from the rows and that default one, or an observable of it
when the message needs a request first. The request, its toast and the reload stay the standard ones; an action
with an `action` never asks. A row other rows use needs no `confirmation` of its own: the page warns about it with
its [usages](#usages), and hands that warning to the `confirmation` of the action when there is one.

```ts
beyPageStandardAction<Product>(BeyPageStandardAction.Delete, {
    confirmation: (products, confirmation) =>
        products.some(({ isFeatured }) => isFeatured)
            ? { ...confirmation, message: 'myApp.products.modal.delete-featured.message' }
            : confirmation
});
```

`beyPageStandardAction(key, overrides?)` builds a standard action already placed, and `beyPageAddAction(overrides?)`
the `add-group` button (`Group`, `Right`, primary, `faPlus`) whose entries are `create` and `create-category` as
text. Any field but the key can be overridden, such as an `action` or other `subActions` for the group; the
actions of the page are still listed in the order they should render, standard or not.

| Key                                                      | Scope    | Zone    | Type and icon                |
| -------------------------------------------------------- | -------- | ------- | ---------------------------- |
| `create`                                                 | `Global` | `Right` | primary button with `faPlus` |
| `create-category`, `empty-trash`                         | `Global` | `Right` | secondary button             |
| `edit`, `edit-category`, `view`                          | `Single` | `Left`  | text                         |
| `duplicate`, `change-status`, `share`                    | `Single` | `Menu`  | text                         |
| `restore-trash-item`                                     | `Item`   | `Left`  | text                         |
| `move`, `delete`, `delete-category`, `delete-trash-item` | `Item`   | `Menu`  | text                         |
| `transfer`                                               | `Item`   | `Menu`  | text with `faPeopleArrows`   |

## Duplicate and change status

`duplicate` asks for the name of the copy, filled in with the name of the row and `<prefix>.duplicate.copy-suffix`
("Invoice (copy)"), joined by its `copySeparator` and checked with its `nameValidators`; the form can be sent as
filled in, and the name goes in the `nameField` of `duplicationConfig`. `change-status` offers the statuses the
row's current one reaches in `statusConfig.transitions`, labelled `<prefix>.status.<status>`, and sends the one
chosen; without a `statusConfig` it does nothing. Both open a modal form with the texts under `<prefix>.duplicate`
or `<prefix>.change-status` (`title`, `buttons.cancel`, `buttons.submit`, `main.<field>.label`), show
`<prefix>.toast.duplicate-success` or `<prefix>.toast.change-status-success`, and reload the page.

```ts
statusConfig: new BeyPageStatusConfig({
    transitions: { archived: ['draft'], draft: ['published'], published: ['archived', 'draft'] }
});
```

The backend decides which rows offer them, as for any action, and refuses a status the current one cannot reach;
the transitions on the front only choose what the form offers.

## Search

`tableConfig.search` takes the `fields` of the filters panel, a `mainField` for the text box and
`isOwnerFilterEnabled` and `isOrganizationFilterEnabled`, which add the owner and the organization filters described in
[Owners](#owners) and [Organizations](#organizations). Every
change goes back to the first page and reloads; the whole query travels in the `search` parameter.

A filter on a field of the backend matches that field alone. To match several at once, as the `text` of
express-components' base-entity does over its searchable fields, `textField` names a text field whose value the page
sends as the `text` of the query instead of as a filter, whatever its operator; the search box and the panel keep it
as they do any other field, and a blank one sends nothing.

```ts
search: new BeyPageTableSearchConfig({
    fields: [
        new BeySearchField({ key: 'text', type: BeySearchFieldType.Text }),
        new BeySearchField({ key: 'status', type: BeySearchFieldType.Select, options: STATUS_OPTIONS })
    ],
    mainField: 'text',
    textField: 'text'
});
```

A date range is two `Date` fields of [the search](../../search/docs/search-readme.md#dates):
`beyPageDateRangeFields(fromKey?, toKey?)` builds them, `from` and `to` by default, headed "From" and "To"
(`angular-components.page.search.fields.from` and `.to`), the first with `GreaterThanOrEquals` and the second with
`LessThanOrEquals`, so they send `{ field: 'from', operator: 'greaterThanOrEquals', value }` with the first millisecond of
its day and `{ field: 'to', operator: 'lessThanOrEquals', value }` with the last one of its day, both included.

```ts
search: new BeyPageTableSearchConfig({
    fields: [textField, ...beyPageDateRangeFields()],
    mainField: 'text',
    textField: 'text'
});
```

## Views

`views` adds a tab per `BeyPageView` between the main tab and the trash, each one the same list with the `filters`
of the view sent before those of the user, who can still search inside it. A view keeps the folder the user is in
and the search, and goes back to the first page; its tab reads `<prefix>.tabs.<key>.label`, or its `label` when it
has one. Its key must not be `table`, `shared` nor `trash`. The page sends the `search` parameter whenever a view has
filters, with or without `tableConfig.search`, and neither the trash nor the [shared view](#sharing) applies them.

```ts
views: [
    new BeyPageView({
        key: 'blocks',
        filters: [
            new BeyStringFilter({ field: 'blockType', operator: BeySearchFilterOperator.NotEquals, value: 'template' })
        ]
    })
];
```

Filters on fields the categories do not have leave the categories alone on a backend like express-components'
base-entity, so a view inside a folder still shows its sub-folders.

A view with a `baseUrl` of its own, resolved as the page's, is a list the resource serves elsewhere, such as a review
queue: while it is open, the list, its search and its count are asked from `GET {view.baseUrl}`, with the same `search`
query and answer as the page's list and the filters of the view first. It is flat: the list goes without the
`parentField`, the breadcrumb names only the view, rows cannot be dragged, a category row does not open, and the header
leaves out `create-category`, `edit-category`, `delete-category`, `move` and `share`. Every other action still comes
from the `globalActions` and the `actions` of what the view lists, and sends its request to the page's `baseUrl`, as
anywhere else. Leaving the view gives back the page's list and the folder the user was in, and a [link](#links) opens
it with `?view=<key>`.

```ts
new BeyPageView({ baseUrl: '/templates/review-queue', filters: [], key: 'review-queue' });
```

## Coming back to a page

A page the user leaves for a route under its own URL (from `/templates` to `/templates/definition/7`) comes back as
it was left: the folder and its breadcrumb, the tab, the search and its filters, the sort picked from a header, the
page, the page size and the selection, which keeps only the rows that are still listed. Going anywhere else (`/documents`) drops what was kept,
so the next visit starts fresh, and so does a reload of the browser. Pages on the same URL are told apart by their
`prefix`. Nothing is kept for a page that is not left through the router.

## Links

A URL can name the tab and the folder the page opens with, as a notice that links to a shared folder does:
`/templates?view=shared&folder=7`.

| Query parameter | Opens                                                                              |
| --------------- | ---------------------------------------------------------------------------------- |
| `view`          | `table`, `shared`, `trash`, or the `key` of one of the page's `views`              |
| `folder`        | The id of a category, in that view, or in the main tab when the link names no view |

-   **What it opens.** The page opens the view and the folder as a fresh visit would, at its first page and with no
    search, in place of the state kept for [coming back](#coming-back-to-a-page). The folder's breadcrumb comes from
    `GET {baseUrl}/categories/{id}/path`, which in the shared view starts at the shared folder the user reaches. The
    list waits for that answer, so it is asked once, inside the folder.
-   **The URL.** The page then drops both parameters and keeps every other one, replacing the entry in the history, so
    a reload or the back button behaves as usual. A link to the page already in view is followed the same way.
-   **Old links.** A view the page does not have, such as `shared` without `isSharedEnabled`, opens the main tab, and a
    folder whose path the backend refuses, or answers ending elsewhere, opens the root of the view, with no error
    modal. The trash, a view with a `baseUrl` of its own, a page without categories and a page without `baseUrl`
    ignore `folder`.

## Sort and columns

`tableConfig.order` is the sort of the list until the user picks another. A column with `isSortable` sorts from its
header, as the [table](../../table/docs/table-readme.md#sort) describes: the page sends the column's `sortField` and
direction as the `sort` of the search and reloads from the first page, and clearing the sort goes back to `order`, or
to no sort without one. The backend decides which fields it sorts by, so only the columns whose field it sorts
should say `isSortable`; a page with a sortable column always sends the `search` parameter, even without
`tableConfig.search`.

`tableConfig.storageKey` offers the columns menu of the table, where the user hides and shows the columns that are
`isHideable`, starting from the ones `isVisible`; the choice is remembered in `localStorage` under that key, so
every page gives its own.

The list is never sorted by a column it does not show. Hiding the sorted column from the columns menu goes back to
`order` at once, and so does a list that answers without it, once `isColumnShown` (below) leaves it out for that list
or the choice of the user hides it, as when the page comes back with a sort kept on a column hidden since. The page then asks the list again in `order`. The organization column, which the page leaves out on its own
until it knows of two organizations, does not count as hidden for this.

```ts
tableConfig: new BeyPageTableConfig({
    storageKey: 'documents',
    order: { field: 'createdAt', direction: BeySearchSortDirection.Desc },
    columns: [
        new BeyTableColumn({ key: 'name', width: 4, isSortable: true, isHideable: false }),
        new BeyTableColumn({ key: 'templateName', width: 4, isSortable: true }),
        new BeyTableColumn({ key: 'createdAt', width: 2, isSortable: true, isVisible: false }),
        new BeyTableColumn({ key: 'updatedAt', width: 2, isSortable: true })
    ],
    loadRow
});
```

`tableConfig.isColumnShown(column, context)` shows a column only in some states of the page: it is asked for every
column of the table, and a column it answers `false` for leaves the table, header and cell alike, with no place in the
columns menu either. `loadRow` keeps building every cell, and the page drops the cells of the columns left out. The
`BeyPageColumnContext` says what the list in view was asked with: `category`, the
[category](#categories-and-trash) open as a `BeyPageCategoryPathEntry` `{ id, label }`, absent at the root, in the
trash and on a page without categories, and `isSearching`, whether the search the page sent holds a text or a filter,
those of a [view](#views) included and a blank text not counted. The page asks again once each list answers, so the
columns change with the rows they describe and not while the answer is on its way. Without the predicate every column
shows. It suits a column that tells apart what only some lists mix, such as the organization the
[administration](../../administration/docs/administration-readme.md#folders-per-organization) pages show only in a search
at the root, where rows of every folder meet.

```ts
tableConfig: new BeyPageTableConfig<Contract, Folder>({
    categoriesConfig,
    columns: [nameColumn, clientColumn, statusColumn],
    isColumnShown: ({ key }, { category, isSearching }) => key !== 'client' || (!category && isSearching),
    loadRow
});
```

## Owners

On a backend where every row has an owner, as base-entity of express-components does with `ownership`, each row
carries `ownerId` and `ownerName`, the display name; a row type extends `BeyPageOwnedItem` to read them. A row nobody
owns, such as one the system seeds for everyone, has both `null`.

A superadmin belongs to no organization and owns nothing: what it creates belongs to a user, the owner of the folder it
creates in, and a duplicate to the owner of the original. At the root it has nowhere to create, so base-entity leaves `create` and the category create out of the
`globalActions` it answers there, and the page offers neither; a create sent anyway is refused with
`entities.owner-required`, whose text the [http service](../../../services/http/docs/http-readme.md) ships under
`angular-components.http.error.entities`.

`beyPageOwnerColumn(overrides?)` is the column: key `ownerName`, headed "Owner"
(`angular-components.page.table.columns.owner-name` and its `.tooltips.owner-name`), sortable by `ownerId`, hideable,
with a width of `2`; `overrides` changes any of that. `beyPageOwnerCell(row)` is its cell, the display name as text,
empty for a row nobody owns. A row with an `ownerId` whose `ownerName` is `null`, an owner the server no longer
resolves, such as a deleted user, reads "Unknown" (`angular-components.user-name.unknown`, "Desconocido" in
Spanish). The columns of the page config take the column where it should show, and `loadRow` the
cell at the same place; with categories, a `categoriesConfig.loadRow` adds it too, since folders have owners as well.

```ts
tableConfig: new BeyPageTableConfig<Contract>({
    columns: [new BeyTableColumn({ key: 'name', width: 4, isSortable: true, isHideable: false }), beyPageOwnerColumn()],
    loadRow: contract => [new BeyTextTableCell({ content: contract.name }), beyPageOwnerCell(contract)],
    search: new BeyPageTableSearchConfig({ fields: [...], isOwnerFilterEnabled: true })
});
```

`isOwnerFilterEnabled` on `BeyPageTableSearchConfig` adds an "Owner" field to the filters panel, after the fields of
the page (`angular-components.page.search.fields.owner-id`). It is requested lazily: the first time the user opens
the panel, the page asks `GET {baseUrl}/owners`, which answers `{ owners: [{ id, name }] }` (`BeyPageOwner`), the
owners of the rows the user may see, and offers them by name in that order, an owner whose `name` is `null` as
"Unknown". Picking one sends `{ field: 'ownerId', operator: 'equals', value: id }`, the only operator the field
offers. With one owner or none there is nothing to choose and the field does not show, which is what a user who only
sees their own rows gets. The page asks once per visit and resource; a failed answer shows no error and leaves the
field out. A page the user comes back to with an owner filter in force asks at once, so the panel shows the filter as
it was left.

The owner filter goes with the rest of the search: in a view, in every folder and in the trash, where it narrows the
trashed rows of every owner to those of one. On base-entity it narrows the folders as well, and since a folder holds
only rows of its own owner, inside a folder it keeps all of them or none.

A row only sits in a folder of its own owner, so a move never leaves that owner's folders. `move` shows only while
every selected row has the same `ownerId`, with or without an `action`: like any action the selection cannot take, it
is hidden rather than disabled. Its tree picker asks `GET {baseUrl}/categories/tree?ownerId=<id>`, the folders of that
owner, under the root, which takes the rows of any owner. A dragged row drops only onto a folder with the `ownerId` of
every dragged row; any other folder is no drop target. A row nobody owns sends no `ownerId`, and base-entity lists no `move` on
it. Rows without an `ownerId` field move as they always have: the picker asks for the whole tree and every folder takes
the drop.

## Organizations

On a backend where rows belong to organizations, as base-entity of express-components does with `ownership`, the rows
answered to a superadmin carry `organizationId` and `organizationName`; everyone else gets them stripped. A row type
extends `BeyPageOrganizationItem` to read them, both optional, and `null` on a common row. The page shows anything
about organizations only while the rows the user may see span two organizations or more, so a manager, a normal user
or an app with a single organization never sees it.

`beyPageOrganizationColumn(overrides?)` is the column: key `organizationName`, headed "Organization"
(`angular-components.page.table.columns.organization-name` and its `.tooltips.organization-name`), hideable, not
sortable, since base-entity does not sort by it, with a width of `2`; `overrides` changes any of that.
`beyPageOrganizationCell(row)` is its cell, the name as text, empty for a common row. The columns take the column and
`loadRow` the cell at the same place, as for the owner; with categories, `categoriesConfig.loadRow` adds it too.

```ts
tableConfig: new BeyPageTableConfig<Contract>({
    columns: [nameColumn, beyPageOwnerColumn(), beyPageOrganizationColumn()],
    loadRow: contract => [nameCell(contract), beyPageOwnerCell(contract), beyPageOrganizationCell(contract)],
    search: new BeyPageTableSearchConfig({ fields: [...], isOrganizationFilterEnabled: true, isOwnerFilterEnabled: true })
});
```

The page recognises the column by its key. A page with it asks `GET {baseUrl}/organizations` as soon as it opens,
which answers `{ organizations: [{ id, name }] }` (`BeyPageOrganization`), the organizations of the rows the user
may see, common rows left out; until the answer names two or more, the page leaves the column and its cell out of
the table, and with one or none it never shows them. A failed answer shows no error and leaves them out too.

`isOrganizationFilterEnabled` on `BeyPageTableSearchConfig` adds an "Organization" field to the filters panel, after
the fields of the page and before the owner filter (`angular-components.page.search.fields.organization-id`), with the
organizations of the same answer by name. Picking one sends `{ field: 'organizationId', operator: 'equals', value: id }`,
which narrows within what the user may see. It shows only with two organizations or more. A page with the filter and
without the column asks the first time the filters panel opens, like the owner filter; a page the user comes back to
with an organization filter in force asks at once. The page asks once per visit and resource.

## Categories and trash

`tableConfig.categoriesConfig` turns the table into a drill-down browser, and a breadcrumb starting at
`<prefix>.categories.root` shows where the user is. Its last node counts what the folder holds across its pages, once
the folder has answered: "(2 folders · 4 items)", the folders being the `search.categoryTotal` of the list and the
items the rest of its `search.total`, or "(4 items)" alone when it holds no folder or the answer gives no
`categoryTotal`. `categoriesConfig.countLabels` and `itemCountLabels`, `{ one, other }`, are the keys of each part,
translated with `{{count}}` and picked by whether it is 1: a page of templates gives
`{ one: 'myApp.templates.count.one', other: 'myApp.templates.count.other' }` for "1 template" and "4 templates". They
default to `BEY_PAGE_CATEGORY_COUNT_LABELS`, `angular-components.page.count.categories.*` (folders), and
`BEY_PAGE_ITEM_COUNT_LABELS`, `angular-components.page.count.items.*` (items), both typed `BeyPageCountLabels`;
the parentheses and the separator are `angular-components.page.count.mixed` and `.items-only`. The count reads the
same in a search, a filter, the trash and the shared view.
`nameField`, `parentField`, `parentPathField` and `typeField` name the fields the page reads, `name`, `parentId`,
`parentPath` and `type` by default. A row whose `typeField` says `category` is drawn by
`categoriesConfig.loadRow(category, viewMode)` instead of the table's `loadRow`; without one it shows its name as a
link that opens it, as plain text in the trash. Every other value, or none, makes it an item. The entries the page
sends to move rows, restore them or delete them from the trash are always `{ id, type }`, with the `type` read from
`typeField`, so rows that have a `type` field of their own (the type of a variable) name another one,
`typeField: 'entryType'`, as base-entity of express-components does with the `typeField` of its categories. Without categories every entry is an `item`. A custom cell opens
a category through `handle.openCategory(category)`. With `tableConfig.isTrashEnabled`, with or without categories, a segmented toggle
switches to the flat trash view, where the
`restore-trash-item` and `delete-trash-item` actions apply, and `empty-trash`, shown while the backend lists it in
the `globalActions` of the trash, deletes everything in it with `DELETE {baseUrl}/trash/all`. When the backend answers
a restore with `renamed`, the rows that came back with a new name because another row had theirs, an info toast lists
them (`angular-components.page.toast.restored-renamed`). A trashed row that carries `parentPathField` (`parentPath`,
the names of the categories above it from the root down) shows on the tooltip of its first cell where a restore
puts it back, ending with the row itself (its `nameField`), `<prefix>.categories.root / Clients / 2026 / Offer`, in
place of the tooltip that cell had. `move` opens
the tree picker with every category, or every category of the owner of the rows when they have one, disabling the
selected ones and their descendants.

When the header lists the standard `move` action, with no `action` of its own, the rows of the table can also be
dragged onto a category row to move them there. A row can be dragged while it lists `move` in its `actions`, and
dragging a selected row drags the whole selection. A category row takes the drop, highlighted while the pointer is
over it, when every dragged row lists `move`, the category is not one of them nor inside one of them, the rows
are not in it already and, with owners, it has the owner of every dragged row. The breadcrumb takes no drop. The drop sends the same `PUT {baseUrl}/move`, shows `<prefix>.toast.move-success`, clears the
selection and reloads, as the action does. There is no drag in the trash, nor at the root of the
[shared tab](#sharing), where `move` does not show either; anywhere else `move` stays the way to do it from the
keyboard.

On a page with categories the `action` of an action receives only the selected rows that are not categories, since
categories are handled by the standard category actions, and an action with an `action` is hidden while every
selected row is a category. `share` is the other way round: its `action` receives only the folders, and hides while
none is selected. `transfer` takes both: its `action` receives every selected row, folders included. Standard actions
without an `action` work on the whole selection.

Every list of the main tab and of a view sends the `parentField` of the open category, `null` at the root, together
with the search, so what a search answers is up to the backend, and the page shows whatever rows come back. base-entity
of express-components keeps a search within the open category, so a search at the root finds the rows at the root.
A backend may answer a search at the root with the matching rows of every category instead, as the users, groups and
roles modules of express-components do for a superadmin, whose folders there are the organizations; the breadcrumb still
reads the root and counts what came back. The page has no option for it: it already lets the backend decide. A column
that only such an answer needs shows only then through [`isColumnShown`](#sort-and-columns).

The categories need not be stored ones. A backend may answer rows of its own as categories, read-only folders such as
the organizations of the [administration](../../administration/docs/administration-readme.md#folders-per-organization)
pages: rows with `actions: []`, the `typeField` set to `category`, and `/categories/{id}/path` for the breadcrumb, while
a header that lists none of the category actions offers no way to create, rename, move, share or delete them.

## Usages

A resource other rows point at (a file the documents show, a block the templates include) answers what uses each row,
as base-entity of express-components does with its `findUsages` hook: every item row carries `usageCount` and the first
users as `usedBy`, and `GET {baseUrl}/usages?ids=a,b` answers all of them. A user is a `BeyPageUser`, `{ id, name,
resource, kind? }`; a `name` of `null`, a user the server no longer resolves, reads "Unknown"
(`angular-components.user-name.unknown`) in every warning and every list of names.

`usagesConfig: new BeyPageUsagesConfig({ suffixes, listedUsers })` turns it on. Before `delete` and
`delete-trash-item`, the page asks for the usages of the selected items (the folders of a trash selection are left
out) and, when anything else uses them, warns with `<prefix>.modal.<key>-in-use.title` and `.message` instead of the
standard texts, with `count`, `usageCount` and `users`, the first `listedUsers` (10) names joined by commas. A user that
is itself selected is left out, so deleting a block with the only template that includes it warns about nothing.

With categories, the same switch warns before `delete-category`: the page asks
`GET {baseUrl}/categories/usages?ids=a,b`, which answers in the same shape the users of everything each folder holds,
its sub-folders included, each named once, and warns with `<prefix>.modal.delete-category-in-use.title` and `.message`,
with the same parameters, `count` being the number of folders. A page with `usagesConfig` and categories gives those
texts too; a confirmation of its own on `delete-category` that asked for the same is no longer needed.

`suffixes` names a kind or a resource of user by a translation key, shown after its name: `Header (block)`.

```ts
usagesConfig: new BeyPageUsagesConfig({
    suffixes: {
        'content-block': 'myApp.files.usages.block',
        'global-variables': 'myApp.files.usages.global-variable'
    }
});
```

`BeyPageUsagesService` gives a cell or a form the same names: `describeRowUsers(row, usagesConfig)` names the users
the row carries, with an ellipsis when it lists only the first ones, for the tooltip of a cell;
`listUsers(baseUrl, row, usagesConfig)` answers a signal with them and asks for all of them when the row lists only
the first ones, for a form; `find(baseUrl, ids)` answers the usages of several rows.

## Sharing

On a backend whose folders can be shared with other users and groups of the organization, as base-entity of
express-components does with `sharing`, `tableConfig.isSharedEnabled` adds a "Shared with me" tab
(`angular-components.page.shared.label`) after the views and before the trash. A shared folder shares everything in
it, so the page needs categories.

-   **The list.** At its root the tab asks `GET {baseUrl}/shared`, with the `search` like any list and no `parentId`,
    which answers in the page response shape the top-most folders shared with the user, directly or through a group.
    Opening one lists it as usual, `GET {baseUrl}?parentId=`, and what the user may do is what each row and the
    `globalActions` list, so a read share offers only what the backend leaves.
-   **The breadcrumb** starts at "Shared with me" and then at the shared folder: the path the backend answers is cut
    there, so the folders of the owner above it never show.
-   **The tab** keeps the folders of each side apart: going from the shared view to the main tab or a view, or back,
    starts at the root of that side. The tab, the folder and the search are kept when the user comes back to the
    page, as for any other tab. `loadRow` and `categoriesConfig.loadRow` receive `BeyPageViewMode.Shared`.
-   **The rows** carry their owner, so `beyPageOwnerColumn` names whose they are. Every folder of the view shows the
    shared folder icon, as below.
-   **Moves.** Inside a shared folder rows drag onto its folders as in the main tab, and `move` picks only among the
    shared folder and the folders below it that `GET {baseUrl}/categories/tree?ownerId=` answers. At the root of the
    tab the rows are the shared folders themselves, which stay where their owner keeps them: there the page offers no
    `move`, with or without an `action`, and no drag, whatever the rows list, so the picker never opens the folders of
    the owner. base-entity lists no `move` on the shared root of a grantee either.

The standard `share` action (`Single`, `Menu`) shows on a folder that lists `share` in its `actions`, which base-entity
grants to its owner, the managers of its organization and the superadmin. It asks
`GET {baseUrl}/categories/{id}/shares`, `{ shares, inherited }`, and opens a form titled after the folder:

-   **A line on what sharing means** (`angular-components.page.share.intro`): it decides where people can work, while
    what they can do there still depends on their permissions.
-   **Two lists, "Can view" and "Can edit"**, one under the other, each with an autocomplete above its rows ("Add a user
    or a group") and a remove button on every row. They open with the folder's own shares, a row named after the
    grantee, a group with "(group)". The access is the list: moving someone from view to edit is removing them from one
    and adding them to the other, since nobody is offered in a list while the other holds them.
-   **The search** asks `GET {baseUrl}/categories/{id}/share-targets?search=&limit=` for the typed text, users and
    groups together in the order the backend answers them, groups first. The limit is 20, raised by the grantees the
    list leaves out, up to 50, and the hint of more matches shows when the answer says `hasMore` or more than 20 are
    left. A group reads "Sales (3 members)", from its `memberCount`, and a user "Grace Hopper (grace@test.com)".
-   **What it inherits**: the shares of the folders above that already reach it, under the lists, as a list of who,
    with which access and from which folder. A grantee that inherits "View" is offered only in "Can edit", and one that
    inherits "Edit" in neither.

Saving, once the lists changed, sends `PUT {baseUrl}/categories/{id}/shares` with
`{ shares: [{ granteeType, granteeId, access }] }`, `read` for the rows of "Can view" and `write` for those of "Can
edit", which replace the previous shares of the folder, then shows `<prefix>.toast.share-success` and reloads. An own
share the inherited ones cover, or one of a grantee the search no longer finds, such as a deactivated user, stays as
long as its row does. A refused grantee answers `sharing.invalid-grantees`, whose text the page ships under
`angular-components.http.error.sharing`.

```ts
headerConfig: new BeyPageHeaderConfig({
    actions: [beyPageAddAction(), beyPageStandardAction(BeyPageStandardAction.Share), beyPageStandardAction(BeyPageStandardAction.Move)]
}),
tableConfig: new BeyPageTableConfig({ categoriesConfig, columns, loadRow, isSharedEnabled: true, isTrashEnabled: true })
```

`BeyPageShare`, `BeyPageInheritedShare`, `BeyPageShareTarget`, `BeyPageShareAccess` and `BeyPageShareGranteeType` type
those answers for an `action` of its own.

A folder of the user's own tree that the backend answers with `isShared: true`, because it or a folder above it has a
share, and every folder of the shared view, shows the shared folder icon in its first cell: by default
`BEY_SHARED_FOLDER_ICON`, a folder of one colour with a person cut out of its middle, named "Shared folder"
(`angular-components.page.shared.folder`) for screen readers and as its tooltip. The page sets it on the first cell
whichever draws it, `categoriesConfig.loadRow` or the page, as long as it is a `BeyTextTableCell` or a
`BeyLinkTableCell`, in place of the icon it had. A folder without `isShared` keeps its cell as it is.

`categoriesConfig.sharedIcon`, a `BeyPageCategoryIcon` `{ icon, label }`, is how an app draws its own: `icon` is any
FontAwesome `IconDefinition` and `label` a translation key. `BEY_PAGE_SHARED_CATEGORY_ICON` is the default, and
`BEY_SHARED_FOLDER_ICON` can be drawn on its own wherever an icon is accepted, such as the nodes of a tree.

```ts
import { faFolderTree } from '@fortawesome/free-solid-svg-icons';

const categoriesConfig = new BeyPageCategoriesConfig({
    formConfig: folderFormConfig,
    sharedIcon: { icon: faFolderTree, label: 'my-app.documents.shared-folder' }
});
```

## Change owner

On a backend whose rows have owners, as base-entity of express-components does with `ownership`, the standard
`transfer` action ("Change owner", `Item`, `Menu`) hands the selected rows to another user of their organization, who
becomes their owner; a folder goes with everything below it. Listing it in the header actions is all it takes: it
shows while every selected row, item or folder, lists `transfer` in its `actions`, which base-entity grants to the
managers of the organization of the row and to the superadmin, and never in the trash nor in the [shared
view](#sharing).

It opens a form titled after how many rows change owner (`angular-components.page.transfer.title.one` / `.other`, with
`{{count}}`):

-   **A notice** of what the new owner gets: by default (`angular-components.page.transfer.notice`) "The chosen person
    becomes the owner of the selected items.". `transferConfig: new BeyPageTransferConfig({ notice })` gives the
    translation key of a text of the app, for a product that says what it copies.
-   **The current owner** ("Current owner", `transfer.main.owner.label`): the `ownerName` of the selected rows,
    "Unknown" for an owner the server no longer resolves, or "Several owners" (`transfer.several-owners`) when the
    selection has more than one. Rows without `ownerId` leave the line out.
-   **The new owner** ("New owner", `transfer.main.target-user-id.label` and `.placeholder`), required: a
    typeahead (`isTypeahead` of the [form](../../form/docs/form-fields-readme.md#searching-and-picking)) that suggests
    nothing until something is typed, then asks, once typing settles,
    `GET {baseUrl}/transfer-targets?ids=<items>&categoryIds=<folders>&search=<text>&limit=20`, the selected items and folders by id, each list joined by commas and left out when empty. It answers
    `{ options: [{ value, label, description }], hasMore }` (`BeyPageTransferTargets`), the active users of the
    organization of the rows, `value` their id and `description` their email: a user reads "Grace Hopper
    (grace@test.com)", or the label alone when it is the email, and the hint of more matches shows while `hasMore`.
    Nobody matching reads `transfer.no-targets`. Only a user picked from the suggestions is a value: typing over the
    chosen one empties the field, and leaving it with text that was not picked clears the text, so the field shows
    its required error and "Change owner" stays disabled.

"Change owner" (`transfer.submit`) sends `POST {baseUrl}/transfer` with
`{ items: [{ id, type }], targetUserId }`, the `type` read from `typeField` as for a move, which answers
`{ transferred }` (`BeyPageTransferResponse`), the rows that changed owner, those inside the folders included. The page
confirms it with `angular-components.page.toast.transferred.one` / `.other` and `{{count}}`, clears the selection and
reloads; a refusal opens the error modal and leaves the form open. The [http service](../../../services/http/docs/http-readme.md)
ships the texts of the refusals of base-entity, under `angular-components.http.error.entities`: `transfer-mixed-organizations`, a selection of rows of
two organizations, and `invalid-transfer-target`, a new owner who is not an active user of their organization. A row
somebody is editing refuses with `edit-locks.held`, whose text the [edit-lock service](../../../services/edit-lock/docs/edit-lock-readme.md)
ships; the refusals a product adds, such as a row other rows still use, are the app's, under
`angular-components.http.error.<resource>`. The new owner gets the `RowsTransferred` notice of the
[notifications](../../notifications/docs/notifications-readme.md) module.

```ts
headerConfig: new BeyPageHeaderConfig({
    actions: [beyPageAddAction(), beyPageStandardAction(BeyPageStandardAction.Move), beyPageStandardAction(BeyPageStandardAction.Transfer)]
}),
transferConfig: new BeyPageTransferConfig({ notice: 'myApp.templates.transfer.notice' })
```

`BeyPageTransferTarget` types an option of the answer for an `action` of its own.

## Forms

`BeyPageFormConfig<TValue, TItem>` takes `prefix`, `buildSections(item?, category?)`, and optionally `toFormValue(item?, category?)`,
`toItem(value, item?)`, `onReady(handle)`, `onValueChange(value, handle)`, `onCreate(value, handle)`,
`onEdit(value, handle)`, `afterCreate(created)`, `confirmSave(value, item?)`, `canSubmitWithoutChanges` (`false` by
default) and `size` (a `BeyModalFormSize`, `Large` by default). `toFormValue` defaults to the row as it is and `toItem`
to the form value as it is. `toItem` builds the body of the request and receives the row an edit started from, so it
can send only what that row lets the user change. `onValueChange` runs on every
change of the open form, so a field can fill another through `handle.patchValue`. Create and edit open a modal form from the form
module; on success the modal closes and the table reloads, on error it stays open, the reason shown by the error
modal of the HTTP service and nothing more reported. `afterCreate` returns an observable the page waits for before
closing, for entities that need a second request. When that one fails the row already exists, so the form stays open
and the table reloads, showing whatever the backend kept of it; sending the form again creates the row anew, which
suits a backend that drops the row whose second request it refused, as the attachments of express-components do.
Titles come from `<prefix>.form.create.title` and `.edit.title`, the buttons from the library.

`buildSections` and `toFormValue` receive, after the row, the category open in the page when the form opens: a
`BeyPageCategoryPathEntry`, `{ id, label }`, its id and its name as the breadcrumb shows it, or `undefined` at the root,
at the root of the [shared view](#sharing) and on a page without categories. Every form of the page gets it, the
create and edit forms and those of the categories, so a create form can preselect what the category stands for, as the
administration pages choose the organization of the folder they are in, while the page itself already sends its
`parentField` with the create.

```ts
toFormValue: (contract, category) => (contract ? toEditValue(contract) : { main: { clientId: category?.id ?? null } });
```

`confirmSave(value, item?)` asks before a create or an edit is sent: it answers a confirmation, or an observable of
one, and the page shows it over the form and saves only once the user confirms; `null` saves at once, and an
observable that fails saves nothing and leaves the form open. It suits a save that has consequences elsewhere, such as
renaming something other records name.

## Texts

| Key                                                                                                         | Shown as                                                                                        |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `<prefix>.title`                                                                                            | Page title                                                                                      |
| `<prefix>.actions.<key>.label` / `.tooltip`                                                                 | Header actions                                                                                  |
| `<prefix>.table.columns.<key>` / `.tooltips.<key>` / `.empty`                                               | Table                                                                                           |
| `<prefix>.search.fields.<key>`                                                                              | Filters                                                                                         |
| `<prefix>.modal.<key>.title` / `.message`                                                                   | Confirmation of a destructive action, with `{{count}}`                                          |
| `<prefix>.modal.<key>-in-use.title` / `.message`                                                            | The same for rows in use, see [Usages](#usages)                                                 |
| `<prefix>.duplicate.*`, `<prefix>.change-status.*`, `<prefix>.status.<status>`                              | The forms of `duplicate` and `change-status`                                                    |
| `<prefix>.toast.<key>-success`                                                                              | Success toast of every standard action                                                          |
| `<prefix>.categories.root`, `<prefix>.tabs.table.label`, `<prefix>.tabs.trash.label`, `<prefix>.move.title` | Categories and trash                                                                            |
| `<prefix>.tabs.<view>.label`                                                                                | The tab of a view                                                                               |
| `angular-components.page.count.mixed` / `.items-only`                                                       | The count of the breadcrumb, with `{{categories}}` and `{{items}}`                              |
| `angular-components.page.count.categories.*` / `.items.*`                                                   | Its folders and items by default, `.one` and `.other`, with `{{count}}`                         |
| `angular-components.page.table.columns.owner-name` / `.tooltips.owner-name`                                 | The owner column, see [Owners](#owners)                                                         |
| `angular-components.page.search.fields.owner-id`                                                            | The owner filter                                                                                |
| `angular-components.page.table.columns.organization-name` / `.tooltips.organization-name`                   | The organization column, see [Organizations](#organizations)                                    |
| `angular-components.page.search.fields.organization-id`                                                     | The organization filter                                                                         |
| `angular-components.page.search.fields.from` / `.to`                                                        | The date range of `beyPageDateRangeFields`, see [Search](#search)                               |
| `angular-components.page.shared.label`                                                                      | The shared tab and the root of its breadcrumb, see [Sharing](#sharing)                          |
| `angular-components.page.shared.folder`                                                                     | The name of the shared folder icon, see [Sharing](#sharing)                                     |
| `angular-components.page.share.*`                                                                           | The form of `share`: its title, intro, two lists, grantee labels and inherited access           |
| `angular-components.page.actions.view.label` / `.tooltip`                                                   | The standard `view` action, see [Header actions](#header-actions)                               |
| `angular-components.page.actions.transfer.label` / `.tooltip`                                               | The standard `transfer` action, see [Change owner](#change-owner)                               |
| `angular-components.page.transfer.*`                                                                        | The form of `transfer`: its title, notice, current owner, new owner and submit button           |
| `angular-components.page.toast.transferred.one` / `.other`                                                  | The rows a transfer changed, with `{{count}}`                                                   |
| `angular-components.page.form.cancel` / `.submit`                                                           | The buttons of the create, edit and share forms                                                 |
| `angular-components.page.toast.restored-renamed`                                                            | The rows a restore renamed, with `{{names}}`, see [Categories and trash](#categories-and-trash) |
| `angular-components.http.error.sharing.invalid-grantees` and its `http.title`                               | A share save refusing a grantee, see [Sharing](#sharing)                                        |
| `angular-components.http.error.entities.transfer-mixed-organizations` / `.invalid-transfer-target`          | A change of owner refused, with their `http.title`, see [Change owner](#change-owner)           |

Every `<key>` is the action, column or field key as a kebab-case segment: a column `createdAt` reads
`<prefix>.table.columns.created-at`. A column with a `label` or a `tooltip` of its own reads those keys instead, as the
owner column does. The standard action keys are already kebab-case, so `create-category`
reads `<prefix>.actions.create-category.label` and `<prefix>.toast.create-category-success`.
