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
            new BeyPageAction({ key: 'invite', scope: BeyPageActionScope.Single, zone: BeyPageActionZone.Menu, handler: ([user]) => this.invite(user) }),
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

| Field               | Required | Meaning                                                                                                                                                                                                                                      |
| ------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prefix`            | yes      | i18n prefix every text of the page resolves from                                                                                                                                                                                             |
| `baseUrl`           | no       | Path of the resource, resolved against the environment's `baseUrl` and `webApiPath`; without it nothing is loaded                                                                                                                            |
| `headerConfig`      | no       | `title` and the `actions` catalogue                                                                                                                                                                                                          |
| `tableConfig`       | no       | Columns, `loadRow`, `height`, `order`, `search`, `allowSelection`, `showPagination`, `categoriesConfig`, `isTrashEnabled`, `onSelectionChange`, `storageKey`                                                                                 |
| `formConfig`        | no       | How the create and edit modal forms are built, see below                                                                                                                                                                                     |
| `statusConfig`      | no       | `BeyPageStatusConfig`: the status field and its transitions, for `change-status`                                                                                                                                                             |
| `duplicationConfig` | no       | `BeyPageDuplicationConfig`: the field that names a row (`nameField`, `name` by default), the validators of the name of a copy (`nameValidators`) and what joins the copy suffix to it (`copySeparator`, a space by default), for `duplicate` |
| `onDataLoaded`      | no       | Run with the backend response after every load                                                                                                                                                                                               |
| `onReady`           | no       | Run with the page handle once the page exists                                                                                                                                                                                                |
| `views`             | no       | `BeyPageView`s shown as tabs after the main one, see [Views](#views)                                                                                                                                                                         |
| `usagesConfig`      | no       | `BeyPageUsagesConfig`: warns before deleting a row other rows use, see [Usages](#usages)                                                                                                                                                     |

The config is never written to. What the consumer needs to do to the live page goes through the
`BeyPageHandle` that `onReady` delivers: `refresh()` reloads the current page, `openCategory(category)` drills
into a category, `openEdit(row)` opens the edit form of a row as the `edit` action does (the categories form for a
category), `selected()` and `viewMode()` read the state, and `openForm(config, submit)` opens a
`BeyModalFormConfig` for an action of the page: its submit sends `submit(value)`, and the modal closes and the page
reloads once that request answers, or stays open when it fails. The config's own `onSubmit` is replaced.

## Row types

`BeyPageConfig<TValue, TItem, TCategory, TCategoryValue>` is generic over the form value, the rows, the
category rows and the categories form value. Every callback that sees a row or a form value sees its type:
`loadRow`, `onSelectionChange`, the action `handler`, `buildSections`, `toFormValue`, `toItem`, `afterCreate`,
`onDataLoaded` and the handle, so a typed page needs no cast. `TItem` and `TCategory` extend `BeyPageItem`,
`TCategory` defaults to `TItem`, the rows default to `BeyPageItem` and both form values to `unknown`. The rows
are typed, not checked: the page trusts the backend to answer with them. A nested config infers its types
from the page, except a form config, whose value would be inferred from `toFormValue`: it takes them
explicitly, `new BeyPageFormConfig<UserFormValue, User>`. The categories form works the same way,
`new BeyPageFormConfig<FolderFormValue, Folder>`, and carries its value up through
`BeyPageCategoriesConfig<Folder, FolderFormValue>` and `BeyPageTableConfig<User, Folder, FolderFormValue>`, which
infer it from that form, to `BeyPageConfig<UserFormValue, User, Folder, FolderFormValue>`.

## Backend contract

| Operation | Request                                                                                      |
| --------- | -------------------------------------------------------------------------------------------- |
| List      | `GET {baseUrl}?search=<base64 json>` when `tableConfig.search` is set, plain `GET` otherwise |
| Create    | `POST {baseUrl}` with the form value mapped through `toItem`                                 |
| Edit      | `PUT {baseUrl}/{id}`                                                                         |
| Delete    | `DELETE {baseUrl}` with `{ ids }`                                                            |
| Duplicate | `POST {baseUrl}/{id}/duplicate` with `{ [nameField]: name }`                                 |
| Status    | `POST {baseUrl}/{id}/status` with `{ [field]: status }`                                      |
| Owners    | `GET {baseUrl}/owners` for the owner filter, see [Owners](#owners)                           |

The list answers with `{ globalActions, results, search? }`: `globalActions` names the global actions the
user may see, each result may carry its own `actions`, and `search.total` feeds the paginator and the count of the
breadcrumb, so it counts every row the list shows across its pages, categories included. The `search` query is
`{ filters, page, size, sort?, text? }`, with the filters of the search module.

With `categoriesConfig` the resource also serves, under `{baseUrl}`: `/categories/{id}/path`,
`/categories/tree`, `POST` and `PUT /categories`, `DELETE /categories` with `{ ids }`, `PUT /move` with
`{ items: [{ id, type }], targetId }`, and `GET`, `PUT` and `DELETE /trash` with `{ items }`. Every call
goes through `BeyHttpService`, so errors open the standard modal and writes show their success toast. A new
load of the list cancels the one still out, so a slow answer never replaces a newer list.

## Header actions

An action has a `key`, a `scope`, a `zone` and optionally an `icon`, a `label`, a `tooltip`, a `type`, a
`handler`, a `confirmation` and `subActions`.

| Scope    | Shown when                                                                  | `handler` receives           |
| -------- | --------------------------------------------------------------------------- | ---------------------------- |
| `Global` | The backend listed its key in `globalActions`                               | `[]`                         |
| `Group`  | Any of its `subActions` is shown; the group itself is never checked         | `[]`                         |
| `Item`   | Something is selected and every selected row lists the key in its `actions` | The selected rows            |
| `Single` | Exactly one row is selected and it lists the key in its `actions`           | That row, as a one-row array |

Zones are `Left` next to the title, `Right` for the main buttons and `Menu` for the kebab. A standard key
(`create`, `edit`, `delete`, `duplicate`, `change-status`, `move`, `create-category`, `edit-category`,
`delete-category`, `restore-trash-item`, `delete-trash-item`, `empty-trash`) needs no `handler`; `edit` and `edit-category` need exactly one row
whatever their scope. A `handler` always receives an array, so a single-row action reads `([user]) => …`; given
to a standard key it replaces the standard behaviour. The page does no permission logic of its own.

`delete`, `delete-category`, `delete-trash-item` and `empty-trash` ask before sending their request, with
`<prefix>.modal.<key>.title` and `.message` and a `count` parameter (none for `empty-trash`). A `confirmation(items, confirmation)` on the
action returns the confirmation to show instead, built from the rows and that default one, or an observable of it
when the message needs a request first. The request, its toast and the reload stay the standard ones; an action
with a `handler` never asks. A row other rows use needs no `confirmation` of its own: the page warns about it with
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
text. Any field but the key can be overridden, such as a `handler` or other `subActions` for the group; the
actions of the page are still listed in the order they should render, standard or not.

| Key                                                      | Scope    | Zone    | Type and icon                |
| -------------------------------------------------------- | -------- | ------- | ---------------------------- |
| `create`                                                 | `Global` | `Right` | primary button with `faPlus` |
| `create-category`, `empty-trash`                         | `Global` | `Right` | secondary button             |
| `edit`, `edit-category`                                  | `Single` | `Left`  | text                         |
| `duplicate`, `change-status`                             | `Single` | `Menu`  | text                         |
| `restore-trash-item`                                     | `Item`   | `Left`  | text                         |
| `move`, `delete`, `delete-category`, `delete-trash-item` | `Item`   | `Menu`  | text                         |

## Duplicate and change status

`duplicate` asks for the name of the copy, filled in with the name of the row and `<prefix>.duplicate.copy-suffix`
("Invoice (copy)"), joined by its `copySeparator` and checked with its `nameValidators`, and sends it in the
`nameField` of `duplicationConfig`. `change-status` offers the statuses the
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
`isOwnerFilterEnabled`, which adds the owner filter described in [Owners](#owners). Every
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

## Views

`views` adds a tab per `BeyPageView` between the main tab and the trash, each one the same list with the `filters`
of the view sent before those of the user, who can still search inside it. A view keeps the folder the user is in
and the search, and goes back to the first page; its tab reads `<prefix>.tabs.<key>.label`, or its `label` when it
has one. Its key must not be `table` nor `trash`. The page sends the `search` parameter whenever a view has filters,
with or without `tableConfig.search`, and the trash never applies them.

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

## Coming back to a page

A page the user leaves for a route under its own URL (from `/templates` to `/templates/definition/7`) comes back as
it was left: the folder and its breadcrumb, the tab, the search and its filters, the sort picked from a header, the
page, the page size and the selection, which keeps only the rows that are still listed. Going anywhere else (`/documents`) drops what was kept,
so the next visit starts fresh, and so does a reload of the browser. Pages on the same URL are told apart by their
`prefix`. Nothing is kept for a page that is not left through the router.

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

## Owners

On a backend where every row has an owner, as base-entity of express-components does with `ownership`, each row
carries `ownerId` and `ownerName`, the display name; a row type extends `BeyPageOwnedItem` to read them. A row nobody
owns, such as one the system seeds for everyone, has both `null`.

`beyPageOwnerColumn(overrides?)` is the column: key `ownerName`, headed "Owner"
(`angular-components.page.table.columns.owner-name` and its `.tooltips.owner-name`), sortable by `ownerId`, hideable,
with a width of `2`; `overrides` changes any of that. `beyPageOwnerCell(row)` is its cell, the display name as text,
empty for a row nobody owns. The columns of the page config take the column where it should show, and `loadRow` the
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
the panel, the page asks `GET {baseUrl}/owners`, which answers `{ owners: [{ id, name }] }`, the owners of the rows the
user may see, and offers them by name in that order. Picking one sends
`{ field: 'ownerId', operator: 'equals', value: id }`, the only operator the field offers. With one owner or none
there is nothing to choose and the field does not show, which is what a user who only sees their own rows gets. The
page asks once per visit and resource; a failed answer shows no error and leaves the field out. A page the user comes
back to with an owner filter in force asks at once, so the panel shows the filter as it was left.

The owner filter goes with the rest of the search: in a view, in every folder and in the trash, where it narrows the
trashed rows of every owner to those of one. On base-entity it narrows the folders as well, and since a folder holds
only rows of its own owner, inside a folder it keeps all of them or none.

## Categories and trash

`tableConfig.categoriesConfig` turns the table into a drill-down browser, and a breadcrumb starting at
`<prefix>.categories.root` shows where the user is. Its last node counts what the folder holds, the `search.total`
of the list (`angular-components.page.count.one` or `.many`, with `{{count}}`), once the folder has answered.
`nameField`, `parentField`, `parentPathField` and `typeField` name the fields the page reads. A row whose
`typeField` says `category` is drawn by `categoriesConfig.loadRow(category, viewMode)` instead of the table's
`loadRow`; without one it shows its name as a link that opens it, as plain text in the trash. A custom cell opens
a category through `handle.openCategory(category)`. With `tableConfig.isTrashEnabled`, with or without categories, a segmented toggle
switches to the flat trash view, where the
`restore-trash-item` and `delete-trash-item` actions apply, and `empty-trash`, shown while the backend lists it in
the `globalActions` of the trash, deletes everything in it with `DELETE {baseUrl}/trash/all`. When the backend answers
a restore with `renamed`, the rows that came back with a new name because another row had theirs, an info toast lists
them (`angular-components.page.toast.restored-renamed`). A trashed row that carries `parentPathField` (`parentPath`,
the names of the categories above it from the root down) shows on the tooltip of its first cell the folder a restore
puts it back in, `<prefix>.categories.root / Clients / 2026`, in place of the tooltip that cell had. `move` opens
the tree picker with every category, disabling the selected ones and their descendants.

When the header lists the standard `move` action, with no `handler` of its own, the rows of the table can also be
dragged onto a category row to move them there. A row can be dragged while it lists `move` in its `actions`, and
dragging a selected row drags the whole selection. A category row takes the drop, highlighted while the pointer is
over it, when every dragged row lists `move`, the category is not one of them nor inside one of them, and the rows
are not in it already. The drop sends the same `PUT {baseUrl}/move`, shows `<prefix>.toast.move-success`, clears the
selection and reloads, as the action does. There is no drag in the trash, and `move` stays the way to do it from the
keyboard.

On a page with categories an action `handler` receives only the selected rows that are not categories, since
categories are handled by the standard category actions, and an action with a `handler` is hidden while every
selected row is a category. Standard actions without a `handler` work on the whole selection.

## Usages

A resource other rows point at (a file the documents show, a block the templates include) answers what uses each row,
as base-entity of express-components does with its `findUsages` hook: every item row carries `usageCount` and the first
users as `usedBy`, and `GET {baseUrl}/usages?ids=a,b` answers all of them. A user is a `BeyPageUser`, `{ id, name,
resource, kind? }`.

`usagesConfig: new BeyPageUsagesConfig({ suffixes, listedUsers })` turns it on. Before `delete` and
`delete-trash-item`, the page asks for the usages of the selected items (never of a folder) and, when anything else
uses them, warns with `<prefix>.modal.<key>-in-use.title` and `.message` instead of the standard texts, with `count`,
`usageCount` and `users`, the first `listedUsers` (10) names joined by commas. A user that is itself selected is left
out, so deleting a block with the only template that includes it warns about nothing.

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

## Forms

`BeyPageFormConfig<TValue, TItem>` takes `prefix`, `buildSections(item?)`, and optionally `toFormValue(item?)`,
`toItem(value)`, `onReady(handle)`, `onValueChange(value, handle)`, `onCreate(value, handle)`,
`onEdit(value, handle)`, `afterCreate(created)`, `confirmSave(value, item?)`, `allowSubmitWithoutChanges` and `size`
(a `BeyModalFormSize`, `Large` by default). `onValueChange` runs on every
change of the open form, so a field can fill another through `handle.patchValue`. Create and edit open a modal form from the form
module; on success the modal closes and the table reloads, on error it stays open. `afterCreate` returns an
observable the page waits for before closing, for entities that need a second request. Titles come from
`<prefix>.form.create.title` and `.edit.title`, the buttons from the library.

`confirmSave(value, item?)` asks before a create or an edit is sent: it answers a confirmation, or an observable of
one, and the page shows it over the form and saves only once the user confirms; `null` saves at once. It suits a save
that has consequences elsewhere, such as renaming something other records name.

## Texts

| Key                                                                                                         | Shown as                                               |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `<prefix>.title`                                                                                            | Page title                                             |
| `<prefix>.actions.<key>.label` / `.tooltip`                                                                 | Header actions                                         |
| `<prefix>.table.columns.<key>` / `.tooltips.<key>` / `.empty`                                               | Table                                                  |
| `<prefix>.search.fields.<key>`                                                                              | Filters                                                |
| `<prefix>.modal.<key>.title` / `.message`                                                                   | Confirmation of a destructive action, with `{{count}}` |
| `<prefix>.modal.<key>-in-use.title` / `.message`                                                            | The same for rows in use, see [Usages](#usages)        |
| `<prefix>.duplicate.*`, `<prefix>.change-status.*`, `<prefix>.status.<status>`                              | The forms of `duplicate` and `change-status`           |
| `<prefix>.toast.<key>-success`                                                                              | Success toast of every standard action                 |
| `<prefix>.categories.root`, `<prefix>.tabs.table.label`, `<prefix>.tabs.trash.label`, `<prefix>.move.title` | Categories and trash                                   |
| `<prefix>.tabs.<view>.label`                                                                                | The tab of a view                                      |
| `angular-components.page.count.one` / `.many`                                                               | The count of the breadcrumb, with `{{count}}`          |
| `angular-components.page.table.columns.owner-name` / `.tooltips.owner-name`                                 | The owner column, see [Owners](#owners)                |
| `angular-components.page.search.fields.owner-id`                                                            | The owner filter                                       |

Every `<key>` is the action, column or field key as a kebab-case segment: a column `createdAt` reads
`<prefix>.table.columns.created-at`. A column with a `label` or a `tooltip` of its own reads those keys instead, as the
owner column does. The standard action keys are already kebab-case, so `create-category`
reads `<prefix>.actions.create-category.label` and `<prefix>.toast.create-category-success`.
