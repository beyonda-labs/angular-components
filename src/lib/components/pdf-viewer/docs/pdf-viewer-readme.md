# Pdf viewer

A thin wrapper around `ngx-extended-pdf-viewer` with its toolbar hidden by default, so the consumer can build
its own. The config drives the viewer and reports what happens in it; the handle from `onReady` moves it.

## Usage

```ts
readonly viewer = new BeyPdfViewerConfig({
    src: 'invoice.pdf',
    zoom: 'page-width',
    onLoaded: ({ pagesCount }) => this.pageCount.set(pagesCount),
    onPageChange: page => this.page.set(page),
    onReady: handle => (this.pdf = handle)
});
```

```html
<bey-pdf-viewer [config]="viewer" />

<button (click)="pdf.goToPage(page() + 1)">Next</button>
```

## BeyPdfViewerConfig

| Field                 | Required | Default | Meaning                                                    |
| --------------------- | -------- | ------- | ---------------------------------------------------------- |
| `src`                 | yes      |         | Url, blob or bytes of the document                         |
| `page`                | no       | `1`     | Page shown on load                                         |
| `zoom`                | no       | `auto`  | A fraction, or a keyword such as `page-fit`                |
| `rotation`            | no       | `0`     | `0`, `90`, `180` or `270`                                  |
| `showToolbar`         | no       | `false` | The viewer's own toolbar                                   |
| `toolbarButtons`      | no       | all on  | A `BeyPdfViewerToolbarButtons` naming the buttons it shows |
| `backgroundColor`     | no       | surface | Colour behind the pages, a token by default                |
| `height`              | no       | `100%`  | Height of the viewer                                       |
| `minZoom` / `maxZoom` | no       |         | Bounds for zooming                                         |
| `password`            | no       |         | Password for a protected document                          |
| `filenameForDownload` | no       |         | Name suggested when downloading                            |

### Callbacks

| Callback           | Receives                    | When                                    |
| ------------------ | --------------------------- | --------------------------------------- |
| `onReady`          | The handle                  | The viewer exists, and again per config |
| `onLoaded`         | `{ pagesCount }`            | The document opens                      |
| `onLoadingFailed`  | `{ error }`                 | It cannot be opened                     |
| `onPageChange`     | The page                    | The reader moves to another page        |
| `onPageRendered`   | `{ pageNumber }`            | A page paints                           |
| `onRotationChange` | `{ rotation }`              | The reader rotates                      |
| `onZoomChange`     | The zoom factor, a fraction | The viewer settles on a zoom            |
| `onClick`          | The mouse event             | A click anywhere on the viewer          |

## The handle

`goToPage`, `setZoom` and `rotate` change what is shown without reporting a change, since the caller
already knows; `currentPage()`, `currentRotation()` and `currentZoom()` read the live state. A new config
resets the three to its own values.

## Styles

The page separator, the borders and the scrollbar are overridden on pdf.js's own classes with `!important`,
deliberately: the reason is written in `pdf-viewer.component.css`.
