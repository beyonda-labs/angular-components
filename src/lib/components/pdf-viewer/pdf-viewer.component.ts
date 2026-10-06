import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    input,
    linkedSignal,
    signal
} from '@angular/core';
import {
    FindResultMatchesCount,
    NgxExtendedPdfViewerModule,
    NgxExtendedPdfViewerService,
    PageRenderedEvent,
    PdfLoadedEvent
} from 'ngx-extended-pdf-viewer';

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
    imports: [NgxExtendedPdfViewerModule, PdfViewerToolbarComponent],
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
    readonly pagesCount = linkedSignal({ computation: () => 0, source: this.config });
    readonly searchMatches = linkedSignal<PdfViewerConfig, PdfViewerSearchMatches>({
        computation: () => NO_SEARCH_MATCHES,
        source: this.config
    });
    readonly textLayer = computed(() => (this.config().isSearchable ? true : undefined));
    readonly zoomFactor = linkedSignal(() => toZoomFactor(this.config().zoom));
    readonly zoomInput = computed<PdfViewerZoom>(() => {
        const zoom = this.currentZoom();

        return typeof zoom === 'number' ? zoom * PERCENT : zoom;
    });

    private readonly searchQuery = signal('');

    constructor() {
        effect(() => this.config().onReady?.(this.handle));
    }

    onContainerClick(event: MouseEvent): void {
        this.config().onClick?.(event);
    }

    onDownload(): void {
        const { filenameForDownload, src } = this.config();

        downloadPdf(src, filenameForDownload ?? DEFAULT_FILE_NAME);
    }

    onFindMatchesCount({ current, total }: FindResultMatchesCount): void {
        this.searchMatches.set({ current, total });
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

        if (this.searchQuery()) {
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
