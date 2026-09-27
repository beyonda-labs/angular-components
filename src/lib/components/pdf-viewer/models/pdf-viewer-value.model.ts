export type PdfViewerRotation = 0 | 90 | 180 | 270;

export type PdfViewerSource = string | ArrayBuffer | Blob | Uint8Array;

export type PdfViewerZoom = number | 'auto' | 'page-actual' | 'page-fit' | 'page-width';
