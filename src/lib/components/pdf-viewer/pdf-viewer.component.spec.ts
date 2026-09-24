import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfViewerConfig, PdfViewerConfigParameters } from './models/pdf-viewer-config.model';
import { PdfViewerComponent } from './pdf-viewer.component';

describe('PdfViewerComponent', () => {
    let fixture: ComponentFixture<PdfViewerComponent>;
    let component: PdfViewerComponent;

    function buildConfig(overrides: Partial<PdfViewerConfigParameters> = {}): PdfViewerConfig {
        return new PdfViewerConfig({ src: 'invoice.pdf', page: 3, rotation: 90, zoom: 1.5, ...overrides });
    }

    async function render(config: PdfViewerConfig = buildConfig()): Promise<void> {
        fixture = TestBed.createComponent(PdfViewerComponent);
        fixture.componentRef.setInput('config', config);
        fixture.detectChanges();
        await fixture.whenStable();
        component = fixture.componentInstance;
    }

    beforeEach(async () => {
        /* The wrapped viewer is a heavy third-party component; this suite is about the wrapper. */
        await TestBed.configureTestingModule({ imports: [PdfViewerComponent] })
            .overrideComponent(PdfViewerComponent, { set: { template: '' } })
            .compileComponents();
    });

    it('starts where the config says', async () => {
        await render();

        expect(component.currentPage()).toBe(3);
        expect(component.currentRotation()).toBe(90);
        expect(component.currentZoom()).toBe(1.5);
    });

    it('moves to a page on request, without reporting it as a user change', async () => {
        await render();
        const pageChange = jest.spyOn(component.pageChange, 'emit');

        component.goToPage(5);

        expect(component.currentPage()).toBe(5);
        expect(pageChange).not.toHaveBeenCalled();
    });

    it('rotates and zooms on request', async () => {
        await render();

        component.rotate(180);
        component.setZoom(2);

        expect(component.currentRotation()).toBe(180);
        expect(component.currentZoom()).toBe(2);
    });

    it('hands the viewer a percentage for a fractional zoom, and a keyword as it is', async () => {
        await render();

        component.setZoom(1.25);
        expect(component.zoomInput()).toBe(125);

        component.setZoom('page-fit');
        expect(component.zoomInput()).toBe('page-fit');
    });

    it('follows the viewer when the reader turns the page, and reports it', async () => {
        await render();
        const pageChange = jest.spyOn(component.pageChange, 'emit');

        component.onPageChange(4);

        expect(component.currentPage()).toBe(4);
        expect(pageChange).toHaveBeenCalledWith(4);
    });

    it('ignores a page the viewer does not name', async () => {
        await render();
        const pageChange = jest.spyOn(component.pageChange, 'emit');

        component.onPageChange();

        expect(component.currentPage()).toBe(3);
        expect(pageChange).not.toHaveBeenCalled();
    });

    it('follows the viewer when the reader rotates, and reports it', async () => {
        await render();
        const rotationChange = jest.spyOn(component.rotationChange, 'emit');

        component.onRotationChange(270);

        expect(component.currentRotation()).toBe(270);
        expect(rotationChange).toHaveBeenCalledWith({ rotation: 270 });
    });

    it('reports the zoom factor the viewer settles on', async () => {
        await render();
        const zoomChange = jest.spyOn(component.zoomChange, 'emit');

        component.onZoomFactorChange(1.75);

        expect(zoomChange).toHaveBeenCalledWith(1.75);
    });

    it('turns a zoom the viewer reports as a percentage back into a fraction', async () => {
        await render();

        component.onZoomModelChange(150);

        expect(component.currentZoom()).toBe(1.5);
    });

    it('reports a loaded document and a failed one', async () => {
        await render();
        const loaded = jest.spyOn(component.loaded, 'emit');
        const loadingFailed = jest.spyOn(component.loadingFailed, 'emit');
        const error = new Error('broken');

        component.onPdfLoaded({ pagesCount: 12 } as never);
        component.onPdfLoadingFailed(error);

        expect(loaded).toHaveBeenCalledWith({ pagesCount: 12 });
        expect(loadingFailed).toHaveBeenCalledWith({ error });
    });

    it('reports a rendered page and a click on the viewer', async () => {
        await render();
        const pageRendered = jest.spyOn(component.pageRendered, 'emit');
        const viewerClick = jest.spyOn(component.viewerClick, 'emit');
        const event = new MouseEvent('click');

        component.onPageRendered({ pageNumber: 2 } as never);
        component.onContainerClick(event);

        expect(pageRendered).toHaveBeenCalledWith({ pageNumber: 2 });
        expect(viewerClick).toHaveBeenCalledWith(event);
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
