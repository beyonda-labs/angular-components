import { PdfViewerToolbar } from '../../pdf-viewer/models/pdf-viewer-value.model';
import { FilePreviewConfig, FilePreviewType } from '../models/file-preview.model';
import { buildViewerConfig, toImageSource } from './file-preview-content';

describe('buildViewerConfig', () => {
    it('shows the content in a compact viewer that searches and downloads it under the file name', () => {
        const content = new Blob(['%PDF'], { type: 'application/pdf' });
        const viewer = buildViewerConfig(
            new FilePreviewConfig({ content, fileName: 'offer.pdf', title: 'Offer', type: FilePreviewType.Pdf })
        );

        expect(viewer).toEqual(
            expect.objectContaining({
                filenameForDownload: 'offer.pdf',
                isDownloadable: true,
                isSearchable: true,
                src: content,
                toolbar: PdfViewerToolbar.Compact
            })
        );
    });
});

describe('toImageSource', () => {
    const createObjectURL = jest.fn();

    beforeEach(() => {
        createObjectURL.mockReset();
        createObjectURL.mockReturnValue('blob:preview');
        URL.createObjectURL = createObjectURL;
    });

    it('gives a blob an object URL', () => {
        const content = new Blob(['logo'], { type: 'image/png' });

        expect(toImageSource(content)).toBe('blob:preview');
        expect(createObjectURL).toHaveBeenCalledWith(content);
    });

    it('keeps a URL as it is', () => {
        expect(toImageSource('https://cdn.test/logo.png')).toBe('https://cdn.test/logo.png');
        expect(createObjectURL).not.toHaveBeenCalled();
    });
});
