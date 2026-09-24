# Pdf viewer

A thin wrapper around `ngx-extended-pdf-viewer` with its toolbar hidden by default, so the consumer can build
its own. Configuration comes in through a config model; what happens in the document goes out through outputs.

## Usage

```ts
const viewer = new BeyPdfViewerConfig({ src: 'invoice.pdf', page: 1, zoom: 'page-width' });
```

```html
<bey-pdf-viewer
    #viewer
    [config]="viewer"
    (loaded)="onLoaded($event)"
    (pageChange)="page.set($event)"
></bey-pdf-viewer>

<button (click)="viewer.goToPage(page() + 1)">Next</button>
```

## BeyPdfViewerConfig

| Field                 | Required | Default  | Meaning                                                   |
| --------------------- | -------- | -------- | --------------------------------------------------------- |
| `src`                 | yes      |          | Url, blob or bytes of the document                         |
| `page`                | no       | `1`      | Page shown on load                                         |
| `zoom`                | no       | `auto`   | A fraction, or a keyword such as `page-fit`                 |
| `rotation`            | no       | `0`      | `0`, `90`, `180` or `270`                                   |
| `showToolbar`         | no       | `false`  | The viewer's own toolbar                                    |
| `toolbarButtons`      | no       | all off  | Which buttons that toolbar shows                            |
| `backgroundColor`     | no       |          | Colour behind the pages                                     |
| `height`              | no       |          | Height of the viewer                                        |
| `minZoom` / `maxZoom` | no       |          | Bounds for zooming                                          |
| `password`            | no       |          | Password for a protected document                           |
| `filenameForDownload` | no       |          | Name suggested when downloading                             |

## Driving it

`goToPage`, `setZoom` and `rotate` are called on the component through a template reference. They change what
is shown without reporting a change, since the caller already knows.

## Outputs

| Output           | Emits                                     |
| ---------------- | ----------------------------------------- |
| `loaded`         | `{ pagesCount }` once the document opens   |
| `loadingFailed`  | `{ error }` when it cannot be opened       |
| `pageChange`     | The page the reader moved to               |
| `pageRendered`   | `{ pageNumber }` as pages paint            |
| `rotationChange` | `{ rotation }` after a rotation            |
| `zoomChange`     | The zoom factor the viewer settled on      |
| `viewerClick`    | Clicks anywhere on the viewer              |

Zoom is a fraction in the config and in `zoomChange`; the percentage the underlying library wants is handled
inside.

## Styles

The page separator, the borders and the scrollbar are overridden on pdf.js's own classes with `!important`,
deliberately: the reason is written in `pdf-viewer.component.css`.
