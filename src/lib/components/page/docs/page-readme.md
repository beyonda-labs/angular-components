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

| Field               | Required | Meaning                                                                                                                      |
| ------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `prefix`            | yes      | i18n prefix every text of the page resolves from                                                                             |
| `baseUrl`           | no       | Path of the resource, resolved against the environment's `baseUrl` and `webApiPath`; without it nothing is loaded            |
| `headerConfig`      | no       | `title` and the `actions` catalogue                                                                                          |
| `tableConfig`       | no       | Columns, `loadRow`, `height`, `order`, `search`, `allowSelection`, `showPagination`, `categoriesConfig`, `onSelectionChange` |
| `formConfig`        | no       | How the create and edit modal forms are built, see below                                                                     |
| `statusConfig`      | no       | `BeyPageStatusConfig`: the status field and its transitions, for `change-status`                                             |
| `duplicationConfig` | no       | `BeyPageDuplicationConfig`: the field that names a row, `name` by default, for `duplicate`                                   |
| `onDataLoaded`      | no       | Run with the backend response after every load                                                                               |
| `onReady`           | no       | Run with the page handle once the page exists                                                                                |

The config is never written to. What the consumer needs to do to the live page goes through the
`BeyPageHandle` that `onReady` delivers: `refresh()` reloads the current page, `openCategory(category)` drills
into a category, `selected()` and `viewMode()` read the state, and `openForm(config, submit)` opens a
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

The list answers with `{ globalActions, results, search? }`: `globalActions` names the global actions the
user may see, each result may carry its own `actions`, and `search.total` feeds the paginator. The `search`
query is `{ filters, page, size, sort?, text? }`, with the filters of the search module.

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
when the message needs a request first (how many documents use a file). The request, its toast and the reload
stay the standard ones; an action with a `handler` never asks.

```ts
beyPageStandardAction<Attachment>(BeyPageStandardAction.Delete, {
    confirmation: (attachments, confirmation) =>
        this.usages
            .count(attachments)
            .pipe(
                map(usageCount =>
                    usageCount > 0
                        ? { ...confirmation, message: 'myApp.files.modal.delete-in-use.message' }
                        : confirmation
                )
            )
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
("Invoice (copy)"), and sends it in the `nameField` of `duplicationConfig`. `change-status` offers the statuses the
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

`tableConfig.search` takes the `fields` of the filters panel and a `mainField` for the text box. Every
change goes back to the first page and reloads; the whole query travels in the `search` parameter.

## Categories and trash

`tableConfig.categoriesConfig` turns the table into a drill-down browser, and a breadcrumb starting at
`<prefix>.categories.root` shows where the user is. `nameField`, `parentField` and `typeField` name the
fields the page reads. A row whose `typeField` says `category` is drawn by
`categoriesConfig.loadRow(category, viewMode)` instead of the table's `loadRow`; without one it shows its name
as a link that opens it, as plain text in the trash. A custom cell opens a category through
`handle.openCategory(category)`. With `useTrash` a segmented toggle switches to the flat trash view, where the
`restore-trash-item` and `delete-trash-item` actions apply, and `empty-trash`, shown while the backend lists it in
the `globalActions` of the trash, deletes everything in it with `DELETE {baseUrl}/trash/all`. `move` opens the tree
picker with every category, disabling the selected ones and their descendants.

On a page with categories an action `handler` receives only the selected rows that are not categories, since
categories are handled by the standard category actions, and an action with a `handler` is hidden while every
selected row is a category. Standard actions without a `handler` work on the whole selection.

## Forms

`BeyPageFormConfig<TValue, TItem>` takes `prefix`, `buildSections(item?)`, and optionally `toFormValue(item?)`,
`toItem(value)`, `onReady(handle)`, `onValueChange(value, handle)`, `onCreate(value, handle)`,
`onEdit(value, handle)`, `afterCreate(created)` and `allowSubmitWithoutChanges`. `onValueChange` runs on every
change of the open form, so a field can fill another through `handle.patchValue`. Create and edit open a modal form from the form
module; on success the modal closes and the table reloads, on error it stays open. `afterCreate` returns an
observable the page waits for before closing, for entities that need a second request. Titles come from
`<prefix>.form.create.title` and `.edit.title`, the buttons from the library.

## Texts

| Key                                                                                                         | Shown as                                               |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `<prefix>.title`                                                                                            | Page title                                             |
| `<prefix>.actions.<key>.label` / `.tooltip`                                                                 | Header actions                                         |
| `<prefix>.table.columns.<key>` / `.tooltips.<key>` / `.empty`                                               | Table                                                  |
| `<prefix>.search.fields.<key>`                                                                              | Filters                                                |
| `<prefix>.modal.<key>.title` / `.message`                                                                   | Confirmation of a destructive action, with `{{count}}` |
| `<prefix>.duplicate.*`, `<prefix>.change-status.*`, `<prefix>.status.<status>`                              | The forms of `duplicate` and `change-status`           |
| `<prefix>.toast.<key>-success`                                                                              | Success toast of every standard action                 |
| `<prefix>.categories.root`, `<prefix>.tabs.table.label`, `<prefix>.tabs.trash.label`, `<prefix>.move.title` | Categories and trash                                   |

Every `<key>` is the action, column or field key as a kebab-case segment: a column `createdAt` reads
`<prefix>.table.columns.created-at`. The standard action keys are already kebab-case, so `create-category`
reads `<prefix>.actions.create-category.label` and `<prefix>.toast.create-category-success`.
