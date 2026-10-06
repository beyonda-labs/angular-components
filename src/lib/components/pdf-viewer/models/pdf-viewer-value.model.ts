export enum PdfViewerToolbar {
    Compact = 'compact',
    Full = 'full',
    None = 'none'
}

export interface PdfViewerSearchMatches {
    current: number;
    total: number;
}

export const NO_SEARCH_MATCHES: PdfViewerSearchMatches = { current: 0, total: 0 };

export type PdfViewerRotation = 0 | 90 | 180 | 270;

export type PdfViewerSource = string | ArrayBuffer | Blob | Uint8Array;

export type PdfViewerZoom = number | 'auto' | 'page-actual' | 'page-fit' | 'page-width';
