import { PdfViewerZoom } from '../models/pdf-viewer-value.model';

export function toZoomFactor(zoom: PdfViewerZoom): number {
    return typeof zoom === 'number' ? zoom : 1;
}
