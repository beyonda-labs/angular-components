# Tree Component (`bey-tree`)

Model-driven, arbitrary-depth tree with expand/collapse and single selection. Model-driven and
recursive, following the same approach used internally by `bey-left-menu` for its nested actions.

Supported capabilities:

-   Arbitrary nesting depth via recursive rendering.
-   Expand/collapse per node, seeded via `expandedKeys` and managed internally afterwards.
-   Single, consumer-controlled selection (`selectedKey`).
-   Optional icon per node.
-   Disabled nodes (not selectable, not toggleable).
-   i18n via `prefix`, with per-node label overrides.
-   Keyboard accessible (`Enter` / `Space` to select a focused node; the toggle is a real button).
-   Tooltip on each node label showing the full text when it's truncated.
-   Modal variant: pick a node from the full tree inside a dialog via `BeyModalTreeService` + `BeyModalTreeConfig`.

---

## Quick start

```ts
import { BeyTreeConfig, BeyTreeNode } from '@beyonda-labs/angular-components';

readonly config = new BeyTreeConfig({
    prefix: 'departments.tree',
    nodes: [
        new BeyTreeNode({
            key: 'engineering',
            children: [
                new BeyTreeNode({ key: 'frontend' }),
                new BeyTreeNode({ key: 'backend' })
            ]
        }),
        new BeyTreeNode({ key: 'sales' })
    ],
    expandedKeys: ['engineering'],
    selectedKey: this.selectedKey,
    onNodeSelect: node => (this.selectedKey = node.key)
});
```

```html
<bey-tree [config]="config"></bey-tree>
```

---

## `BeyTreeNode`

| Parameter    | Type              | Required | Default        | Description                                             |
| ------------ | ----------------- | -------- | -------------- | -------------------------------------------------------- |
| `key`        | `string`          | yes      | —              | Unique key across the **whole** tree (any depth)         |
| `children`   | `BeyTreeNode[]`   | no       | `[]`           | Nested nodes                                              |
| `data`       | `TData`           | no       | —              | Arbitrary payload carried by the node (typed via generic) |
| `icon`       | `IconDefinition`  | no       | —              | FontAwesome icon rendered before the label                |
| `isDisabled` | `boolean`         | no       | `false`        | Disables selection and expand/collapse for this node      |
| `label`      | `string`          | no       | `{key}.label`  | i18n key; see [Labels](#labels)                            |

## `BeyTreeConfig`

| Parameter      | Type                                          | Required | Default | Description                                                        |
| -------------- | ---------------------------------------------- | -------- | ------- | ------------------------------------------------------------------- |
| `nodes`        | `BeyTreeNode[]`                                | yes      | —       | Top-level nodes                                                     |
| `prefix`       | `string`                                       | yes      | —       | i18n prefix for default node labels (`{prefix}.nodes.{key}.label`)  |
| `expandedKeys` | `string[]`                                     | no       | `[]`    | Keys expanded when the tree is first rendered                       |
| `selectedKey`  | `string`                                       | no       | —       | Key of the currently selected node (controlled by the consumer)     |
| `onNodeSelect` | `(node: BeyTreeNode) => void`                  | no       | —       | Called when a (non-disabled) node row is activated                  |
| `onNodeToggle` | `(node: BeyTreeNode, expanded: boolean) => void` | no     | —       | Called after a (non-disabled) node is expanded/collapsed             |

---

## Behavior

-   **Requires globally unique `key`s** across the entire tree (not just per-branch), since
    `selectedKey` and internal expand state are tracked by key alone.
-   Expand/collapse is internal UI state seeded once from `expandedKeys` when `[config]` is first
    assigned; toggling afterwards is handled by the component and reported via `onNodeToggle`.
-   Selection is fully controlled: the component never tracks "the selected node" on its own — it
    only compares each node's `key` against `config.selectedKey`. Update `selectedKey` from
    `onNodeSelect` to reflect the new selection.
-   Clicking a node's row selects it; clicking the chevron only expands/collapses it (the two
    actions never trigger each other).
-   Disabled nodes render dimmed, are not selectable, and their toggle does nothing.

---

## Labels

With `prefix = 'departments.tree'`:

| Node                                       | Resolved key                              |
| ------------------------------------------- | ------------------------------------------ |
| `new BeyTreeNode({ key: 'engineering' })`   | `departments.tree.nodes.engineering.label` |
| `new BeyTreeNode({ key: 'x', label: 'custom.key' })` | `custom.key` (used as-is)          |

This mirrors the label-resolution convention used by `bey-header` and `bey-left-menu`: an explicit
`label` that isn't just the default `{key}.label` pattern is used verbatim, letting a node reuse a
translation key from elsewhere in the app.

---

## i18n

Library keys (already translated): `angular-components.tree.expand`, `angular-components.tree.collapse`
(the toggle button's accessible label).

Consumer keys: `{prefix}.nodes.{key}.label` for every node using the default label.

---

## Modal tree

A tree can also be opened inside a modal dialog as a target picker (e.g. "move to...") using
`BeyModalTreeService` and `BeyModalTreeConfig`. `BeyModalTreeConfig` wraps a `BeyTreeConfig`
internally, so nodes, `prefix` and `expandedKeys` work exactly as in the plain tree.

Requires `provideBeyModal()` in the application config (it uses `ngx-bootstrap` modals underneath).

```ts
import { BeyModalTreeConfig, BeyModalTreeService, BeyModalTreeSize, BeyTreeNode } from '@beyonda-labs/angular-components';

private readonly modalTreeService = inject(BeyModalTreeService);

openMoveDialog(): void {
    this.modalTreeService.open(
        new BeyModalTreeConfig({
            prefix: 'products.move',
            size: BeyModalTreeSize.Small,
            nodes: [
                new BeyTreeNode({
                    key: 'electronics',
                    children: [new BeyTreeNode({ key: 'phones' }), new BeyTreeNode({ key: 'laptops' })]
                })
            ],
            onConfirm: node => {
                // node is the selected BeyTreeNode, or undefined if the dialog was dismissed empty.
                this.myService.moveTo(node?.data);
            }
        })
    );
}
```

### `BeyModalTreeConfig`

**Constructor parameters:**

| Parameter      | Type                                  | Required | Default  | Description                                                       |
| -------------- | -------------------------------------- | -------- | -------- | ------------------------------------------------------------------- |
| `nodes`        | `BeyTreeNode[]`                        | yes      | —        | Top-level nodes                                                     |
| `prefix`       | `string`                               | yes      | —        | i18n prefix for the title and node labels (`{prefix}.nodes.{key}.label`) |
| `expandedKeys` | `string[]`                             | no       | every node with children (fully expanded) | Keys expanded when the tree is first rendered |
| `selectedKey`  | `string`                               | no       | —        | Key pre-selected when the dialog opens                              |
| `onConfirm`    | `(node: BeyTreeNode \| undefined) => void` | no  | —        | Called with the selected node when Confirm is clicked                |
| `size`         | `BeyModalTreeSize`                     | no       | `Medium` | Width of the modal dialog                                            |
| `title`        | `string`                               | no       | —        | Modal title key; overrides `{prefix}.title`                          |

Unlike the plain tree, `expandedKeys` defaults to **every branch expanded** (not collapsed), since a
picker's job is to let the consumer see the whole hierarchy at once to find the target node.

**Methods:**

| Method             | Description                                                        |
| ------------------ | -------------------------------------------------------------------- |
| `close()`          | Closes the modal                                                     |
| `confirm()`        | Runs `onConfirm` with the currently selected node                    |
| `getSelectedNode()`| Returns the currently selected `BeyTreeNode`, if any                 |
| `hasSelection()`   | Returns whether a node is currently selected                         |

### `BeyModalTreeSize`

| Value                     | Bootstrap class | Width   |
| -------------------------- | --------------- | ------- |
| `BeyModalTreeSize.Small`  | `modal-sm`      | ~300px  |
| `BeyModalTreeSize.Medium` | (default)       | ~500px  |
| `BeyModalTreeSize.Large`  | `modal-lg`      | ~800px  |

### Behavior

-   `open()` returns the `BsModalRef` of the dialog.
-   The Confirm button is disabled until a node is selected.
-   Confirm runs `onConfirm` but does **not** close the modal: call `config.close()` when the
    operation succeeds, and leave it open on error — same pattern as the modal form.
-   The dialog body scrolls independently (both axes) when the tree is taller or wider than the
    modal, so deep hierarchies and long labels stay usable.
