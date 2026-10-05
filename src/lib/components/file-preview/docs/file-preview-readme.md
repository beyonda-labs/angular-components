# File preview

A dialog that shows a PDF or an image, opened from a service with one call. The content is a `Blob` or a URL: a
PDF goes to `bey-pdf-viewer` with its compact toolbar and a download button, an image to an `<img>` that shrinks to
fit the dialog without scrolling. The object URL the dialog
creates for a `Blob` image is revoked when the dialog is destroyed, so the caller has nothing to clean up. The
dialog has the shape of a modal form: an icon of the file type, `angular-components.file-preview.type` over the title
and the file name, and a footer with `angular-components.file-preview.cancel`. The dialog component is internal;
`BeyFilePreviewService` is the whole public surface.

## Setup

It opens through ngx-bootstrap, like the modal module:

```ts
providers: [provideBeyModal()];
```

## Usage

```ts
this.filePreview.open(
    new BeyFilePreviewConfig({
        content: blob,
        fileName: 'invoice-2026-09.pdf',
        title: 'myPage.preview.title',
        type: BeyFilePreviewType.Pdf
    })
);
```

## BeyFilePreviewService

| Method         | Returns             | Meaning                                           |
| -------------- | ------------------- | ------------------------------------------------- |
| `open(config)` | the modal reference | Shows the preview in a centred extra-large dialog |

## BeyFilePreviewConfig

| Field      | Required | Default | Meaning                                                  |
| ---------- | -------- | ------- | -------------------------------------------------------- |
| `content`  | yes      |         | A `Blob`, or a URL used as it is                         |
| `type`     | yes      |         | `BeyFilePreviewType.Pdf` or `BeyFilePreviewType.Image`   |
| `title`    | yes      |         | i18n key or literal, the heading that names the dialog   |
| `fileName` | no       |         | Shown next to the title, and the name a PDF downloads as |
| `alt`      | no       | `title` | i18n key or literal, the alternative text of an image    |

The dialog is named by its title through `aria-labelledby`, and its close button by
`angular-components.file-preview.close`. Escape and the backdrop close it as well. A PDF shows every button of
the pdf.js toolbar except opening another file.

## Theming

Set on `bey-file-preview-dialog`:

| Variable                            | Default              |
| ----------------------------------- | -------------------- |
| `--bey-file-preview-body-height`    | `70vh`               |
| `--bey-file-preview-fg`             | `--bey-text-primary` |
| `--bey-file-preview-fg-muted`       | `--bey-text-muted`   |
| `--bey-file-preview-close-hover-bg` | `--bey-bg-active`    |
