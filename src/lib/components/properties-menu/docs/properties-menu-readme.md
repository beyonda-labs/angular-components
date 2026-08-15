# Properties Menu Component (`bey-properties-menu`)

Contextual property inspector for a visual editor's selected block. Renders a header, configurable tabs, groups and
typed fields (text, number, select, toggle, color, segmented, spacing) from a plain configuration object,
plus an optional variable picker for fields marked `acceptsVariable: true`.

Supported capabilities:

-   Fully data-driven tabs, groups and fields — nothing is hardcoded in the template.
-   A single `BeyPropertyTab` holds any number of `BeyPropertyGroup`s; each group renders one kind of content
    (`properties`, `tree` or `list`) — so a tab can freely mix a properties editor, a structure browser and a card
    catalog, and can hold several groups of the same content type (e.g. two separate list catalogs).
-   Per-group header visibility (`showHeader`): a group without a header renders no label/chevron and stays always
    expanded — for content that shouldn't be collapsible, like a document structure tree.
-   Collapsible groups (when `showHeader` is `true`) with `expanded`, `disabled`, `hidden`, `order` and a `secondary`
    variant for less prominent groups.
-   Seven built-in field types, each its own `PropertyField` subclass carrying only the properties it needs.
-   A tree-content group for navigating a block/document hierarchy — selection, collapsible nodes and an optional
    "add block" action.
-   A list-content group for a card catalog of selectable items — e.g. block types to insert — built on top of the
    existing `bey-list` component.
-   Variable insertion (`{{ path }}`) with cursor-aware insertion for text fields.
-   Imperative (`setVariables`/`getVariables`/`clearVariables`) and reactive (`[variables]` input) variable management.

---

## Quick start

```ts
import {
    BeyPropertiesMenuConfig,
    BeyPropertyFieldsContent,
    BeyPropertyGroup,
    BeyPropertyTab,
    BeyPropertyTextField
} from '@beyonda-labs/angular-components';

const config = new BeyPropertiesMenuConfig({
    prefix: 'app.properties-menu',
    subtitle: 'app.properties-menu.subtitle',
    tabs: [
        new BeyPropertyTab({
            id: 'properties',
            groups: [
                new BeyPropertyGroup({
                    id: 'content',
                    expanded: true,
                    content: new BeyPropertyFieldsContent({
                        fields: [new BeyPropertyTextField({ id: 'text', value: 'FACTURA', acceptsVariable: true })]
                    })
                })
            ]
        })
    ]
});
```

```html
<bey-properties-menu
    [config]="config"
    (fieldValueChange)="onFieldValueChange($event)"
    (variableSelected)="onVariableSelected($event)"
></bey-properties-menu>
```

```ts
@ViewChild(BeyPropertiesMenuComponent) propertiesMenu!: BeyPropertiesMenuComponent;

this.propertiesMenu.setVariables([{ id: 'customer', path: 'customer', label: 'Customer', type: 'object', children: [...] }]);
```

---

## Models

`BeyPropertiesMenuConfig` → `BeyPropertyTab[]` → `BeyPropertyGroup[]` → `BeyPropertyGroupContent` (`properties` |
`tree` | `list`), each following the class + parameters-interface pattern used across the library (required fields
first, optional fields defaulted in the constructor).

`BeyPropertyTab` is a single concrete class — there's no per-kind tab subclass. A tab is just an id/label plus an
ordered list of groups; what a group *renders* is decided by its `content`, a discriminated union:

| Content class            | Discriminant (`content.type`) | Extra field       | Use case                                  |
| -------------------------- | -------------------------------- | ------------------- | -------------------------------------------- |
| `BeyPropertyFieldsContent` | `'fields'`                       | `fields: BeyPropertyField[]` | A property editor group                   |
| `BeyPropertyTreeContent`   | `'tree'`                         | `tree: BeyPropertyTreeConfig` | A structure/hierarchy browser group      |
| `BeyPropertyListContent`   | `'list'`                         | `list: BeyPropertyListItem[]` | A selectable card catalog group          |

`PropertiesMenuService` and `PropertyGroupComponent` distinguish which kind of content a group holds by checking
`group.content.type` — rather than an `instanceof` check on the tab, since a tab no longer carries a single fixed
shape.

| Model                     | Key fields                                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| `BeyPropertiesMenuConfig`  | `title`, `subtitle`, `icon`, `tabs`, `activeTabId` (defaults to the first non-hidden tab), `embedded` |
| `BeyPropertyTab`           | `id`, `label`, `icon`, `disabled`, `hidden`, `addLabel?`, `groups: BeyPropertyGroup[]`       |
| `BeyPropertyGroup`         | `id`, `label`, `expanded`, `disabled`, `hidden`, `order`, `removable`, `variant` (`PropertyGroupVariant`), `showHeader`, `content` |
| `BeyPropertyField` (abstract) | `id`, `type`, `label`, `description`, `disabled`, `hidden`, `required`, `acceptsVariable`, `metadata`, `value`, `defaultValue` — common to every field type |
| `BeyPropertyOption`        | `value`, `label`, `icon`, `disabled`                                                         |
| `BeyPropertyVariable`      | `id`, `path`, `label`, `type`, `example`, `children` (nested)                                |
| `BeyPropertyTreeConfig`    | `nodes` (`BeyPropertyTreeNode[]`), `addBlockLabel`, `showEmptyStateAddBlock`                  |
| `BeyPropertyTreeNode`      | `id`, `label`, `icon`, `disabled`, `hidden`, `expanded`, `active`, `metadata`, `children` (nested) |
| `BeyPropertyListItem`      | `id`, `label`, `icon`, `description`, `disabled`, `hidden`, `metadata`                        |

### i18n-driven labels

`BeyPropertiesMenuConfig` requires a `prefix` (the same `prefix`-plus-default-sentinel convention used by `bey-tabs`).
Every `label` (`title`, tab/group/field/tree-node/list-item `label`) is a **translation key**, not literal text:

-   Omit `label` and it defaults to `${id}.label`, resolved at render time to `${prefix}.<segment>.${id}.label`
    (`<segment>` is `tabs`, `groups`, `fields`, `tree` or `list`) and passed through `| translate`.
-   Pass an explicit string instead and it's used as the translation key as-is (no prefixing) — handy for reusing a
    key across several items or pointing at a key outside the default scheme.
-   `title` follows the same rule against `${prefix}.title` (no id, since there's only one per config).

Secondary/optional text — `subtitle`, `field.description`, `list item.description`, `tree.addBlockLabel`,
`option.label` — has **no default sentinel** (stays `''`/`undefined`, hidden unless provided) and is simply passed
through `| translate` when present, so it's still translatable but never forces a key onto UI that doesn't need one.
If ngx-translate finds no matching key for any of these, it falls back to displaying the key text itself — so
existing consumers who keep passing literal display strings (not real keys) see no visual change.

### Embedded mode

`embedded: true` (default `false`) drops the card chrome (header, border, border-radius, max-width) so the
component fills its container flush — for cases like a fixed sidebar panel where `bey-properties-menu` already
looks like it belongs there, rather than a floating/dockable inspector. The header (title/subtitle/close button)
is hidden entirely in this mode; there's no separate flag to hide just the header, since the two are meant to be
used together.

### Field subclasses

Each concrete field type extends `PropertyField` and only adds the properties it actually needs — mirroring
`FormField`/`FormTextField` in this library:

| Subclass                     | Extra properties beyond the base                          |
| ------------------------------ | ------------------------------------------------------------ |
| `BeyPropertyTextField`         | `placeholder`, `readonly`, `multiline` (drives `type: 'text' \| 'textarea'`) |
| `BeyPropertyNumberField`       | `placeholder`, `readonly`, `min`, `max`, `step`, `unit`      |
| `BeyPropertySelectField<T>`    | `options: PropertyOption<T>[]`                                |
| `BeyPropertyToggleField`       | *(none — base is enough)*                                     |
| `BeyPropertyColorField`        | `readonly`                                                    |
| `BeyPropertySegmentedField<T>` | `options: PropertyOption<T>[]`                                |
| `BeyPropertySpacingField`      | `readonly` (`value`/`defaultValue` typed as `PropertySpacingValue`) |
| `BeyPropertyInfoField`         | `items: PropertyInfoItem[]` (read-only text, always `disabled`) |
| `BeyPropertyAttachmentField`   | `options: PropertyAttachmentOption[]`, `accept`, `maxSizeBytes`, `previewUrl` |

`BeyPropertySelectField` also accepts `searchable: true` to render a filter box above its options.

Every field accepts `span`: `'full'` (default) takes the whole row, `'half'` takes one column — two consecutive
half fields share a row.

#### Info fields

`BeyPropertyInfoField` renders plain text instead of a control, for values the user cannot change. Each entry of
`items` is `{ label, icon? }` and `label` goes through the `translate` pipe, so it may be a literal or an i18n key.

#### Attachment fields

`BeyPropertyAttachmentField` picks an existing attachment by id or uploads a new file. Its `value` is the
attachment id, never the file contents.

The component performs no I/O of its own:

-   `options` is the catalog to choose from, already filtered by the consumer to the accepted file type. Each
    option is `{ id, label, description?, previewUrl?, disabled? }`.
-   `accept` is passed to the file input and `maxSizeBytes` rejects an oversized file before any upload starts.
-   Choosing a file emits the menu's `attachmentUpload` output (`{ fieldId, file }`); storing it and adding it to
    `options` is the consumer's job.

Its upload and clear buttons reuse `.bey-property-field-variable-trigger` from `property-field-control.styles.css`,
the same class the text field's variable button uses, so every property field with side buttons keeps one size and
one shape. A field that needs its own button must extend that class rather than redefine the size and radius.

---

### Groups without a header

Set `showHeader: false` on a `BeyPropertyGroup` to render its content with no label and no collapse chevron; the
group is then always expanded (the `expanded` input is ignored, forced to `true` in the constructor) since there's
no affordance left to collapse it. Typical use: a document structure tree that should always be fully visible with
no surrounding chrome, as opposed to a properties group the user may want to collapse.

### Tree-content groups

Give a group a `BeyPropertyTreeContent` to render a hierarchical, selectable node list — e.g. a document/block
structure browser — instead of a property editor:

```ts
new BeyPropertyGroup({
    id: 'structure-tree',
    showHeader: false,
    content: new BeyPropertyTreeContent({
        tree: new BeyPropertyTreeConfig({
            addBlockLabel: 'Añadir bloque',
            nodes: [
                new BeyPropertyTreeNode({
                    id: 'page-1',
                    label: 'Página 1',
                    icon: faFile,
                    children: [new BeyPropertyTreeNode({ id: 'header', label: 'Encabezado', icon: faLayerGroup })]
                })
            ]
        })
    })
});
```

Clicking a node calls `selectTreeNode`/emits `treeNodeSelect`; clicking its chevron toggles `expanded` on that node
only (immutably, deep in the tree). `addBlockLabel` has no default — the "add block" button at the bottom of a
non-empty tree only renders when it's set, and (like `description`) is passed through `| translate` when present, so
it accepts either a translation key or a literal string with no matching key. Clicking it emits `treeAddBlock` with
the tab and group ids; building/inserting the new block is left entirely to the consumer.

**Empty-state add-block button** — when `nodes` is empty, the regular bottom-of-list button has nowhere to attach.
Set `showEmptyStateAddBlock: true` (default `false`) to render a centered call-to-action inside the group's content
area instead, using the same `addBlockLabel` and emitting the same `treeAddBlock` event. It's opt-in per group — an
empty tree renders nothing by default, since not every empty tree should offer to add items from that spot.

**Externally-driven selection** — set `active: true` on a `BeyPropertyTreeNode` to have it start out selected. This
is read once when the config is set (recursively across every tree-content group), initializing the same internal
selection state that clicking a node writes to — so a consumer that owns the "currently selected item" externally
(e.g. after inserting a new block) can rebuild the tree with the right node marked `active` and have it appear
selected without the user clicking it. Only one node should be marked `active` per config; if several are, the
first one found wins.

---

### List-content groups

Give a group a `BeyPropertyListContent` to render a card catalog — e.g. a block-type picker — on top of the
existing `bey-list` component, with a fixed card layout (icon, label, optional description) instead of `bey-list`'s
free-form `ng-template` projection, keeping the same fully data-driven convention as the other content kinds. A tab
can hold several list-content groups side by side — e.g. one group for simple blocks and another, separately
headed, group for pre-styled composite blocks:

```ts
new BeyPropertyGroup({
    id: 'simple-blocks',
    showHeader: false,
    content: new BeyPropertyListContent({
        list: [
            new BeyPropertyListItem({ id: 'block-heading', label: 'Encabezado', icon: faHeading, description: '…' }),
            new BeyPropertyListItem({ id: 'block-image', label: 'Imagen', icon: faImage, description: '…' })
        ]
    })
});
```

Clicking a card calls `selectListItem`/emits `listItemSelect` with the tab id, the group id and the selected
`BeyPropertyListItem`; disabled items (`disabled: true`) are dimmed and ignore clicks. As with tree-content groups,
building/inserting the actual block from the selected item is left entirely to the consumer.

An item may carry `iconClasses` to color its icon per item — a problems list marking errors and warnings, for
instance. The library ships `bey-text-danger`, `bey-text-warning` and `bey-text-success` for that; without it the
icon uses the list's muted color.

#### Cards with a body

An item that carries a `body` becomes an expandable card: it renders a chevron, and clicking it expands the body
instead of selecting the item. An item without a body keeps selecting, so a plain catalog or a problems list is
unaffected. `badges` render next to the label, and `removable` adds a remove action that emits `listItemRemove`
without toggling the card.

```ts
new BeyPropertyListItem({
    id: variable.id,
    label: variable.name,
    icon: faHashtag,
    removable: true,
    badges: [{ label: 'Número', cssClass: 'bey-badge-color-purple' }],
    body: [
        new BeyPropertySummaryRow({ label: 'Ámbito', badge: { label: 'Global' } }),
        new BeyPropertySummaryRow({ label: 'Valor', field: new BeyPropertyTextField({ id: 'variable.v1.value' }) })
    ]
});
```

A `BeyPropertySummaryRow` shows one of three things, in this order of precedence: a `field`, a `badge`, or a plain
`value` (an em dash when empty). **A row's `field` is a normal property field**, so its `id` still drives
`updateFieldValue`/`fieldValueChange` exactly as inside a fields-content group — the card changes how a field is
presented, never how its value travels.

This is what makes an entity worth modelling as a list item rather than as a group: the group header is then free
to mean grouping (a section, a category) and can hold several of these cards.

### Tabbed groups

Give a group a `BeyPropertyTabsContent` to split its fields across tabs, for properties that repeat the same shape
several times over — the four sides of a border, say:

```ts
new BeyPropertyGroup({
    id: 'borders',
    content: new BeyPropertyTabsContent({
        tabs: [
            new BeyPropertyGroupTab({ id: 'top', fields: [...] }),
            new BeyPropertyGroupTab({ id: 'right', fields: [...] })
        ]
    })
});
```

A tab holds fields, not groups. `activeTabId` selects the open tab and defaults to the first one; each tab's label
resolves like any other, from `<prefix>.tabs.<id>.label` unless `label` is set explicitly.

---

## Outputs

| Output              | Payload                                | Emitted when                                        |
| -------------------- | ----------------------------------------- | ---------------------------------------------------- |
| `configChange`       | `BeyPropertiesMenuConfig`                | The `[config]` input is set                          |
| `activeTabChange`    | `string`                                 | The active tab changes                                |
| `groupToggle`        | `{ tabId, groupId, expanded }`           | A group is expanded/collapsed                         |
| `fieldValueChange`   | `{ fieldId, previousValue, value }`      | Any field value changes, including variable inserts |
| `variableSelected`   | `{ fieldId, variable, expression }`      | A variable is inserted into a field               |
| `treeNodeSelect`     | `{ tabId, groupId, nodeId, node }`       | A tree node is selected                                |
| `treeAddBlock`       | `{ tabId, groupId }`                     | A tree group's "add block" action is triggered         |
| `listItemSelect`     | `{ tabId, groupId, itemId, item }`       | A list card without a body is selected                 |
| `listItemToggle`     | `{ tabId, groupId, itemId, expanded }`   | A list card with a body is expanded/collapsed          |
| `listItemRemove`     | `{ tabId, groupId, itemId }`             | A removable list card's remove action is triggered     |
| `tabAddRequested`    | `{ tabId }`                              | A tab's `addLabel` button is clicked                   |
| `groupRemove`        | `{ tabId, groupId }`                     | A removable group's remove action is triggered         |
| `attachmentUpload`   | `{ fieldId, file }`                      | A file is chosen in an attachment field               |
| `closed`             | `void`                                   | The header's close action is triggered                |

---

## Variables API

Both an imperative API and a reactive input write to the same underlying signal-based state
(`PropertyVariableService`):

-   `[variables]` input — re-syncs whenever the bound array changes.
-   `setVariables()` / `getVariables()` / `clearVariables()` — callable via `@ViewChild`.

If both are used, the last write wins — there is no separate precedence, they share one state.

---

## Extending with new field types

To add a new field type, create a new `PropertyField` subclass carrying only the properties it needs, following the
pattern of the seven built-in ones, and register its rendering in `PropertyFieldComponent`.
