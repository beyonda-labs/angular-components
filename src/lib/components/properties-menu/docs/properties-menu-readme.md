# Properties menu

The property inspector of a visual editor: a header, tabs, collapsible groups and typed fields, all built from
one config. A group renders one of four contents: fields, a card list, nested tabs of fields, or a tree. The
menu owns what happens inside it (expanding, picking, typing) and reports every change through the config
callbacks; the consumer owns the model and rebuilds the config when it changes.

## Usage

```ts
readonly config = new BeyPropertiesMenuConfig({
    prefix: 'myApp.inspector',
    subtitle: 'myApp.inspector.block.heading',
    tabs: [
        new BeyPropertyTab({
            id: 'properties',
            groups: [
                new BeyPropertyGroup({
                    id: 'content',
                    expanded: true,
                    content: new BeyPropertyFieldsContent({
                        fields: [new BeyPropertyTextField({ id: 'text', acceptsVariable: true, value: 'INVOICE' })]
                    })
                })
            ]
        })
    ],
    onFieldValueChange: ({ fieldId, value }) => this.store.update(fieldId, value),
    onClose: () => this.panel.close()
});
```

```html
<bey-properties-menu [config]="config" [variables]="variables()" />
```

## BeyPropertiesMenuConfig

| Field         | Required | Meaning                                                                                                               |
| ------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `prefix`      | yes      | i18n prefix the default labels resolve from                                                                           |
| `tabs`        | no       | `BeyPropertyTab[]`, each with `label`, `labelParameters` and its `groups`; a tab may carry `addLabel`                 |
| `activeTabId` | no       | Open tab, defaults to the first visible one; opening a tab scrolls the body back to the top; see Replacing the config |
| `title`       | no       | Header title key, defaults to `<prefix>.title`                                                                        |
| `subtitle`    | no       | Header subtitle key                                                                                                   |
| `icon`        | no       | Header icon                                                                                                           |
| `embedded`    | no       | Drops the header and the card chrome, for a panel that already sits in a sidebar                                      |
| `on…`         | no       | The callbacks below                                                                                                   |

`[variables]` is the catalogue of `BeyPropertyVariable` the text fields offer when `acceptsVariable` is set.
The select and attachment fields carry their own `variables`, since which variable fits them is domain knowledge.

### Callbacks

| Callback                                                                       | Payload                                                          | When                                                                                                              |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `onActiveTabChange`                                                            | `tabId`                                                          | The active tab changes                                                                                            |
| `onClose`                                                                      |                                                                  | The header close button; it only shows when set                                                                   |
| `onFieldValueChange`                                                           | `{ fieldId, previousValue, value }`                              | Any field value changes, variables included                                                                       |
| `onVariableSelect`                                                             | `{ fieldId, variable, expression }`                              | A variable is inserted into a field                                                                               |
| `onFieldAction`                                                                | `{ fieldId, key, selectionStart, selectionEnd }`                 | A text field's `actionButton` with a selection                                                                    |
| `onAttachmentUpload`                                                           | `{ fieldId, file }`                                              | A file is chosen in an attachment field                                                                           |
| `onGroupToggle`, `onGroupRemove`                                               | `{ tabId, groupId, expanded? }`                                  | A group header or its remove action                                                                               |
| `onTabAdd`                                                                     | `{ tabId }`                                                      | A tab's `addLabel` button                                                                                         |
| `onListItemSelect`, `onListItemToggle`, `onListItemAction`, `onListItemRemove` | `{ tabId, groupId, itemId, item? \| expanded? \| key? }`         | A card, its chevron, one of its actions, its remove button                                                        |
| `onTreeNodeSelect`, `onTreeNodeToggle`, `onTreeAddBlock`                       | `{ tabId, groupId, nodeId?, node? \| expanded? }`                | A tree row or `Enter` / `Space` on it, its chevron or `ArrowRight` / `ArrowLeft` on the row, the add-block button |
| `onTreeDragStart`, `onTreeDrop`, `onTreeDragEnd`                               | `{ tabId, groupId, nodeId?, node? \| position?, targetNodeId? }` | The drag and drop cycle, see below                                                                                |

## Replacing the config

The menu applies what the user does at once on its own copy of the config and keeps it when a new `[config]`
arrives. What it keeps, and how each piece is matched:

| State                                      | Read from                              | Matched by                   |
| ------------------------------------------ | -------------------------------------- | ---------------------------- |
| An open or closed group                    | `expanded` of the group                | tab id and group id          |
| The open tab of a `BeyPropertyTabsContent` | `activeTabId` of the content           | tab id and group id          |
| An open or closed list card                | `expanded` of the item                 | tab id, group id and item id |
| An open or closed tree node                | `expanded` of the node                 | tab id, group id and node id |
| The open tab of the menu                   | `activeTabId` of the config            | tab id                       |
| The selected tree node                     | the first node with `active` in a tree | node id                      |

For each piece the new config wins only where its value differs from the one the previous config gave for the
same id; where both configs agree, what the user did stays. An id the previous config did not have takes the
value of the new one. So a consumer that rebuilds the config from its model with the same values keeps the
user's work without mirroring it, and one that changes a value opens, closes, switches or selects on purpose.
To send a value the previous config already held once the user has moved away from it (`activeTabId: 'add'`
again after the user left that tab), keep the value in step through the matching callback (`onActiveTabChange`,
`onGroupToggle`, `onListItemToggle`, `onTreeNodeToggle`, `onTreeNodeSelect`) so the next config differs.

What was kept gives way to the new config once it is gone: an open tab that was removed or hidden, a group tab
the content no longer lists, a selected node that is in no tree. Whenever the selected node changes, because the
config marks another node `active` or because the kept one disappeared, every ancestor of the new one opens so
it is visible, without calling `onTreeNodeToggle`; from then on those ancestors are kept like any other node.

Field values and labels are not kept: the consumer owns the model, and every new config replaces them, so a
change of `labelParameters` alone relabels its tab, group, card or node.

## Labels

Every `label` is a translation key. Left out, it defaults to `<id>.label` and resolves at render time to
`<prefix>.<segment>.<id>.label`, where the segment is `tabs`, `groups`, `fields`, `tree` or `list` and the
id is a kebab-case segment (`fontFamily` reads `<prefix>.fields.font-family.label`). Set
explicitly, it is used as the key as is. `subtitle`, `description`, `addLabel` and option labels have no
default and go through the translate pipe only when present, so a literal without a matching key shows as is.

A tab, a group, a tab of a `BeyPropertyTabsContent`, a list card and a tree node also take `labelParameters`, the
interpolation parameters of their label key. With `"page": "Page {{number}}"`, a node with
`label: 'myApp.structure.page'` and `labelParameters: { number: 2 }` reads "Page 2" and follows a language
change on its own, so the consumer never translates a label itself.

## Groups

A `BeyPropertyGroup` has `label` with `labelParameters`, `expanded`, `disabled`, `hidden`, `removable`,
`order`, a `variant` (`PRIMARY` or `SECONDARY`, muted) and `showHeader`. Without a header the group has no
chevron and is always expanded, for a structure tree that should never fold. Its `content` decides what it
renders:

| Content                    | Holds                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| `BeyPropertyFieldsContent` | `fields: BeyPropertyField[]`                                                                         |
| `BeyPropertyTabsContent`   | `tabs: BeyPropertyGroupTab[]`, each with `label`, `labelParameters` and `fields`, plus `activeTabId` |
| `BeyPropertyListContent`   | `list: BeyPropertyListItem[]`                                                                        |
| `BeyPropertyTreeContent`   | `tree: BeyPropertyTreeConfig`                                                                        |

## Fields

Each field extends `BeyPropertyField` (`id`, `label`, `description`, `value`, `defaultValue`, `disabled`,
`hidden`, `required`, `acceptsVariable`, `actionButton`, `span`, `metadata`) and adds what it needs:

| Field                          | Extra                                                                                                      |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `BeyPropertyTextField`         | `placeholder`, `readonly`, `multiline`                                                                     |
| `BeyPropertyNumberField`       | `placeholder`, `readonly`, `min`, `max`, `step`, `unit`                                                    |
| `BeyPropertyNumberArrayField`  | `entryDefaultValue`, `minLength`, `maxLength`, `min`, `max`, `step`                                        |
| `BeyPropertySelectField<T>`    | `options: BeyPropertyOption<T>[]`, `searchable`, `variables`                                               |
| `BeyPropertySegmentedField<T>` | `options: BeyPropertyOption<T>[]`                                                                          |
| `BeyPropertyToggleField`       |                                                                                                            |
| `BeyPropertyColorField`        | `readonly`                                                                                                 |
| `BeyPropertySpacingField`      | `readonly`, value is `{ top, right, bottom, left }`                                                        |
| `BeyPropertyInfoField`         | `items: { label, icon? }[]`, read-only text                                                                |
| `BeyPropertyFileField`         | `accept`, `maxSizeBytes`; value is the file as base64                                                      |
| `BeyPropertyAttachmentField`   | `options: BeyPropertyAttachmentOption[]`, `variables`, `accept`, `maxSizeBytes`; value is an attachment id |

`span: 'half'` puts two consecutive fields on one row. A text field with `acceptsVariable` inserts the picked
variable as `{{ path }}` at the cursor; with an `actionButton` it shows that button while text is selected and
reports the selection through `onFieldAction`. A `searchable` select filters its options by their translated
label as the user types, and `Enter` picks the first enabled match. A file field shows the name of a file picked
in the session; a value it was given shows as _File selected_. The attachment field filters `options` as the
user types and checks the file type and size before `onAttachmentUpload`; storing the file and adding it to
`options` is the consumer's job.

The label of a field also names its controls for assistive technology: it is tied to the input, the select, the
colour picker or the toggle, and it names the group of a number array, a segmented or a spacing field and the
option list of a searchable select or an attachment field. The controls a field adds are named after the same
label: `<label> hex value` for the text of a colour, `<label>, entry <n>` and `Remove <label>, entry <n>` for
the entries of a number array, `Choose file for <label>` for a file field.

## Lists

A `BeyPropertyListItem` renders as a card with `icon` (and `iconClasses` to colour it), `label` with
`labelParameters`, `description`, `badges` (`BeyBadgeConfig[]`), `actions` (one button per `{ key, icon, label? }`), `copyValue` (a
copy button that writes that text to the clipboard) and `removable`. A plain card reports `onListItemSelect`. A
card with a `body` of `BeyPropertySummaryRow` (`label` plus a `field`, a `badge` or a `value`) becomes
expandable instead: its header and chevron toggle it, its body never does, and a row's field is a normal field
whose value travels through `onFieldValueChange`. That field shows no label of its own: the row's `label` names
its controls.

## Trees

A `BeyPropertyTreeNode` has `label` with `labelParameters`, `icon`, `children`, `expanded`, `disabled`,
`hidden`, `active` (the selected node, see Replacing the config) and the drag flags. `addBlockLabel` shows the
add-block button under the nodes; with `showEmptyStateAddBlock` an empty tree shows it as a centred call to
action instead.

A node with `draggable` can be moved with the mouse or a pen (touch is left to scrolling): a press becomes a drag
once the pointer moves a few pixels, and the scrollable container of the tree scrolls while the pointer is near
its top or bottom edge. The library holds no nesting rules: a node never drops onto itself or its descendants,
and everything else travels in the config:

| Flag              | On          | Meaning                                                                       |
| ----------------- | ----------- | ----------------------------------------------------------------------------- |
| `acceptsDrop`     | node        | Admits what is being dragged right now inside it                              |
| `dropDisabled`    | node        | Takes no part: neither admits anything nor serves as a before/after reference |
| `acceptsRootDrop` | tree config | The root admits what is being dragged right now                               |

On `onTreeDragStart` the consumer sets those flags against the dragged node and rebuilds the config; while the
pointer moves the tree only reads them. The row under the pointer splits into `before`, `inside` and `after`
zones, a collapsed valid target opens after a pause, and an invalid one is marked in red. `onTreeDrop` fires
on a valid release; `onTreeDragEnd` always fires, so the flags can be cleared there.

## Texts

| Key                                                      | Shown as                       |
| -------------------------------------------------------- | ------------------------------ |
| `<prefix>.title`                                         | Header title                   |
| `<prefix>.tabs.<id>.label`, `<prefix>.groups.<id>.label` | Tab and group labels           |
| `<prefix>.fields.<id>.label`                             | Field labels                   |
| `<prefix>.fields.<id>.action-button.tooltip`             | Text field action button       |
| `<prefix>.tree.<id>.label`, `<prefix>.list.<id>.label`   | Tree node and list card labels |

The button texts of the fields, the list and the variable picker come from the library.
