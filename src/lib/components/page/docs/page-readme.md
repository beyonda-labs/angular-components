# Page

A self-managing page: a header with actions, an optional search bar, a table with pagination, and the
create, edit and delete flows against a backend that follows the contract below. It is meant to sit inside
the content area of `bey-app-layout`.

## Usage

```ts
readonly config = new BeyPageConfig({
    prefix: 'myApp.users',
    baseUrl: '/users',
    headerConfig: new BeyPageHeaderConfig({
        actions: [
            new BeyPageAction({ key: BeyPageStandardAction.Create, scope: BeyPageActionScope.Global, zone: BeyPageActionZone.Right }),
            new BeyPageAction({ key: BeyPageStandardAction.Edit, scope: BeyPageActionScope.Item, zone: BeyPageActionZone.Left }),
            new BeyPageAction({ key: BeyPageStandardAction.Delete, scope: BeyPageActionScope.Item, zone: BeyPageActionZone.Menu })
        ]
    }),
    tableConfig: new BeyPageTableConfig({
        columns: [new BeyTableColumn({ key: 'name' }), new BeyTableColumn({ key: 'email' })],
        loadRow: item => [new BeyTextTableCell({ content: item.name }), new BeyTextTableCell({ content: item.email })]
    }),
    formConfig: new BeyPageFormConfig({
        prefix: 'myApp.users.form',
        buildSections: item => [...]
    }),
    onReady: handle => (this.page = handle)
});
```

```html
<bey-page [config]="config" />
```

## BeyPageConfig

| Field          | Required | Meaning                                                                 |
| -------------- | -------- | ----------------------------------------------------------------------- |
| `prefix`       | yes      | i18n prefix every text of the page resolves from                         |
| `baseUrl`      | no       | Path of the resource, resolved against the environment's `baseUrl` and `webApiPath`; without it nothing is loaded |
| `headerConfig` | no       | `title` and the `actions` catalogue                                      |
| `tableConfig`  | no       | Columns, `loadRow`, `height`, `order`, `search`, `allowSelection`, `showPagination`, `categoriesConfig`, `onSelectionChange` |
| `formConfig`   | no       | How the create and edit modal forms are built, see below                 |
| `onDataLoaded` | no       | Run with the backend response after every load                           |
| `onReady`      | no       | Run with the page handle once the page exists                            |

The config is never written to. What the consumer needs to do to the live page goes through the
`BeyPageHandle` that `onReady` delivers: `refresh()` reloads the current page, `openCategory(item)` drills
into a category, `selected()` and `viewMode()` read the state.

## Backend contract

| Operation             | Request                                                                    |
| --------------------- | -------------------------------------------------------------------------- |
| List                  | `GET {baseUrl}?search=<base64 json>` when `tableConfig.search` is set, plain `GET` otherwise |
| Create                | `POST {baseUrl}` with the form value mapped through `toItem`               |
| Edit                  | `PUT {baseUrl}/{id}`                                                       |
| Delete                | `DELETE {baseUrl}` with `{ ids }`                                          |

The list answers with `{ globalActions, results, search? }`: `globalActions` names the global actions the
user may see, each result may carry its own `actions`, and `search.total` feeds the paginator. The `search`
query is `{ filters, page, size, sort?, text? }`, with the filters of the search module.

With `categoriesConfig` the resource also serves, under `{baseUrl}`: `/categories/{id}/path`,
`/categories/tree`, `POST` and `PUT /categories`, `DELETE /categories` with `{ ids }`, `PUT /move` with
`{ items: [{ id, type }], targetId }`, and `GET`, `PUT` and `DELETE /trash` with `{ items }`. Every call
goes through `BeyHttpService`, so errors open the standard modal and writes show their success toast.

## Header actions

An action has a `key`, a `scope`, a `zone` and optionally an `icon`, a `label`, a `tooltip`, a `type`, a
`handler` and `subActions`.

| Scope    | Shown when                                                                                   |
| -------- | -------------------------------------------------------------------------------------------- |
| `Global` | The backend listed its key in `globalActions`                                                 |
| `Item`   | Something is selected and every selected row lists the key in its `actions`; `edit` needs exactly one row |
| `Group`  | Any of its `subActions` is shown; the group itself is never checked                          |

Zones are `Left` next to the title, `Right` for the main buttons and `Menu` for the kebab. A standard key
(`create`, `edit`, `delete`, `move`, `create-category`, `edit-category`, `delete-category`,
`restore-trash-item`, `delete-trash-item`) needs no `handler`; a custom action gets its `handler`, which
receives the selected items when its scope is `Item`. The page does no permission logic of its own.

## Search

`tableConfig.search` takes the `fields` of the filters panel and a `mainField` for the text box. Every
change goes back to the first page and reloads; the whole query travels in the `search` parameter.

## Categories and trash

`tableConfig.categoriesConfig` turns the table into a drill-down browser: rows of type `category` are opened
by the consumer's own cell, through `handle.openCategory(item)`, and a breadcrumb starting at
`<prefix>.categories.root` shows where the user is. `nameField`, `parentField` and `typeField` name the
fields the page reads. With `useTrash` a segmented toggle switches to the flat trash view, where the
`restore-trash-item` and `delete-trash-item` actions apply. `move` opens the tree picker with every
category, disabling the selected ones and their descendants.

## Forms

`BeyPageFormConfig` takes `prefix`, `buildSections(item?)`, and optionally `toFormValue(item?)`,
`toItem(value)`, `onReady(handle)`, `onCreate(value, handle)`, `onEdit(value, handle)`,
`afterCreate(created)` and `allowSubmitWithoutChanges`. Create and edit open a modal form from the form
module; on success the modal closes and the table reloads, on error it stays open. `afterCreate` returns an
observable the page waits for before closing, for entities that need a second request. Titles come from
`<prefix>.form.create.title` and `.edit.title`, the buttons from the library.

## Texts

| Key                                       | Shown as                                   |
| ----------------------------------------- | ------------------------------------------ |
| `<prefix>.title`                          | Page title                                  |
| `<prefix>.actions.<key>.label` / `.tooltip` | Header actions                           |
| `<prefix>.table.columns.<key>` / `.tooltips.<key>` / `.empty` | Table                    |
| `<prefix>.search.fields.<key>`            | Filters                                     |
| `<prefix>.modal.<key>.title` / `.message` | Confirmation of a destructive action, with `{{count}}` |
| `<prefix>.toast.<key>-success`            | Success toast of every standard action      |
| `<prefix>.categories.root`, `<prefix>.tabs.table.label`, `<prefix>.tabs.trash.label`, `<prefix>.move.title` | Categories and trash |
