# Tree

A hierarchy of nodes, driven by a config model. The component owns which nodes are open and reports both
selection and expansion; which node is selected is the consumer's to decide.

Also ships `BeyModalTreeService`, which opens the same tree inside a dialog to pick one node.

## Usage

```ts
const tree = new BeyTreeConfig({
    prefix: 'myPage.tree',
    nodes: [new BeyTreeNode({ key: 'root', children: [new BeyTreeNode({ key: 'child' })] })],
    selectedKey: this.selected(),
    onNodeSelect: node => this.selected.set(node.key)
});
```

```html
<bey-tree [config]="tree"></bey-tree>
```

## BeyTreeConfig

| Field          | Required | Default | Meaning                                                    |
| -------------- | -------- | ------- | ---------------------------------------------------------- |
| `nodes`        | yes      |         | The roots of the hierarchy                                  |
| `prefix`       | yes      |         | i18n prefix the node labels are built from                  |
| `selectedKey`  | no       | none    | Which node is marked as selected                            |
| `expandedKeys` | no       | `[]`    | Which nodes start open                                      |
| `onNodeSelect` | no       |         | Called with the node whose row was used                     |
| `onNodeToggle` | no       |         | Called with the node and whether it is now open             |

## BeyTreeNode

| Field        | Required | Default       | Meaning                                              |
| ------------ | -------- | ------------- | ---------------------------------------------------- |
| `key`        | yes      |               | Identifies the node                                   |
| `label`      | no       | `<key>.label` | A literal label, or a key resolved against `prefix`   |
| `children`   | no       | `[]`          | Nested nodes                                          |
| `icon`       | no       | none          | FontAwesome icon shown before the label               |
| `isDisabled` | no       | `false`       | Neither selectable nor expandable                     |
| `data`       | no       | none          | Anything the consumer wants to carry; the node is generic |

A default label uses the key as a kebab-case segment: `sharedFolder` reads
`<prefix>.nodes.shared-folder.label`.

## Replacing the config

The config is read as the initial state and never written to. Selecting a node does not change
`selectedKey` on the instance you passed in: react to `onNodeSelect` and bind a new config. Which nodes are
open is owned by the component from `expandedKeys` onwards.

## Picking a node in a dialog

```ts
const dialog = this.modalTree.open(new BeyModalTreeConfig({
    prefix: 'myPage.picker',
    nodes: this.nodes(),
    onConfirm: node => this.move(node).subscribe(() => dialog.hide())
}));
```

The dialog opens with every branch expanded unless `expandedKeys` says otherwise, and its confirm button stays
disabled until a node is picked. The config is plain data: the dialog owns the selection and which branches are
open, and confirming does not close it, so close it through the `BsModalRef` that `open` returns once the work
is done. The title defaults to `<prefix>.title`.

## Theming

| Variable                   | Default                |
| -------------------------- | ---------------------- |
| `--bey-tree-fg`            | `--bey-text-primary`   |
| `--bey-tree-fg-muted`      | `--bey-text-muted`     |
| `--bey-tree-hover`         | `--bey-bg-hover`       |
| `--bey-tree-selected`      | `--bey-bg-active`      |
