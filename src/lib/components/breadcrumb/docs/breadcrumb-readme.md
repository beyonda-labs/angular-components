# Breadcrumb

A trail of the path to the current page, driven by a config model. The last item is the current page and is
never a link; clicking any other reports its id through `onItemClick`. Items that do not fit collapse into a
leading ellipsis whose tooltip lists what was hidden.

## Usage

```ts
const breadcrumb = new BeyBreadcrumbConfig({
    prefix: 'myPage.breadcrumb',
    items: [
        new BeyBreadcrumbItem({ id: 1, label: 'home', icon: faHome }),
        new BeyBreadcrumbItem({ id: 2, label: 'detail' })
    ],
    onItemClick: id => this.navigate(id)
});
```

```html
<bey-breadcrumb [config]="breadcrumb"></bey-breadcrumb>
```

## BeyBreadcrumbConfig

| Field          | Required | Default  | Meaning                                                     |
| -------------- | -------- | -------- | ----------------------------------------------------------- |
| `items`        | yes      |          | The trail, from the root to the current page                 |
| `prefix`       | no       | none     | i18n prefix prepended to each label                          |
| `translate`    | no       | `true`   | Whether labels are translated at all                         |
| `separator`    | no       | `/`      | Character drawn between items                                |
| `itemMaxWidth` | no       | `12rem`  | Width at which a label is truncated with an ellipsis         |
| `onItemClick`  | no       |          | Called with the id of a clicked item, never for the last one |

## BeyBreadcrumbItem

| Field              | Required | Default | Meaning                                                       |
| ------------------ | -------- | ------- | ------------------------------------------------------------- |
| `id`               | yes      |         | What `onItemClick` reports                                     |
| `label`            | yes      |         | A literal label, or a key resolved against `prefix`            |
| `icon`             | no       | none    | FontAwesome icon shown before the label                        |
| `isDisabled`       | no       | `false` | Rendered dimmed and not clickable                              |
| `isTranslationKey` | no       | `false` | Treat the label as a full key and ignore `prefix`              |

## Replacing the config

The config is read as the initial state and never written to. To change the trail, build a new
`BeyBreadcrumbConfig` and bind it; the component measures again from scratch. Mutating the instance you passed
in has no effect.

## Collapsing

Item widths are measured only while the whole trail is rendered, then cached, so a measurement is never taken
from an already-collapsed trail. A container width of zero means layout has not happened yet, and everything
stays visible rather than being guessed into the ellipsis. At least one item always remains visible, and
collapsing always eats from the start, so the current page is never hidden.

## Theming

| Variable                            | Default                |
| ----------------------------------- | ---------------------- |
| `--bey-breadcrumb-text`             | `--bey-text-muted`     |
| `--bey-breadcrumb-active`           | `--bey-text-primary`   |
| `--bey-breadcrumb-hover`            | `--bey-text-secondary` |
| `--bey-breadcrumb-separator-color`  | `--bey-border-strong`  |
| `--bey-breadcrumb-item-max-width`   | `12rem`                |
