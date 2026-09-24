# Loading

Three pieces that share one spinner: the spinner itself, an overlay that covers an area while it works, and a
container that shows a fullscreen overlay driven by `BeyLoadingService`.

## Usage

```html
<bey-loading [size]="'sm'"></bey-loading>

<div class="position-relative">
    <bey-loading-overlay></bey-loading-overlay>
</div>

<bey-loading-container></bey-loading-container>
```

```ts
this.loading.show();
// ...
this.loading.hide();
```

## Inputs

| Component              | Input        | Default | Meaning                                                       |
| ---------------------- | ------------ | ------- | ------------------------------------------------------------- |
| `bey-loading`          | `size`       | `md`    | `xs`, `sm`, `md`, `lg`, or any css length                      |
| `bey-loading-overlay`  | `size`       | `lg`    | Size of the spinner inside the overlay                         |
| `bey-loading-overlay`  | `fullscreen` | `false` | Cover the viewport instead of the nearest positioned ancestor  |

`bey-loading-container` takes no input: it renders a fullscreen overlay while `BeyLoadingService` reports work
in progress.

## BeyLoadingService

`show()` and `hide()` are counted, so concurrent requests do not hide the overlay early: it disappears when
the last one finishes. `reset()` clears the count outright.

An overlay positions itself against the nearest positioned ancestor, so the container it covers needs
`position: relative`.
