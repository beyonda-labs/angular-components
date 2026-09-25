import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfViewerConfig, PdfViewerConfigParameters, PdfViewerHandle } from './models/pdf-viewer-config.model';
import { PdfViewerComponent } from './pdf-viewer.component';

describe('PdfViewerComponent', () => {
    let fixture: ComponentFixture<PdfViewerComponent>;
    let component: PdfViewerComponent;

    function buildConfig(overrides: Partial<PdfViewerConfigParameters> = {}): PdfViewerConfig {
        return new PdfViewerConfig({ page: 3, rotation: 90, src: 'invoice.pdf', zoom: 1.5, ...overrides });
    }

    async function render(config: PdfViewerConfig = buildConfig()): Promise<void> {
        fixture = TestBed.createComponent(PdfViewerComponent);
        fixture.componentRef.setInput('config', config);
        fixture.detectChanges();
        await fixture.whenStable();
        component = fixture.componentInstance;
    }

    async function renderWithHandle(overrides: Partial<PdfViewerConfigParameters> = {}): Promise<PdfViewerHandle> {
        let handle: PdfViewerHandle | undefined;

        await render(buildConfig({ onReady: ready => (handle = ready), ...overrides }));

        return handle!;
    }

    beforeEach(async () => {
        /* The wrapped viewer is a heavy third-party component; this suite is about the wrapper. */
        await TestBed.configureTestingModule({ imports: [PdfViewerComponent] })
            .overrideComponent(PdfViewerComponent, { set: { template: '' } })
            .compileComponents();
    });

    it('starts where the config says and hands the handle over', async () => {
        const handle = await renderWithHandle();

        expect(handle.currentPage()).toBe(3);
        expect(handle.currentRotation()).toBe(90);
        expect(handle.currentZoom()).toBe(1.5);
    });

    it('moves to a page through the handle without reporting it as a reader change', async () => {
        const onPageChange = jest.fn();
        const handle = await renderWithHandle({ onPageChange });

        handle.goToPage(5);

        expect(handle.currentPage()).toBe(5);
        expect(onPageChange).not.toHaveBeenCalled();
    });

    it('rotates and zooms through the handle', async () => {
        const handle = await renderWithHandle();

        handle.rotate(180);
        handle.setZoom(2);

        expect(handle.currentRotation()).toBe(180);
        expect(handle.currentZoom()).toBe(2);
    });

    it('hands the viewer a percentage for a fractional zoom, and a keyword as it is', async () => {
        const handle = await renderWithHandle();

        handle.setZoom(1.25);
        expect(component.zoomInput()).toBe(125);

        handle.setZoom('page-fit');
        expect(component.zoomInput()).toBe('page-fit');
    });

    it('follows the reader turning the page, and reports it', async () => {
        const onPageChange = jest.fn();

        await render(buildConfig({ onPageChange }));
        component.onPageChange(4);
        component.onPageChange();

        expect(component.currentPage()).toBe(4);
        expect(onPageChange).toHaveBeenCalledTimes(1);
        expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it('follows the reader rotating, and reports it', async () => {
        const onRotationChange = jest.fn();

        await render(buildConfig({ onRotationChange }));
        component.onRotationChange(270);

        expect(component.currentRotation()).toBe(270);
        expect(onRotationChange).toHaveBeenCalledWith({ rotation: 270 });
    });

    it('reports the zoom factor the viewer settles on and reads back a percentage as a fraction', async () => {
        const onZoomChange = jest.fn();

        await render(buildConfig({ onZoomChange }));
        component.onZoomFactorChange(1.75);
        component.onZoomModelChange(150);

        expect(onZoomChange).toHaveBeenCalledWith(1.75);
        expect(component.currentZoom()).toBe(1.5);
    });

    it('reports a loaded document, a failed one, a rendered page and a click', async () => {
        const onClick = jest.fn();
        const onLoaded = jest.fn();
        const onLoadingFailed = jest.fn();
        const onPageRendered = jest.fn();
        const error = new Error('broken');
        const event = new MouseEvent('click');

        await render(buildConfig({ onClick, onLoaded, onLoadingFailed, onPageRendered }));
        component.onPdfLoaded({ pagesCount: 12 } as never);
        component.onPdfLoadingFailed(error);
        component.onPageRendered({ pageNumber: 2 } as never);
        component.onContainerClick(event);

        expect(onLoaded).toHaveBeenCalledWith({ pagesCount: 12 });
        expect(onLoadingFailed).toHaveBeenCalledWith({ error });
        expect(onPageRendered).toHaveBeenCalledWith({ pageNumber: 2 });
        expect(onClick).toHaveBeenCalledWith(event);
    });

    it('follows a replaced config', async () => {
        await render();

        fixture.componentRef.setInput('config', buildConfig({ page: 9, rotation: 0, zoom: 'auto' }));
        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.currentPage()).toBe(9);
        expect(component.currentZoom()).toBe('auto');
    });
});
