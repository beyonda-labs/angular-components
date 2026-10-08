import { PdfViewerRotation } from './pdf-viewer-value.model';

export interface PdfViewerLoaded {
    pagesCount: number;
}

export interface PdfViewerLoadingFailed {
    error: Error;
}

export interface PdfViewerPageRendered {
    pageNumber: number;
}

export interface PdfViewerRotationChange {
    rotation: PdfViewerRotation;
}
