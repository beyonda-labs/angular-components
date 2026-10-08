import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    input,
    linkedSignal,
    signal,
    viewChild
} from '@angular/core';
import {
    FindResultMatchesCount,
    NgxExtendedPdfViewerModule,
    NgxExtendedPdfViewerService,
    PageRenderedEvent,
    PdfLoadedEvent
} from 'ngx-extended-pdf-viewer';

import { PdfViewerSearchComponent } from './components/pdf-viewer-search/pdf-viewer-search.component';
import { PdfViewerToolbarComponent } from './components/pdf-viewer-toolbar/pdf-viewer-toolbar.component';
import { downloadPdf } from './functions/pdf-download';
import { PdfViewerConfig, PdfViewerHandle } from './models/pdf-viewer-config.model';
import {
    NO_SEARCH_MATCHES,
    PdfViewerRotation,
    PdfViewerSearchMatches,
    PdfViewerToolbar,
    PdfViewerZoom
} from './models/pdf-viewer-value.model';

const DEFAULT_FILE_NAME = 'document.pdf';
const PERCENT = 100;

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgxExtendedPdfViewerModule, PdfViewerSearchComponent, PdfViewerToolbarComponent],
    selector: 'bey-pdf-viewer',
    standalone: true,
    styleUrls: ['./pdf-viewer.component.css'],
    templateUrl: './pdf-viewer.component.html'
})
export class PdfViewerComponent {
    private readonly pdfViewerService = inject(NgxExtendedPdfViewerService);

    readonly config = input.required<PdfViewerConfig>();

    readonly currentPage = linkedSignal(() => this.config().page);
    readonly currentRotation = linkedSignal<PdfViewerRotation>(() => this.config().rotation);
    readonly currentZoom = linkedSignal<PdfViewerZoom>(() => this.config().zoom);
    readonly handle: PdfViewerHandle = {
        currentPage: () => this.currentPage(),
        currentRotation: () => this.currentRotation(),
        currentZoom: () => this.currentZoom(),
        goToPage: page => this.currentPage.set(page),
        rotate: rotation => this.currentRotation.set(rotation),
        setZoom: zoom => this.currentZoom.set(zoom)
    };
    readonly hasCompactToolbar = computed(() => this.config().toolbar === PdfViewerToolbar.Compact);
    readonly hasFullToolbar = computed(() => this.config().toolbar === PdfViewerToolbar.Full);
    readonly hasSearch = computed(() => this.hasCompactToolbar() && this.config().isSearchable);
    readonly isSearchOpen = signal(false);
    readonly pagesCount = linkedSignal({ computation: () => 0, source: this.config });
    readonly searchMatches = linkedSignal<PdfViewerConfig, PdfViewerSearchMatches>({
        computation: () => NO_SEARCH_MATCHES,
        source: this.config
    });
    readonly searchQuery = signal('');
    readonly textLayer = computed(() => (this.config().isSearchable ? true : undefined));
    readonly zoomFactor = linkedSignal(() => toZoomFactor(this.config().zoom));
    readonly zoomInput = computed<PdfViewerZoom>(() => {
        const zoom = this.currentZoom();

        return typeof zoom === 'number' ? zoom * PERCENT : zoom;
    });

    private readonly frame = viewChild<ElementRef<HTMLElement>>('frame');
    private readonly searchPanel = viewChild(PdfViewerSearchComponent);
    private readonly toolbar = viewChild(PdfViewerToolbarComponent);

    constructor() {
        effect(() => this.config().onReady?.(this.handle));
    }

    closeSearch(): void {
        this.isSearchOpen.set(false);
        this.searchMatches.set(NO_SEARCH_MATCHES);

        if (this.searchQuery()) {
            this.pdfViewerService.find('', { highlightAll: true });
        }

        this.toolbar()?.focusSearchButton();
    }

    onContainerClick(event: MouseEvent): void {
        if (this.hasSearch()) {
            this.frame()?.nativeElement.focus({ preventScroll: true });
        }

        this.config().onClick?.(event);
    }

    onDownload(): void {
        const { filenameForDownload, src } = this.config();

        downloadPdf(src, filenameForDownload ?? DEFAULT_FILE_NAME);
    }

    onFindMatchesCount({ current, total }: FindResultMatchesCount): void {
        this.searchMatches.set({ current, total });
    }

    onKeydown(event: KeyboardEvent): void {
        if (this.hasSearch() && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
            event.preventDefault();
            this.openSearch();
        }
    }

    onPageChange(page?: number): void {
        if (page === undefined) {
            return;
        }

        this.currentPage.set(page);
        this.config().onPageChange?.(page);
    }

    onPageRendered(event: PageRenderedEvent): void {
        this.config().onPageRendered?.({ pageNumber: event.pageNumber });
    }

    onPdfLoaded(event: PdfLoadedEvent): void {
        this.pagesCount.set(event.pagesCount);
        this.config().onLoaded?.({ pagesCount: event.pagesCount });

        if (this.isSearchOpen() && this.searchQuery()) {
            this.search();
        }
    }

    onPdfLoadingFailed(error: Error): void {
        this.config().onLoadingFailed?.({ error });
    }

    onRotationChange(rotation: PdfViewerRotation): void {
        this.currentRotation.set(rotation);
        this.config().onRotationChange?.({ rotation });
    }

    onSearchChange(query: string): void {
        this.searchQuery.set(query);
        this.search();
    }

    onSearchNext(): void {
        this.pdfViewerService.findNext();
    }

    onSearchPrevious(): void {
        this.pdfViewerService.findPrevious();
    }

    onSearchToggle(): void {
        if (this.isSearchOpen()) {
            this.closeSearch();
        } else {
            this.openSearch();
        }
    }

    onToolbarPageChange(page: number): void {
        this.currentPage.set(page);
    }

    onToolbarZoomChange(zoom: number): void {
        this.zoomFactor.set(zoom);
        this.currentZoom.set(zoom);
    }

    onZoomFactorChange(zoomFactor: number): void {
        this.zoomFactor.set(zoomFactor);
        this.config().onZoomChange?.(zoomFactor);
    }

    onZoomModelChange(zoom?: string | number): void {
        if (zoom === undefined) {
            return;
        }

        this.currentZoom.set((typeof zoom === 'number' ? zoom / PERCENT : zoom) as PdfViewerZoom);
    }

    private openSearch(): void {
        if (this.isSearchOpen()) {
            this.searchPanel()?.focusField();

            return;
        }

        this.isSearchOpen.set(true);

        if (this.searchQuery()) {
            this.search();
        }
    }

    private search(): void {
        if (!this.searchQuery()) {
            this.searchMatches.set(NO_SEARCH_MATCHES);
        }

        this.pdfViewerService.find(this.searchQuery(), { highlightAll: true });
    }
}

function toZoomFactor(zoom: PdfViewerZoom): number {
    return typeof zoom === 'number' ? zoom : 1;
}
