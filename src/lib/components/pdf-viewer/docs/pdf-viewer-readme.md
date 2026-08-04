# PDF Viewer Component (`bey-pdf-viewer`)

Thin wrapper around [`ngx-extended-pdf-viewer`](https://www.npmjs.com/package/ngx-extended-pdf-viewer) (built on PDF.js).
Its native toolbar is hidden by default so the consumer builds their own UI, while the wrapper exposes an imperative
API (`goToPage`, `setZoom`, `rotate`) and a curated set of `@Output()`s (page, zoom, rotation, load, click) so any
custom toolbar has everything it needs without touching the underlying library directly.

`ngx-extended-pdf-viewer` wraps PDF.js's full viewer engine, so even with every native UI element hidden, its
internal engine still fires real events (`pageChange`, `currentZoomFactor`, `rotationChange`, etc.) that a custom
toolbar can rely on.

---

## Installation

`ngx-extended-pdf-viewer` is a **peer dependency** (like `monaco-editor`/`ngx-monaco-editor-v2`) — install it in the
consuming app:

```bash
npm install ngx-extended-pdf-viewer@28.1.0
```

PDF.js needs its worker, cmaps and standard fonts served as static assets. Add this to the consuming app's
`angular.json` (`build.options.assets`):

```json
{
    "glob": "**/*",
    "input": "node_modules/ngx-extended-pdf-viewer/assets/",
    "output": "/assets/"
}
```

Without this step the viewer fails to load PDFs (missing worker/cmaps at runtime).

---

## Quick start

```ts
import { BeyPdfViewerConfig } from '@beyonda-labs/angular-components';

readonly config = new BeyPdfViewerConfig({ src: 'invoice.pdf' });
```

```html
<bey-pdf-viewer [config]="config" (pageChange)="onPageChange($event)" (loaded)="onLoaded($event)"></bey-pdf-viewer>
```

Because the native toolbar is hidden by default (`showToolbar: false`), build your own controls against the
component's imperative API:

```ts
@ViewChild(BeyPdfViewerComponent) pdfViewer!: BeyPdfViewerComponent;

nextPage(): void {
    this.pdfViewer.goToPage(this.pdfViewer.currentPage + 1);
}

zoomIn(): void {
    this.pdfViewer.setZoom(this.pdfViewer.currentZoom === 'auto' ? 1.25 : (this.pdfViewer.currentZoom as number) + 0.25);
}
```

---

## `BeyPdfViewerConfig`

| Parameter             | Type                          | Required | Default  | Description                                                        |
| ---------------------- | ------------------------------ | -------- | -------- | -------------------------------------------------------------------- |
| `src`                  | `string \| ArrayBuffer \| Blob \| Uint8Array` | yes | —   | PDF source: URL, base64-decoded buffer, or blob                     |
| `page`                 | `number`                       | no       | `1`      | Initial page                                                         |
| `zoom`                 | `number \| 'auto' \| 'page-actual' \| 'page-fit' \| 'page-width'` | no | `'auto'` | Initial zoom — a numeric value is a **fraction**, `1` = 100%, `1.5` = 150% (matches `zoomChange`'s unit; the wrapper converts to/from the underlying library's percentage-based `zoom` input) |
| `rotation`             | `0 \| 90 \| 180 \| 270`         | no       | `0`      | Initial rotation                                                      |
| `minZoom` / `maxZoom`  | `number`                       | no       | `0.1` / `10` | Zoom bounds                                                      |
| `height`               | `string`                       | no       | `'100%'` | CSS height of the viewer                                             |
| `backgroundColor`      | `string`                       | no       | —        | Viewer background color                                              |
| `password`             | `string`                       | no       | —        | Password for protected PDFs                                          |
| `filenameForDownload`  | `string`                       | no       | —        | Filename used if the native download button is shown                |
| `showToolbar`          | `boolean`                      | no       | `false`  | Master switch for `ngx-extended-pdf-viewer`'s own toolbar             |
| `toolbarButtons`       | `BeyPdfViewerToolbarButtons`   | no       | all `true` | Per-button visibility, only relevant when `showToolbar: true`      |

### `BeyPdfViewerToolbarButtons`

Only meaningful when `showToolbar: true` — lets you keep the native toolbar but hide individual buttons instead of
building your own from scratch: `pagingButtons`, `zoomButtons`, `zoomDropdown`, `findButton`, `printButton`,
`downloadButton`, `openFileButton`, `presentationModeButton`, `rotateButton`, `handToolButton`, `propertiesButton`,
`sidebarButton`, `secondaryToolbarButton` — all default to `true`.

This covers the common toolbar surface; for anything else `ngx-extended-pdf-viewer` exposes (annotation/editor
toolbar buttons, search options, book/spread modes, etc.), use the underlying `ngx-extended-pdf-viewer` component
directly instead of this wrapper — it's already a peer dependency of the consuming app.

---

## Outputs

| Output          | Payload                       | Emitted when                                    |
| ---------------- | ------------------------------ | -------------------------------------------------- |
| `loaded`         | `{ pagesCount }`               | The PDF finished loading                            |
| `loadingFailed`  | `{ error }`                    | The PDF failed to load                              |
| `pageChange`     | `number`                       | The current page changes (navigation or scroll)     |
| `pageRendered`   | `{ pageNumber }`               | A page finishes rendering                            |
| `zoomChange`     | `number`                       | The actual computed zoom factor changes (pinch, Ctrl+scroll, or `setZoom()`) — always numeric, even when `zoom` is a keyword like `'page-fit'` |
| `rotationChange` | `{ rotation }`                 | The rotation changes                                |
| `viewerClick`    | `MouseEvent`                   | A click anywhere inside the viewer container        |

---

## Imperative API

| Member          | Description                                                          |
| ---------------- | ---------------------------------------------------------------------- |
| `currentPage`    | Current page number (also updated by user navigation)                |
| `currentZoom`    | Current `zoom` value as last set (echoes the model, not the computed factor — use the `zoomChange` output for that) |
| `currentRotation`| Current rotation                                                      |
| `goToPage(page)` | Navigate to a page                                                    |
| `setZoom(zoom)`  | Set the zoom level                                                    |
| `rotate(rotation)` | Set the rotation                                                    |

`goToPage`/`setZoom`/`rotate` update the local state read by the template's bindings into
`ngx-extended-pdf-viewer` — they don't themselves emit `pageChange`/`zoomChange`/`rotationChange` (those outputs
reflect changes reported *back* by the viewer, including ones triggered by these calls).
