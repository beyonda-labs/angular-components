import { PdfViewerToolbarButtons } from './pdf-viewer-toolbar-buttons.model';

describe('PdfViewerToolbarButtons', () => {
    it('should default every button to visible', () => {
        const buttons = new PdfViewerToolbarButtons();

        expect(buttons.downloadButton).toBe(true);
        expect(buttons.findButton).toBe(true);
        expect(buttons.handToolButton).toBe(true);
        expect(buttons.openFileButton).toBe(true);
        expect(buttons.pagingButtons).toBe(true);
        expect(buttons.presentationModeButton).toBe(true);
        expect(buttons.printButton).toBe(true);
        expect(buttons.propertiesButton).toBe(true);
        expect(buttons.rotateButton).toBe(true);
        expect(buttons.secondaryToolbarButton).toBe(true);
        expect(buttons.sidebarButton).toBe(true);
        expect(buttons.zoomButtons).toBe(true);
        expect(buttons.zoomDropdown).toBe(true);
    });

    it('should keep explicitly hidden buttons hidden', () => {
        const buttons = new PdfViewerToolbarButtons({ openFileButton: false, printButton: false });

        expect(buttons.openFileButton).toBe(false);
        expect(buttons.printButton).toBe(false);
        expect(buttons.downloadButton).toBe(true);
    });
});
