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
| `isDownloadable`      | no       | `false`      | A download button at the end of the `Compact` toolbar    |
| `isSearchable`        | no       | `false`      | A search field on the right of the `Compact` toolbar     |
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
Without the toolbar of pdf.js, `None` and `Compact` also turn off its commands: the keyboard shortcuts (find, print,
open, save), the context menu and opening a file dropped on the viewer, since nothing of that interface is on
screen. `Full` keeps them. With `isDownloadable` it ends in a download button that saves the document as `filenameForDownload`
(`document.pdf` without one).

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

Its buttons and the page field are named by `angular-components.pdf-viewer.toolbar.zoom-out`, `zoom-in`,
`download` and `page`, and the search by `search`, `previous-match`, `next-match` and `no-matches`. The two zoom buttons are the library's bordered icon squares and show their name as a tooltip, also
while disabled at `minZoom` or `maxZoom`.

### Search

With `isSearchable` the compact toolbar ends in a search field, drawn like the search box of `bey-search`: the
document is searched as the reader types, ignoring case and accents as pdf.js does, every match is highlighted and
the current one stands out. Next to the field the toolbar counts the matches (`2 / 7`) or says there are none, and
two arrows move to the previous and the next one, as `Shift+Enter` and `Enter` do in the field. `Escape` clears a
query and stops there, so it does not close the dialog the viewer is in; with the field empty it goes through. A new
document in the same viewer, such as a refreshed preview, is searched again for the query still typed. When the
toolbar is narrower than Bootstrap's `lg` breakpoint, as in a side panel, the search moves to a row of its own under
the controls: the toolbar is a size container, so it follows its own width rather than the window's.

A searchable viewer always renders the text layer of pdf.js, which draws the highlights. The search goes through
`NgxExtendedPdfViewerService`, which drives the viewer on screen, as `ngx-extended-pdf-viewer` shows one at a time.

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

The matches of a search are painted with `--bey-pdf-viewer-match-bg` and the current one with
`--bey-pdf-viewer-match-bg-current`, read from `--bey-highlight` and `--bey-highlight-strong`, instead of the purple
and green of pdf.js. `ngx-extended-pdf-viewer` paints each searched term with a class of its own (`color0`, …) at a
higher specificity, so both colours are set with `!important`, as the page borders are. The search field takes the field variables of the toolbar, as the page field does, plus
`--bey-pdf-viewer-toolbar-placeholder`.

The scrollbar of the document mirrors `.bey-thin-scroll`: `scrollbar-color` alone lets Chromium fall back to
its hover-only overlay thumb, so the `::-webkit-scrollbar*` rules keep the thumb visible, as in every other
scrollable panel.
