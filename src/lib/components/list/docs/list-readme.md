# List

A vertical list that renders a template the consumer provides, once per item. The component owns spacing,
the empty state and, when a click handler is given, keyboard access; what a card looks like is entirely the
consumer's.

## Usage

```ts
const list = new BeyListConfig<Employee>({
    prefix: 'myPage.employees',
    items: this.employees(),
    getItemKey: employee => employee.id,
    onItemClick: employee => this.open(employee)
});
```

```html
<bey-list [config]="list">
    <ng-template let-employee let-index="index">
        <strong>{{ employee.name }}</strong>
    </ng-template>
</bey-list>
```

## BeyListConfig

| Field         | Required | Default          | Meaning                                                      |
| ------------- | -------- | ---------------- | ------------------------------------------------------------ |
| `items`       | yes      |                  | What to render, in order                                      |
| `prefix`      | yes      |                  | i18n prefix the default empty label is built from             |
| `gap`         | no       | `0.75rem`        | Space between cards                                           |
| `bare`        | no       | `false`          | Drop the card frame and let the template draw everything      |
| `emptyLabel`  | no       | `<prefix>.empty` | Key shown when there are no items                             |
| `getItemKey`  | no       | the index        | Identifies an item so it survives a reorder                   |
| `onItemClick` | no       |                  | Called with the item and its index; makes the cards focusable |

The component is generic over the item type, so `getItemKey` and `onItemClick` are typed.

## Keyboard

A card with `onItemClick` is a button: it takes focus and responds to Enter and Space. A key pressed inside a
control of the card is left alone, so an input inside a card still accepts spaces.

## Theming

| Variable                    | Default               |
| --------------------------- | --------------------- |
| `--bey-list-border`         | `--bey-border-subtle` |
| `--bey-list-border-hover`   | `--bey-secondary`     |
| `--bey-list-fg-muted`       | `--bey-text-muted`    |
| `--bey-list-surface`        | `--bey-bg-surface`    |
