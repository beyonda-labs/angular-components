import { PdfViewerToolbarButtons } from './pdf-viewer-toolbar-buttons.model';

describe('PdfViewerToolbarButtons', () => {
    it('defaults every button to visible', () => {
        const buttons = new PdfViewerToolbarButtons();

        expect(buttons.hasDownloadButton).toBe(true);
        expect(buttons.hasFindButton).toBe(true);
        expect(buttons.hasHandToolButton).toBe(true);
        expect(buttons.hasOpenFileButton).toBe(true);
        expect(buttons.hasPagingButtons).toBe(true);
        expect(buttons.hasPresentationModeButton).toBe(true);
        expect(buttons.hasPrintButton).toBe(true);
        expect(buttons.hasPropertiesButton).toBe(true);
        expect(buttons.hasRotateButton).toBe(true);
        expect(buttons.hasSecondaryToolbarButton).toBe(true);
        expect(buttons.hasSidebarButton).toBe(true);
        expect(buttons.hasZoomButtons).toBe(true);
        expect(buttons.hasZoomDropdown).toBe(true);
    });

    it('keeps explicitly hidden buttons hidden', () => {
        const buttons = new PdfViewerToolbarButtons({ hasOpenFileButton: false, hasPrintButton: false });

        expect(buttons.hasOpenFileButton).toBe(false);
        expect(buttons.hasPrintButton).toBe(false);
        expect(buttons.hasDownloadButton).toBe(true);
    });
});
