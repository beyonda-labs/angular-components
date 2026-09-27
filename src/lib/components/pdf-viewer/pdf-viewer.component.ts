import { ChangeDetectionStrategy, Component, computed, effect, input, linkedSignal } from '@angular/core';
import { NgxExtendedPdfViewerModule, PageRenderedEvent, PdfLoadedEvent } from 'ngx-extended-pdf-viewer';

import { PdfViewerConfig, PdfViewerHandle } from './models/pdf-viewer-config.model';
import { PdfViewerRotation, PdfViewerZoom } from './models/pdf-viewer-value.model';

const PERCENT = 100;

/** A thin wrapper around ngx-extended-pdf-viewer: the config drives it, the handle moves it, the callbacks report. */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgxExtendedPdfViewerModule],
    selector: 'bey-pdf-viewer',
    standalone: true,
    styleUrls: ['./pdf-viewer.component.css'],
    templateUrl: './pdf-viewer.component.html'
})
export class PdfViewerComponent {
    readonly config = input.required<PdfViewerConfig>();

    readonly currentPage = linkedSignal(() => this.config().page);
    readonly currentRotation = linkedSignal<PdfViewerRotation>(() => this.config().rotation);
    readonly currentZoom = linkedSignal<PdfViewerZoom>(() => this.config().zoom);

    /** The underlying viewer wants a percentage for a fractional zoom and the keywords as they are. */
    readonly zoomInput = computed<PdfViewerZoom>(() => {
        const zoom = this.currentZoom();

        return typeof zoom === 'number' ? zoom * PERCENT : zoom;
    });

    readonly handle: PdfViewerHandle = {
        currentPage: () => this.currentPage(),
        currentRotation: () => this.currentRotation(),
        currentZoom: () => this.currentZoom(),
        goToPage: page => this.currentPage.set(page),
        rotate: rotation => this.currentRotation.set(rotation),
        setZoom: zoom => this.currentZoom.set(zoom)
    };

    constructor() {
        effect(() => this.config().onReady?.(this.handle));
    }

    onContainerClick(event: MouseEvent): void {
        this.config().onClick?.(event);
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
        this.config().onLoaded?.({ pagesCount: event.pagesCount });
    }

    onPdfLoadingFailed(error: Error): void {
        this.config().onLoadingFailed?.({ error });
    }

    onRotationChange(rotation: PdfViewerRotation): void {
        this.currentRotation.set(rotation);
        this.config().onRotationChange?.({ rotation });
    }

    onZoomFactorChange(zoomFactor: number): void {
        this.config().onZoomChange?.(zoomFactor);
    }

    onZoomModelChange(zoom?: string | number): void {
        if (zoom === undefined) {
            return;
        }

        this.currentZoom.set((typeof zoom === 'number' ? zoom / PERCENT : zoom) as PdfViewerZoom);
    }
}
