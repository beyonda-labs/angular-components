import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { buttonByName, renderComponent, settle } from '@testing/dom';

import { PdfViewerConfig } from '../../models/pdf-viewer-config.model';
import { PdfViewerToolbarComponent } from './pdf-viewer-toolbar.component';

const PAGE = 'angular-components.pdf-viewer.toolbar.page';
const ZOOM_IN = 'angular-components.pdf-viewer.toolbar.zoom-in';
const ZOOM_OUT = 'angular-components.pdf-viewer.toolbar.zoom-out';

interface ToolbarInputs {
    page?: number;
    pagesCount?: number;
    zoom?: number;
}

describe('PdfViewerToolbarComponent', () => {
    let fixture: ComponentFixture<PdfViewerToolbarComponent>;

    const pageChange = jest.fn();
    const zoomChange = jest.fn();

    async function render(inputs: ToolbarInputs = {}): Promise<void> {
        fixture = await renderComponent(PdfViewerToolbarComponent, {
            config: new PdfViewerConfig({ maxZoom: 3, minZoom: 0.25, src: 'invoice.pdf' }),
            page: 1,
            pagesCount: 3,
            zoom: 1,
            ...inputs
        });
        fixture.componentInstance.pageChange.subscribe(pageChange);
        fixture.componentInstance.zoomChange.subscribe(zoomChange);
    }

    function pageField(): HTMLInputElement | null {
        return fixture.nativeElement.querySelector(`input[aria-label="${PAGE}"]`);
    }

    function text(): string {
        return fixture.nativeElement.textContent ?? '';
    }

    function typePage(value: string): void {
        const field = pageField()!;

        field.value = value;
        field.dispatchEvent(new Event('change'));
    }

    beforeEach(async () => {
        pageChange.mockReset();
        zoomChange.mockReset();

        await TestBed.configureTestingModule({
            imports: [PdfViewerToolbarComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('shows the zoom as a percentage and the page count', async () => {
        await render({ zoom: 1.5 });

        expect(text()).toContain('150%');
        expect(text()).toContain('/ 3');
    });

    it('leaves the page field out until the document has pages', async () => {
        await render({ pagesCount: 0 });

        expect(pageField()).toBeNull();
    });

    it('zooms by the configured step, rounded to a hundredth', async () => {
        await render({ zoom: 1.1 });

        buttonByName(fixture, ZOOM_IN).click();
        buttonByName(fixture, ZOOM_OUT).click();

        expect(zoomChange).toHaveBeenNthCalledWith(1, 1.2);
        expect(zoomChange).toHaveBeenNthCalledWith(2, 1);
    });

    it('keeps the zoom within the configured limits', async () => {
        await render({ zoom: 2.95 });

        buttonByName(fixture, ZOOM_IN).click();

        expect(zoomChange).toHaveBeenCalledWith(3);

        fixture.componentRef.setInput('zoom', 3);
        await settle(fixture);

        expect(buttonByName(fixture, ZOOM_IN).disabled).toBe(true);
        expect(buttonByName(fixture, ZOOM_OUT).disabled).toBe(false);

        fixture.componentRef.setInput('zoom', 0.25);
        await settle(fixture);

        expect(buttonByName(fixture, ZOOM_OUT).disabled).toBe(true);
    });

    it('moves to the typed page, kept within the document', async () => {
        await render();

        typePage('2');
        typePage('9');

        expect(pageChange).toHaveBeenNthCalledWith(1, 2);
        expect(pageChange).toHaveBeenNthCalledWith(2, 3);
        expect(pageField()?.value).toBe('3');
    });

    it('puts the current page back when the typed value is not a number', async () => {
        await render({ page: 2 });

        typePage('');

        expect(pageChange).not.toHaveBeenCalled();
        expect(pageField()?.value).toBe('2');
    });
});
