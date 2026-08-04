import { PdfViewerConfig } from './pdf-viewer-config.model';
import { PdfViewerToolbarButtons } from './pdf-viewer-toolbar-buttons.model';

describe('PdfViewerConfig', () => {
    it('should apply default values', () => {
        const config = new PdfViewerConfig({ src: 'invoice.pdf' });

        expect(config.height).toBe('100%');
        expect(config.maxZoom).toBe(10);
        expect(config.minZoom).toBe(0.1);
        expect(config.page).toBe(1);
        expect(config.rotation).toBe(0);
        expect(config.showToolbar).toBe(false);
        expect(config.zoom).toBe('auto');
        expect(config.toolbarButtons).toBeInstanceOf(PdfViewerToolbarButtons);
    });

    it('should reuse a provided PdfViewerToolbarButtons instance instead of rebuilding it', () => {
        const toolbarButtons = new PdfViewerToolbarButtons({ printButton: false });
        const config = new PdfViewerConfig({ src: 'invoice.pdf', toolbarButtons });

        expect(config.toolbarButtons).toBe(toolbarButtons);
    });

    it('should transform a plain toolbarButtons literal into a PdfViewerToolbarButtons instance', () => {
        const config = new PdfViewerConfig({ src: 'invoice.pdf', toolbarButtons: { printButton: false } });

        expect(config.toolbarButtons).toBeInstanceOf(PdfViewerToolbarButtons);
        expect(config.toolbarButtons.printButton).toBe(false);
    });
});
