import { PdfViewerConfig } from './models/pdf-viewer-config.model';
import { PdfViewerComponent } from './pdf-viewer.component';

describe('PdfViewerComponent', () => {
    let component: PdfViewerComponent;

    beforeEach(() => {
        component = new PdfViewerComponent();
        component.config = new PdfViewerConfig({ src: 'invoice.pdf', page: 3, rotation: 90, zoom: 1.5 });
    });

    it('should sync the local page/rotation/zoom state from the config when it is set', () => {
        expect(component.currentPage).toBe(3);
        expect(component.currentRotation).toBe(90);
        expect(component.currentZoom).toBe(1.5);
    });

    describe('goToPage', () => {
        it('should update currentPage without emitting pageChange', () => {
            const pageChangeSpy = jest.spyOn(component.pageChange, 'emit');

            component.goToPage(5);

            expect(component.currentPage).toBe(5);
            expect(pageChangeSpy).not.toHaveBeenCalled();
        });
    });

    describe('rotate', () => {
        it('should update currentRotation', () => {
            component.rotate(180);

            expect(component.currentRotation).toBe(180);
        });
    });

    describe('setZoom', () => {
        it('should update currentZoom', () => {
            component.setZoom(2);

            expect(component.currentZoom).toBe(2);
        });
    });

    describe('zoomInput', () => {
        it('should convert a fraction currentZoom into a percentage for the underlying library', () => {
            component.setZoom(1.25);

            expect(component.zoomInput).toBe(125);
        });

        it('should pass through a keyword currentZoom unchanged', () => {
            component.setZoom('page-fit');

            expect(component.zoomInput).toBe('page-fit');
        });
    });

    describe('onPageChange', () => {
        it('should update currentPage and emit pageChange', () => {
            const pageChangeSpy = jest.spyOn(component.pageChange, 'emit');

            component.onPageChange(4);

            expect(component.currentPage).toBe(4);
            expect(pageChangeSpy).toHaveBeenCalledWith(4);
        });

        it('should ignore an undefined page', () => {
            const pageChangeSpy = jest.spyOn(component.pageChange, 'emit');

            component.onPageChange();

            expect(component.currentPage).toBe(3);
            expect(pageChangeSpy).not.toHaveBeenCalled();
        });
    });

    describe('onRotationChange', () => {
        it('should update currentRotation and emit rotationChange', () => {
            const rotationChangeSpy = jest.spyOn(component.rotationChange, 'emit');

            component.onRotationChange(270);

            expect(component.currentRotation).toBe(270);
            expect(rotationChangeSpy).toHaveBeenCalledWith({ rotation: 270 });
        });
    });

    describe('onZoomFactorChange', () => {
        it('should emit zoomChange with the numeric factor', () => {
            const zoomChangeSpy = jest.spyOn(component.zoomChange, 'emit');

            component.onZoomFactorChange(1.75);

            expect(zoomChangeSpy).toHaveBeenCalledWith(1.75);
        });
    });

    describe('onZoomModelChange', () => {
        it('should update currentZoom with a keyword as-is', () => {
            component.onZoomModelChange('page-fit');

            expect(component.currentZoom).toBe('page-fit');
        });

        it('should convert a percentage from the underlying library back into a fraction', () => {
            component.onZoomModelChange(125);

            expect(component.currentZoom).toBe(1.25);
        });

        it('should ignore an undefined zoom', () => {
            component.onZoomModelChange();

            expect(component.currentZoom).toBe(1.5);
        });
    });

    describe('onPdfLoaded', () => {
        it('should emit loaded with the pages count', () => {
            const loadedSpy = jest.spyOn(component.loaded, 'emit');

            component.onPdfLoaded({ pagesCount: 12 });

            expect(loadedSpy).toHaveBeenCalledWith({ pagesCount: 12 });
        });
    });

    describe('onPdfLoadingFailed', () => {
        it('should emit loadingFailed with the error', () => {
            const loadingFailedSpy = jest.spyOn(component.loadingFailed, 'emit');
            const error = new Error('boom');

            component.onPdfLoadingFailed(error);

            expect(loadingFailedSpy).toHaveBeenCalledWith({ error });
        });
    });

    describe('onPageRendered', () => {
        it('should emit pageRendered with the page number', () => {
            const pageRenderedSpy = jest.spyOn(component.pageRendered, 'emit');

            component.onPageRendered({ pageNumber: 3, source: {} as never, cssTransform: false });

            expect(pageRenderedSpy).toHaveBeenCalledWith({ pageNumber: 3 });
        });
    });

    describe('onContainerClick', () => {
        it('should emit viewerClick with the DOM event', () => {
            const viewerClickSpy = jest.spyOn(component.viewerClick, 'emit');
            const event = new MouseEvent('click');

            component.onContainerClick(event);

            expect(viewerClickSpy).toHaveBeenCalledWith(event);
        });
    });
});
