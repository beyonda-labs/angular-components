import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { buttonByName, queryButton, renderComponent, settle } from '@testing/dom';
import { NgxExtendedPdfViewerModule, NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';

import { PdfViewerConfig, PdfViewerConfigParameters, PdfViewerHandle } from './models/pdf-viewer-config.model';
import { PdfViewerToolbar } from './models/pdf-viewer-value.model';
import { PdfViewerComponent } from './pdf-viewer.component';

const CLOSE_SEARCH = 'angular-components.pdf-viewer.search.close';
const NEXT_MATCH = 'angular-components.pdf-viewer.search.next-match';
const PAGE = 'angular-components.pdf-viewer.toolbar.page';
const PREVIOUS_MATCH = 'angular-components.pdf-viewer.search.previous-match';
const SEARCH_BUTTON = 'angular-components.pdf-viewer.toolbar.search';
const SEARCH_FIELD = 'angular-components.pdf-viewer.search.field';
const ZOOM_IN = 'angular-components.pdf-viewer.toolbar.zoom-in';

interface Finder {
    find: jest.Mock;
    findNext: jest.Mock;
    findPrevious: jest.Mock;
}

function buildFinder(): Finder {
    return { find: jest.fn(), findNext: jest.fn(), findPrevious: jest.fn() };
}

function buildConfig(overrides: Partial<PdfViewerConfigParameters> = {}): PdfViewerConfig {
    return new PdfViewerConfig({ page: 3, rotation: 90, src: 'invoice.pdf', zoom: 1.5, ...overrides });
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PdfViewerComponent],
    standalone: true,
    template: `
        <bey-pdf-viewer [config]="config()">
            <span bey-pdf-viewer-status>Out of date</span>
        </bey-pdf-viewer>
    `
})
class HostComponent {
    readonly config = signal(buildConfig({ toolbar: PdfViewerToolbar.Compact, zoom: 1 }));
}

describe('PdfViewerComponent', () => {
    let fixture: ComponentFixture<PdfViewerComponent>;
    let component: PdfViewerComponent;

    async function render(config: PdfViewerConfig = buildConfig()): Promise<void> {
        fixture = await renderComponent(PdfViewerComponent, { config });
        component = fixture.componentInstance;
    }

    async function renderWithHandle(overrides: Partial<PdfViewerConfigParameters> = {}): Promise<PdfViewerHandle> {
        let handle: PdfViewerHandle | undefined;

        await render(buildConfig({ onReady: ready => (handle = ready), ...overrides }));

        return handle!;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PdfViewerComponent],
            providers: [{ provide: NgxExtendedPdfViewerService, useValue: buildFinder() }]
        })
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
        await settle(fixture);

        expect(component.currentPage()).toBe(9);
        expect(component.currentZoom()).toBe('auto');
    });
});

describe('PdfViewerComponent toolbar', () => {
    let finder: Finder;
    let fixture: ComponentFixture<HostComponent>;
    let handle: PdfViewerHandle;

    async function render(overrides: Partial<PdfViewerConfigParameters> = {}): Promise<void> {
        fixture = TestBed.createComponent(HostComponent);
        fixture.componentInstance.config.set(
            buildConfig({
                onReady: ready => (handle = ready),
                toolbar: PdfViewerToolbar.Compact,
                zoom: 1,
                ...overrides
            })
        );
        await settle(fixture);
    }

    function pdfViewer(): DebugElement {
        return fixture.debugElement.query(By.css('ngx-extended-pdf-viewer'));
    }

    function text(): string {
        return fixture.nativeElement.textContent ?? '';
    }

    function frame(): HTMLElement {
        return fixture.nativeElement.querySelector('.bey-pdf-viewer-frame') as HTMLElement;
    }

    function searchField(): HTMLInputElement | null {
        return fixture.nativeElement.querySelector(`input[aria-label="${SEARCH_FIELD}"]`);
    }

    async function openSearch(): Promise<void> {
        buttonByName(fixture, SEARCH_BUTTON).click();
        await settle(fixture);
    }

    function pressInFrame(init: KeyboardEventInit): KeyboardEvent {
        const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });

        frame().dispatchEvent(event);

        return event;
    }

    async function typeSearch(value: string): Promise<void> {
        const field = searchField()!;

        field.value = value;
        field.dispatchEvent(new Event('input'));
        await settle(fixture);
    }

    beforeEach(async () => {
        finder = buildFinder();

        await TestBed.configureTestingModule({
            imports: [HostComponent, TranslateModule.forRoot()],
            providers: [{ provide: NgxExtendedPdfViewerService, useValue: finder }]
        })
            .overrideComponent(PdfViewerComponent, {
                add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] },
                remove: { imports: [NgxExtendedPdfViewerModule] }
            })
            .compileComponents();
    });

    it('loads pdf.js without an inline script, so a Content Security Policy without unsafe-inline lets it start', async () => {
        await render();

        expect(pdfViewer().properties['useInlineScripts']).toBe(false);
    });

    it('shows the compact toolbar with the status the consumer projects, and hides the one of pdf.js', async () => {
        await render();

        expect(text()).toContain('Out of date');
        expect(text()).toContain('100%');
        expect(pdfViewer().properties['showToolbar']).toBe(false);
    });

    it('zooms the document from the compact toolbar', async () => {
        await render();

        buttonByName(fixture, ZOOM_IN).click();
        await settle(fixture);

        expect(handle.currentZoom()).toBe(1.1);
        expect(text()).toContain('110%');
    });

    it('offers the page field once the document loads, and moves to the typed page', async () => {
        await render();

        pdfViewer().triggerEventHandler('pdfLoaded', { pagesCount: 4 });
        await settle(fixture);

        const field = fixture.nativeElement.querySelector(`input[aria-label="${PAGE}"]`) as HTMLInputElement;
        field.value = '2';
        field.dispatchEvent(new Event('change'));

        expect(text()).toContain('/ 4');
        expect(handle.currentPage()).toBe(2);
    });

    it('turns off the commands of pdf.js unless its own toolbar shows: keyboard, context menu and dropped files', async () => {
        await render();

        expect(pdfViewer().properties['ignoreKeyboard']).toBe(true);
        expect(pdfViewer().properties['contextMenuAllowed']).toBe(false);
        expect(pdfViewer().properties['enableDragAndDrop']).toBe(false);

        await render({ toolbar: PdfViewerToolbar.Full });

        expect(pdfViewer().properties['ignoreKeyboard']).toBe(false);
        expect(pdfViewer().properties['contextMenuAllowed']).toBe(true);
        expect(pdfViewer().properties['enableDragAndDrop']).toBe(true);
    });

    it('shows the toolbar of pdf.js for the full variant, and neither for none', async () => {
        await render({ toolbar: PdfViewerToolbar.Full });

        expect(pdfViewer().properties['showToolbar']).toBe(true);
        expect(queryButton(fixture, ZOOM_IN)).toBeNull();

        await render({ toolbar: PdfViewerToolbar.None });

        expect(pdfViewer().properties['showToolbar']).toBe(false);
        expect(text()).not.toContain('Out of date');
    });

    it('opens the search over the document from the toolbar, highlighting every match as it is typed', async () => {
        await render({ isSearchable: true });

        await openSearch();
        await typeSearch('total');
        pdfViewer().triggerEventHandler('updateFindMatchesCount', { current: 1, total: 3 });
        await settle(fixture);
        buttonByName(fixture, NEXT_MATCH).click();
        buttonByName(fixture, PREVIOUS_MATCH).click();

        expect(document.activeElement).toBe(searchField());
        expect(buttonByName(fixture, SEARCH_BUTTON).getAttribute('aria-pressed')).toBe('true');
        expect(finder.find).toHaveBeenCalledWith('total', { highlightAll: true });
        expect(text()).toContain('1 / 3');
        expect(finder.findNext).toHaveBeenCalledTimes(1);
        expect(finder.findPrevious).toHaveBeenCalledTimes(1);
    });

    it('closes the search clearing its highlights and focusing its button, and reopens it on the last query', async () => {
        await render({ isSearchable: true });
        await openSearch();
        await typeSearch('total');

        buttonByName(fixture, CLOSE_SEARCH).click();
        await settle(fixture);

        expect(searchField()).toBeNull();
        expect(finder.find).toHaveBeenLastCalledWith('', { highlightAll: true });
        expect(document.activeElement).toBe(buttonByName(fixture, SEARCH_BUTTON));

        await openSearch();

        expect(searchField()?.value).toBe('total');
        expect(finder.find).toHaveBeenLastCalledWith('total', { highlightAll: true });
    });

    it('opens the search with Ctrl+F or Cmd+F inside a searchable viewer, focusing the document on a click for it', async () => {
        await render({ isSearchable: true });
        frame().click();

        expect(document.activeElement).toBe(frame());

        const shortcut = pressInFrame({ ctrlKey: true, key: 'f' });

        await settle(fixture);

        expect(shortcut.defaultPrevented).toBe(true);
        expect(searchField()).not.toBeNull();

        pressInFrame({ key: 'f', metaKey: true });
        await settle(fixture);

        expect(document.activeElement).toBe(searchField());
    });

    it('leaves Ctrl+F and the focus to the page when the viewer is not searchable', async () => {
        await render();
        frame().click();

        expect(pressInFrame({ ctrlKey: true, key: 'f' }).defaultPrevented).toBe(false);
        expect(document.activeElement).not.toBe(frame());
        expect(queryButton(fixture, SEARCH_BUTTON)).toBeNull();
    });

    it('searches a new document again while the search is open, and not once it is closed', async () => {
        await render({ isSearchable: true });
        await openSearch();
        await typeSearch('total');

        pdfViewer().triggerEventHandler('pdfLoaded', { pagesCount: 2 });

        expect(finder.find).toHaveBeenCalledTimes(2);

        buttonByName(fixture, CLOSE_SEARCH).click();
        await settle(fixture);
        pdfViewer().triggerEventHandler('pdfLoaded', { pagesCount: 2 });

        expect(finder.find).toHaveBeenCalledTimes(3);
    });

    it('renders the text layer for a searchable viewer and leaves it to pdf.js otherwise', async () => {
        await render({ isSearchable: true });

        expect(pdfViewer().properties['textLayer']).toBe(true);

        await render();

        expect(pdfViewer().properties['textLayer']).toBeUndefined();
        expect(finder.find).not.toHaveBeenCalled();
    });
});
