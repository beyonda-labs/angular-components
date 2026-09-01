# Page component

`bey-page` is a macro component that assembles the existing library components (header, table, pagination, form, modals) into a standard, self-managing page. It loads data on its own, executes the standard actions (create, edit, delete) against the backend, and persists the page state across navigation.

It is meant to be rendered *inside* the content area of `bey-app-layout`, not as a replacement for it.

---

## Layout modes

The rendered layout depends on which sub-configs are present in `BeyPageConfig`:

| Configs present | Result |
|---|---|
| `headerConfig` | Header with title, actions and (optionally) the search input |
| `tableConfig` | Full-width table + pagination |
| `tableConfig` + `formConfig` | Table page whose create/edit actions open **modal forms** |
| `formConfig` only (no table) | Full-width form page |

---

## Quick usage

```typescript
readonly config = new BeyPageConfig({
    page: 'users',                  // unique page id (state persistence key)
    baseUrl: '/api/users',
    headerConfig: {
        actions: [
            new BeyPageAction({
                key: BeyPageStandardAction.Create,
                scope: BeyPageActionScope.Global,
                type: BeyHeaderActionType.PrimaryButton,
                zone: BeyPageActionZone.Right
            }),
            new BeyPageAction({
                key: BeyPageStandardAction.Edit,
                scope: BeyPageActionScope.Item,
                type: BeyHeaderActionType.SecondaryButton,
                zone: BeyPageActionZone.Left
            }),
            new BeyPageAction({
                key: BeyPageStandardAction.Delete,
                scope: BeyPageActionScope.Item,
                type: BeyHeaderActionType.Text,
                zone: BeyPageActionZone.Menu
            })
        ]
    },
    tableConfig: {
        columns: [new BeyTableColumn({ key: 'name' }), new BeyTableColumn({ key: 'email' })],
        loadRow: item => [
            new BeyTextTableCell({ content: String(item['name']) }),
            new BeyTextTableCell({ content: String(item['email']) })
        ]
    },
    formConfig: new BeyPageFormConfig({
        prefix: 'users.form',
        buildSections: item => [ ... ]   // item = undefined → create mode
    })
});
```

```html
<bey-page [config]="config"></bey-page>
```

---

## `BeyPageConfig` reference

| Attribute | Required | Purpose |
|---|---|---|
| `page` | yes | Unique page identifier. Used as the key to persist and restore the page state (see [State persistence](#state-persistence)). |
| `prefix` | no | i18n root prefix for the whole page. Defaults to `page`. |
| `baseUrl` | no* | Page-relative path (e.g. `/products`), resolved against the app's `ENVIRONMENT_CONFIG` (`baseUrl` + `webApiPath`, see `provideBeyEnvironment`) before every HTTP call (see [Backend contract](#backend-contract)). |
| `source` | no* | Local data source (`BeyPageItem[]` or a `Signal`); search and pagination run client-side. All frontend actions are visible (no backend filter). |
| `onDataLoaded` | no | Callback invoked after every successful data load, with the full backend response. |
| `headerConfig` | no | Title (`{prefix}.title` by default) and the action catalog. |
| `tableConfig` | no | Columns, row renderer (`loadRow`), selection and pagination flags. |
| `formConfig` | no | `BeyPageFormConfig`: how the create/edit modal forms are initialized (`buildSections(item?)`, `steps`, `toFormValue`/`toItem`, `onFormGroupAdded`, `onCreate`/`onEdit`, `afterCreate`). |
| `$refresh` / `refresh()` | — | External control channel: the consumer calls `config.refresh()` to force a reload (the service cannot be injected from outside the component). |

\* Provide `baseUrl` **or** `source`, never both.

---

## Backend contract

### Endpoints

Given `baseUrl` (e.g. `/api/users`), the component calls:

| Operation | Request |
|---|---|
| List / search | `GET {baseUrl}` with query parameters `page`, `size` and, when present, `text`, `filters` (JSON), `sort` (JSON) |
| Create | `POST {baseUrl}` with the form value as body |
| Edit | `PUT {baseUrl}/{id}` with the form value as body |
| Delete (bulk) | `DELETE {baseUrl}` with body `{ ids: [...] }` |

With `tableConfig.categoriesConfig` set (see [Categories & trash](#categories--trash)), these additional endpoints are used:

| Operation | Request |
|---|---|
| List / search (scoped to a category) | `GET {baseUrl}` with the query parameters above plus `{parentField}` (the current category id, or `'null'` at the root) |
| Category ancestor path | `GET {baseUrl}/categories/{id}/path` — ordered list of ancestors, used to build the breadcrumb after `openCategory()` |
| Full category tree | `GET {baseUrl}/categories/tree` — flat list of every category (any depth), used to build the **Move** picker |
| Create category | `POST {baseUrl}/categories` with the form value as body |
| Edit category | `PUT {baseUrl}/categories/{id}` with the form value as body |
| Delete categories (bulk) | `DELETE {baseUrl}/categories` with body `{ ids: [...] }` |
| Move items/categories (bulk) | `PUT {baseUrl}/move` with body `{ items: [{ id, type }], targetId }` (`targetId` is `null` for the root) |
| List trash (bulk-scoped) | `GET {baseUrl}/trash` with the same query parameters as the list endpoint |
| Restore from trash (bulk) | `PUT {baseUrl}/trash` with body `{ items: [{ id, type }] }` |
| Delete from trash (bulk) | `DELETE {baseUrl}/trash` with body `{ items: [{ id, type }] }` |

All calls go through `BeyHttpService`, so HTTP errors are shown in the standard error modal and create/edit/delete show the standard success toasts.

### List response (`BeyPageBackendResponse`)

```jsonc
{
    "globalActions": ["create", "export"],   // action keys allowed by the server
    "results": [{ "id": 1, "actions": ["edit", "delete"], ... }],
    "search": {                              // echo of the applied search
        "filters": [],
        "page": 1,
        "size": 25,
        "total": 132                         // used by the paginator
    }
}
```

- `globalActions` decides **which** global actions are visible; the frontend defines how they look and what they do. With a local `source` there is no filter and every action is shown.
- The `search` echo carries the applied query state (including `total` for the paginator); the search UI itself is enabled by `tableConfig.search` (see [Search](#search)).
- Each item may carry `actions`: the keys of the item-scoped actions available for that specific row.

### `BeyPageSearch` and filters

`BeyPageSearch` is the query state: `{ filters, page, size, sort?, text?, total? }`.

- `text` carries the free-text term typed in the header search input.
- `total` is response-side: the backend fills it in the echo.
- Filters are typed subclasses of `BeySearchFilter`, each restricted to a logical operator subset:

| Filter | Operators | `value` |
|---|---|---|
| `BeyStringFilter` | equals, notEquals, contains, notContains, startsWith, endsWith | `string` |
| `BeyNumberFilter` | equals, notEquals, greaterThan(OrEquals), lessThan(OrEquals), between | `number` or `[min, max]` (between) |
| `BeyBooleanFilter` | equals, notEquals | `boolean` |

Serialized to the backend they all produce `{ field, operator, value }`.

---

## Header actions

Actions are declared in `headerConfig.actions` and always render in the page header (never inside the table).

### Scope

| Scope | Visible when |
|---|---|
| `Global` | Always — as long as the backend included its key in `globalActions` (or the source is local) |
| `Item` | There is a selection **and** every selected item includes the action key in its `actions`. `Edit` additionally requires exactly one selected row |

The header is dynamic: without selection it shows the globals; with selection the applicable item actions appear next to them, with no visual distinction.

### Zone

| Zone | Placement |
|---|---|
| `Left` | Main actions, next to the title |
| `Right` | Standard actions (new, import…) |
| `Menu` | Kebab dropdown (⋮) at the right end, for secondary actions |

### Standard actions (`BeyPageStandardAction`)

Predefined behavior — no `handler` needed:

| Key | Flow |
|---|---|
| `create` | Opens the modal form (`buildForm()` without item) → `POST {baseUrl}` → success toast → close modal → reload |
| `edit` | Opens the modal form with the selected item → `PUT {baseUrl}/{id}` → toast → close → reload |
| `delete` | Confirmation modal → `DELETE {baseUrl}` with the selected ids → toast → clear selection → reload |
| `move` | Loads the full category tree → opens a tree-picker modal → `PUT {baseUrl}/move` with the selected items and the chosen target → toast → clear selection → reload. Requires `categoriesConfig` (see [Categories & trash](#categories--trash)) |
| `create-category` | Same as `create`, but `POST {baseUrl}/categories` with `categoriesConfig.formConfig`. Requires `categoriesConfig` |
| `edit-category` | Same as `edit`, but `PUT {baseUrl}/categories/{id}` with `categoriesConfig.formConfig`. Requires `categoriesConfig` |
| `delete-category` | Same as `delete`, but `DELETE {baseUrl}/categories`. Requires `categoriesConfig` |
| `restore-trash-item` | No confirmation → `PUT {baseUrl}/trash` with the selected items → toast → clear selection → reload. Only meaningful in the trash view |
| `delete-trash-item` | Confirmation modal → `DELETE {baseUrl}/trash` with the selected items → toast → clear selection → reload. Only meaningful in the trash view |

Custom actions provide their own `handler`; item-scoped handlers receive the selected items.

An action can also render as a dropdown instead of a direct click by providing `subActions:
BeyPageAction[]` — see the header module's readme for the rendering details. With `scope:
BeyPageActionScope.Group`, the action itself is never checked against selection/permissions;
only its `subActions` are filtered and shown.

### Permissions

The frontend performs **no permission logic**. If the user reached the page, the backend allowed it; which actions are available is decided exclusively by `globalActions` (global) and `item.actions` (per row).

---

## Search

Search is configured in `tableConfig.search` (`BeyPageTableSearchConfig`); its presence enables the search bar (rendered by `bey-search` between the header and the table) and the server-side search query parameter:

```typescript
tableConfig: new BeyPageTableConfig({
    ...,
    search: new BeyPageTableSearchConfig({
        mainField: 'name',
        fields: [
            new BeySearchField({ key: 'name', type: BeySearchFieldType.Text }),
            new BeySearchField({ key: 'price', type: BeySearchFieldType.Number }),
            new BeySearchField({ key: 'available', type: BeySearchFieldType.Boolean })
        ]
    })
})
```

- `fields` is the catalog of filterable fields shown in the Filters dropdown (text, number and boolean types with per-type operators).
- `mainField` binds the main search input to one of those fields: typing creates a regular filter on it (contains, 300 ms debounce). Without `mainField` only the Filters button shows.
- Field labels come from `{prefix}.search.fields.{key}`.
- Every filter change resets to page 1 and reloads; the filters travel inside the base64 `search` query parameter.

See the search component readme for the full behavior of the filters panel.

---

## Categories & trash

Setting `tableConfig.categoriesConfig` turns the table into a hierarchical, drill-down category
browser (folders + items, like a file explorer), and optionally adds a soft-delete trash view.

```typescript
tableConfig: new BeyPageTableConfig({
    ...,
    categoriesConfig: new BeyPageCategoriesConfig({
        nameField: 'name',       // default
        parentField: 'parentId', // default
        typeField: 'type',       // default
        useTrash: true,
        formConfig: new BeyPageFormConfig({
            prefix: 'products.categories', // separate i18n namespace from the page's own form
            buildSections: item => [ ... ]
        })
    })
})
```

| Attribute | Required | Default | Purpose |
|---|---|---|---|
| `nameField` | no | `'name'` | Field read as a category's display name (breadcrumb, move tree, `openCategory`) |
| `parentField` | no | `'parentId'` | Field sent as the current category id on list requests, and read to build the move tree's hierarchy |
| `typeField` | no | `'type'` | Field distinguishing a row as `'category'` vs a regular item (see `BeyPageItemType`) |
| `useTrash` | no | `false` | Whether to show the table/trash view toggle (`bey-tabs`, segmented variant) above the table |
| `formConfig` | no | — | `BeyPageFormConfig` for the `create-category`/`edit-category` modal form, independent from the page's own `formConfig` |

### Drill-down navigation

Rows whose `{typeField}` is `'category'` are meant to be opened by the consumer's row renderer
(e.g. a clickable name cell calling `categoriesConfig.openCategory(item)`); the page itself does not
decide when a row navigates. `openCategory()`:

1. Fetches the ancestor path (`GET {baseUrl}/categories/{id}/path`) to rebuild the breadcrumb.
2. Sets the category as the current scope: subsequent list requests send `{parentField}` = its id.
3. Clears the selection and reloads.

A breadcrumb (`bey-breadcrumb`) renders automatically above the table whenever `categoriesConfig` is
set, starting at `{prefix}.categories.root` (the root/"all categories" node) followed by the current
path; clicking an earlier crumb navigates back up (id `0` returns to the root).

### Trash view

With `useTrash: true`, a segmented `bey-tabs` toggle (table/trash) renders above the table (next to
the search bar, inside a shared toolbar row). Switching to trash:

- Lists soft-deleted rows via `GET {baseUrl}/trash` instead of the normal list endpoint (no category
  scoping — trash is flat).
- Replaces the breadcrumb with a single, non-interactive `{prefix}.tabs.trash.label` crumb.
- Enables the `restore-trash-item` and `delete-trash-item` standard actions (see [Standard actions](#standard-actions-beypagestandardaction)).

### Move

The `move` standard action (item-scoped, any mix of categories and regular items) opens a tree
picker (`bey-modal-tree-dialog`, see the tree component readme's [Modal tree](../tree/docs/tree-readme.md#modal-tree)
section) built from the **full** category tree (`GET {baseUrl}/categories/tree`), nested by
`parentField`, with a synthetic root node (`{prefix}.categories.root`) as the "move to top level"
target.

To prevent moving a category into itself or one of its own descendants, every selected category and
all of its descendants (computed client-side from the fetched tree) render as disabled nodes.
Confirming calls `PUT {baseUrl}/move` with `{ items: [{ id, type }], targetId }` (`targetId: null`
for the root), then clears the selection and reloads.

### `BeyPageItemType` / `BeyPageTrashItem`

Bulk category-aware endpoints (`move`, trash restore/delete) send each item as `{ id, type }` rather
than a bare id, so the backend can tell categories and regular items apart in the same payload:

```typescript
export enum BeyPageItemType {
    Category = 'category',
    Item = 'item'
}
```

---

## State persistence

Navigating away destroys the component (and its isolated, component-scoped `BeyPageService`). To survive round-trips to subpages:

- On destroy, a plain snapshot — `{ search, selectedIds }` — is saved in the root `BeyPageStateRegistry`, keyed by `config.page`.
- On init, if a snapshot exists it is restored **before** the first load. Data is always re-fetched (never cached), so changes made in the subpage are reflected.
- Selection is restored **by id**: after the fresh load, rows whose id still exists are re-selected; deleted rows drop out naturally.
- The registry is passive (written on destroy, read on init, no events), so pages can never interfere with each other. Call `BeyPageStateRegistry.clearAll()` on logout.

---

## Modal forms

Create/edit run in the **form module's modal form** (`BeyModalFormService` under the hood), so they get its full behavior for free: unsaved-changes confirmation on cancel/✕, no close on backdrop/Esc, and compatibility with `beyModalFormGuard` for route navigation.

The wiring is split across the page services:

- `PageActionsService` initializes and implements the header actions (standard create/edit/delete flows and custom handlers).
- `PageFormService` builds the `BeyModalFormConfig` from the page's `formConfig` (`BeyPageFormConfig`), which decides how the form is initialized: `buildSections(item?)`, `steps`, `toFormValue`/`toItem` mapping and `onFormGroupAdded`. Both `buildSections(item?)` and `toFormValue(item?)` receive `undefined` on create and the edited item on edit, so each mode can render different fields and apply a different initial value (return `undefined` for no initial value).
- `PageHttpService` performs every HTTP request (`POST`, `PUT`, `DELETE`).

Flow: submit → value mapped through `toItem` → backend request → on success the modal closes and the table reloads; on error the modal stays open with the user's input intact.

An entity whose creation takes more than one request — uploading a file after its row exists, say — declares
`afterCreate(created)` on the `formConfig`. It receives the created entity as the backend returned it, and while
the observable it returns has not completed the modal stays open and the table is not reloaded. Anything from the
submitted form it also needs (the picked `File`) should be captured in `onCreate`, which runs with the raw form
value just before the create request.

The modal title uses consumer i18n keys: `{prefix}.form.create.title` and `{prefix}.form.edit.title`. The buttons use the library keys `angular-components.page.form.cancel` / `.submit`.

---

## i18n

### Library keys (already translated)

```
angular-components.page.form.cancel / .submit
angular-components.page.search.placeholder
angular-components.form.modal.close-confirmation.title / .message
angular-components.header.menu
angular-components.modal.actions.cancel / .confirm     (move picker buttons)
```

### Consumer keys (define them in your app)

Every confirmation modal and success toast for a standard action is resolved from `{prefix}`, keyed
by the action itself — there is no shared library-wide message, so wording/pluralization is fully
up to the consumer.

```
{prefix}.title                        page title
{prefix}.actions.{key}.label/.tooltip header actions
{prefix}.table.columns.{key}          table column headers
{prefix}.table.empty                  empty table message
{prefix}.form.create.title            create modal title
{prefix}.form.edit.title              edit modal title
{prefix}.toast.create-success         create success toast
{prefix}.toast.edit-success           edit success toast
{prefix}.modal.delete.title/.message  delete confirmation (message receives {{count}})
{prefix}.toast.delete-success         delete success toast
```

With `categoriesConfig` set, the same pattern extends to categories, trash and move:

```
{prefix}.categories.root                          root breadcrumb / move-picker node label
{prefix}.tabs.table.label / .trash.label           view toggle tab labels
{prefix}.tabs.trash.label                          breadcrumb label while viewing the trash

{categoriesConfig.formConfig.prefix}.form.create.title / .edit.title
                                                    create/edit-category modal title — a separate i18n namespace
                                                    from the page's own form, taken from categoriesConfig.formConfig.prefix
{prefix}.toast.create-category-success             create-category success toast
{prefix}.toast.edit-category-success               edit-category success toast
{prefix}.modal.delete-category.title/.message       delete-category confirmation
{prefix}.toast.delete-category-success             delete-category success toast

{prefix}.move.title                                move-picker modal title
{prefix}.toast.move-success                        move success toast
```

Move-picker nodes carry the category's actual `{nameField}` value as their label (not an i18n key),
so no per-node i18n keys are needed for them.

```

{prefix}.modal.delete-trash-item.title/.message      delete-from-trash confirmation
{prefix}.toast.delete-trash-item-success           delete-from-trash success toast
{prefix}.toast.restore-trash-item-success          restore-from-trash success toast (no confirmation modal)
```
