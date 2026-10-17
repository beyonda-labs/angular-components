import { PdfViewerConfig } from '../../pdf-viewer/models/pdf-viewer-config.model';
import { PdfViewerToolbar } from '../../pdf-viewer/models/pdf-viewer-value.model';
import { FilePreviewConfig, FilePreviewContent } from '../models/file-preview.model';

export function buildViewerConfig(config: FilePreviewConfig): PdfViewerConfig {
    return new PdfViewerConfig({
        filenameForDownload: config.fileName,
        isDownloadable: true,
        isSearchable: true,
        src: config.content,
        toolbar: PdfViewerToolbar.Compact
    });
}

export function toImageSource(content: FilePreviewContent): string {
    return content instanceof Blob ? URL.createObjectURL(content) : content;
}
