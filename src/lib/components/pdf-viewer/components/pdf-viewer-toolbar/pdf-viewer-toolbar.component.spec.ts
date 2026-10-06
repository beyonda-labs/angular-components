import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { buttonByName, renderComponent, settle } from '@testing/dom';

import { PdfViewerConfig } from '../../models/pdf-viewer-config.model';
import { PdfViewerSearchMatches } from '../../models/pdf-viewer-value.model';
import { PdfViewerToolbarComponent } from './pdf-viewer-toolbar.component';

const DOWNLOAD = 'angular-components.pdf-viewer.toolbar.download';
const NEXT_MATCH = 'angular-components.pdf-viewer.toolbar.next-match';
const PAGE = 'angular-components.pdf-viewer.toolbar.page';
const PREVIOUS_MATCH = 'angular-components.pdf-viewer.toolbar.previous-match';
const SEARCH = 'angular-components.pdf-viewer.toolbar.search';
const ZOOM_IN = 'angular-components.pdf-viewer.toolbar.zoom-in';
const ZOOM_OUT = 'angular-components.pdf-viewer.toolbar.zoom-out';

interface ToolbarInputs {
    config?: PdfViewerConfig;
    page?: number;
    pagesCount?: number;
    searchMatches?: PdfViewerSearchMatches;
    zoom?: number;
}

describe('PdfViewerToolbarComponent', () => {
    let fixture: ComponentFixture<PdfViewerToolbarComponent>;

    const download = jest.fn();
    const pageChange = jest.fn();
    const searchChange = jest.fn();
    const searchNext = jest.fn();
    const searchPrevious = jest.fn();
    const zoomChange = jest.fn();

    async function render(inputs: ToolbarInputs = {}): Promise<void> {
        fixture = await renderComponent(PdfViewerToolbarComponent, {
            config: new PdfViewerConfig({ maxZoom: 3, minZoom: 0.25, src: 'invoice.pdf' }),
            page: 1,
            pagesCount: 3,
            zoom: 1,
            ...inputs
        });
        fixture.componentInstance.download.subscribe(download);
        fixture.componentInstance.pageChange.subscribe(pageChange);
        fixture.componentInstance.searchChange.subscribe(searchChange);
        fixture.componentInstance.searchNext.subscribe(searchNext);
        fixture.componentInstance.searchPrevious.subscribe(searchPrevious);
        fixture.componentInstance.zoomChange.subscribe(zoomChange);
    }

    function pageField(): HTMLInputElement | null {
        return fixture.nativeElement.querySelector(`input[aria-label="${PAGE}"]`);
    }

    function renderSearchable(inputs: ToolbarInputs = {}): Promise<void> {
        return render({ config: new PdfViewerConfig({ isSearchable: true, src: 'invoice.pdf' }), ...inputs });
    }

    function searchField(): HTMLInputElement | null {
        return fixture.nativeElement.querySelector(`input[aria-label="${SEARCH}"]`);
    }

    async function typeSearch(value: string): Promise<void> {
        const field = searchField()!;

        field.value = value;
        field.dispatchEvent(new Event('input'));
        await settle(fixture);
    }

    function pressInSearch(key: string, shiftKey = false): KeyboardEvent {
        const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key, shiftKey });

        searchField()!.dispatchEvent(event);

        return event;
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
        searchChange.mockReset();
        searchNext.mockReset();
        searchPrevious.mockReset();
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

    it('offers downloading the document only when the config allows it', async () => {
        await render();
        expect(fixture.nativeElement.querySelector(`button[aria-label="${DOWNLOAD}"]`)).toBeNull();

        await render({ config: new PdfViewerConfig({ isDownloadable: true, src: 'invoice.pdf' }) });
        buttonByName(fixture, DOWNLOAD).click();

        expect(download).toHaveBeenCalledTimes(1);
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

    it('offers searching the document only when the config allows it', async () => {
        await render();
        expect(searchField()).toBeNull();

        await renderSearchable();

        expect(searchField()?.placeholder).toBe(SEARCH);
        expect(fixture.nativeElement.querySelector('[role="search"]')).not.toBeNull();
    });

    it('sends the query as it is typed, and moves to the next match with Enter and the previous one with Shift+Enter', async () => {
        await renderSearchable({ searchMatches: { current: 1, total: 4 } });

        await typeSearch('total');
        pressInSearch('Enter');
        pressInSearch('Enter', true);

        expect(searchChange).toHaveBeenCalledWith('total');
        expect(searchNext).toHaveBeenCalledTimes(1);
        expect(searchPrevious).toHaveBeenCalledTimes(1);
    });

    it('counts the matches of a query, or says there are none, and moves between them with its arrows', async () => {
        await renderSearchable({ searchMatches: { current: 2, total: 7 } });

        expect(text()).not.toContain('2 / 7');

        await typeSearch('total');
        buttonByName(fixture, NEXT_MATCH).click();
        buttonByName(fixture, PREVIOUS_MATCH).click();

        expect(text()).toContain('2 / 7');
        expect(searchNext).toHaveBeenCalledTimes(1);
        expect(searchPrevious).toHaveBeenCalledTimes(1);

        fixture.componentRef.setInput('searchMatches', { current: 0, total: 0 });
        await settle(fixture);

        expect(text()).toContain('angular-components.pdf-viewer.toolbar.no-matches');
        expect(buttonByName(fixture, NEXT_MATCH).disabled).toBe(true);
        expect(buttonByName(fixture, PREVIOUS_MATCH).disabled).toBe(true);
    });

    it('clears the query with Escape, keeping the key from closing the dialog around it, and lets it through once empty', async () => {
        await renderSearchable();
        await typeSearch('total');

        const clearing = pressInSearch('Escape');

        await settle(fixture);

        expect(searchField()?.value).toBe('');
        expect(searchChange).toHaveBeenLastCalledWith('');
        expect(clearing.defaultPrevented).toBe(true);
        expect(pressInSearch('Escape').defaultPrevented).toBe(false);
    });
});
