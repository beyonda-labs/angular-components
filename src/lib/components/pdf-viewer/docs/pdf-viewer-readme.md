# Pdf viewer

A thin wrapper around `ngx-extended-pdf-viewer`. The config drives the viewer and reports what happens in it;
the handle from `onReady` moves it. It shows no toolbar by default, so the consumer can build its own, and it
offers two: the one of pdf.js, and a compact one of the library with zoom, the current page and a slot for the
consumer's status.

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

| Field                 | Required | Default      | Meaning                                                  |
| --------------------- | -------- | ------------ | -------------------------------------------------------- |
| `src`                 | yes      |              | Url, blob or bytes of the document                       |
| `page`                | no       | `1`          | Page shown on load                                       |
| `zoom`                | no       | `auto`       | A fraction, or a keyword such as `page-fit`              |
| `rotation`            | no       | `0`          | `0`, `90`, `180` or `270`                                |
| `toolbar`             | no       | `None`       | A `BeyPdfViewerToolbar`: `None`, `Full` or `Compact`     |
| `toolbarButtons`      | no       | all on       | A `BeyPdfViewerToolbarButtons`, the buttons `Full` shows |
| `zoomStep`            | no       | `0.1`        | What each zoom button of `Compact` adds or takes away    |
| `backgroundColor`     | no       | surface      | Colour behind the pages, a token by default              |
| `height`              | no       | `100%`       | Height of the document area                              |
| `minZoom` / `maxZoom` | no       | `0.1` / `10` | Bounds for zooming, the compact toolbar's included       |
| `password`            | no       |              | Password for a protected document                        |
| `filenameForDownload` | no       |              | Name suggested when downloading                          |

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
| `onClick`          | The mouse event             | A click on the document area            |

## The compact toolbar

`toolbar: BeyPdfViewerToolbar.Compact` puts a bar above the document: zoom out and zoom in within
`minZoom`–`maxZoom` by `zoomStep`, the zoom as a percentage, and, once the document has loaded, the current page
as a number field next to the page count. A typed page outside the document is brought back into it. Whatever
the consumer marks with `bey-pdf-viewer-status` is projected on its left; with any other toolbar it is not shown.

```ts
readonly viewer = new BeyPdfViewerConfig({
    src: this.pdfUrl,
    maxZoom: 3,
    minZoom: 0.25,
    toolbar: BeyPdfViewerToolbar.Compact
});
```

```html
<bey-pdf-viewer [config]="viewer">
    <span bey-pdf-viewer-status role="img" [attr.aria-label]="'myPage.stale' | translate">
        <fa-icon [icon]="staleIcon" />
    </span>
</bey-pdf-viewer>
```

Its buttons and the page field are named by `angular-components.pdf-viewer.toolbar.zoom-out`, `zoom-in` and
`page`. The two zoom buttons are the library's bordered icon squares and show their name as a tooltip, also
while disabled at `minZoom` or `maxZoom`.

## The handle

`goToPage`, `setZoom` and `rotate` change what is shown without reporting a change, since the caller
already knows; `currentPage()`, `currentRotation()` and `currentZoom()` read the live state. A new config
resets the three to its own values.

## Styles

pdf.js themes its own background off the operating system's `prefers-color-scheme`, not the `body.dark` class
of the app, so `backgroundColor` defaults to a token and keeps the viewer in step with the theme; a literal
colour still overrides it.

The viewer binds `[showBorders]="false"`, which switches pdf.js to its `removePageBorders` layout: a positive
margin between pages instead of the negative one that makes room for its border-image shadow, without which
the next page would hide any border drawn here. That layout also sets `border: none` at the same specificity
as the library's rule and depends on the order of the vendor stylesheet, so the page separator, the borders
and the shadow are overridden on pdf.js's own classes with `!important`, which makes the outcome deterministic.
A thin bottom border on every page but the last replaces the shadow as the page-break cue.

The scrollbar of the document mirrors `.bey-thin-scroll`: `scrollbar-color` alone lets Chromium fall back to
its hover-only overlay thumb, so the `::-webkit-scrollbar*` rules keep the thumb visible, as in every other
scrollable panel.
