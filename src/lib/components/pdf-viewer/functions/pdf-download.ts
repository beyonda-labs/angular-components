import { PdfViewerSource } from '../models/pdf-viewer-value.model';

const PDF_MIME_TYPE = 'application/pdf';

export function downloadPdf(source: PdfViewerSource, fileName: string): void {
    const isLink = typeof source === 'string';
    const url = isLink ? source : URL.createObjectURL(toBlob(source));
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    link.click();

    if (!isLink) {
        URL.revokeObjectURL(url);
    }
}

function toBlob(source: Exclude<PdfViewerSource, string>): Blob {
    if (source instanceof Blob) {
        return source;
    }

    const bytes = source instanceof Uint8Array ? source : new Uint8Array(source);

    return new Blob([bytes], { type: PDF_MIME_TYPE });
}
