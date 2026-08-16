# Properties menu

Config-driven panel of tabs, groups and fields. A group renders one of four kinds of content: fields, a list of
cards, nested tabs or a tree.

## Tree drag and drop

A tree node can be dragged to reorder it among its siblings or to reparent it. The library reports the move
through the `treeDrop` output and applies nothing by itself: the host owns the model and decides what the drop
means.

### The library holds no nesting rules

It knows nothing about what the nodes represent, so every rule about what may go where travels in the config.
Only two restrictions are built in — a node cannot be dropped onto itself, nor onto one of its own descendants —
because both are impossible in any tree, whatever it holds.

| Field | Where | Meaning |
| --- | --- | --- |
| `draggable` | node | this node can be picked up |
| `acceptsDrop` | node | this node admits **what is being dragged right now** inside it |
| `dropDisabled` | node | this node takes no part in the drop: it neither admits anything inside nor works as a before/after reference |
| `acceptsRootDrop` | tree config | the root admits **what is being dragged right now** |

`acceptsDrop` means "accepts *this*", not "accepts children". That is what lets one config express different
rules depending on what is being dragged, without the library knowing why.

### The refresh cycle

1. The drag starts and the tree emits `treeDragStart` with the node.
2. The host walks its tree once, sets `acceptsDrop` on every node and `acceptsRootDrop` on the config against
   the dragged node, and rebuilds the config.
3. While the pointer moves, the tree only reads those booleans.
4. `treeDrop` fires on a valid release; `treeDragEnd` always fires, and the host clears the flags there.

A drop position is `before`, `inside` or `after`, taken from where the pointer sits inside the row — the outer
quarters are the siblings, the middle half is the node itself. A `before`/`after` drop is validated against the
**parent** of the target row, or against `acceptsRootDrop` when the target is a root node.

An invalid target is marked in red and releasing over it does nothing.

### Limits

The gesture is bound to mouse and pen. Touch pointers are ignored, since a drag started from a plain touch
cannot be told apart from a scroll without giving up scrolling the panel by dragging its rows.
