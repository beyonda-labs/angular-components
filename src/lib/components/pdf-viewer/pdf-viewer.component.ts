import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output } from '@angular/core';
import { NgxExtendedPdfViewerModule, PageRenderedEvent, PdfLoadedEvent } from 'ngx-extended-pdf-viewer';

import { PdfViewerConfig } from './models/pdf-viewer-config.model';
import {
    PdfViewerLoaded,
    PdfViewerLoadingFailed,
    PdfViewerPageRendered,
    PdfViewerRotationChange
} from './types/pdf-viewer-events';
import { PdfViewerRotation, PdfViewerZoom } from './types/pdf-viewer-value';

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

    readonly loaded = output<PdfViewerLoaded>();
    readonly loadingFailed = output<PdfViewerLoadingFailed>();
    readonly pageChange = output<number>();
    readonly pageRendered = output<PdfViewerPageRendered>();
    readonly rotationChange = output<PdfViewerRotationChange>();
    readonly viewerClick = output<MouseEvent>();
    readonly zoomChange = output<number>();

    readonly currentPage = linkedSignal(() => this.config().page);
    readonly currentRotation = linkedSignal<PdfViewerRotation>(() => this.config().rotation);
    readonly currentZoom = linkedSignal<PdfViewerZoom>(() => this.config().zoom);

    readonly zoomInput = computed<PdfViewerZoom>(() =>
        typeof this.currentZoom() === 'number' ? (this.currentZoom() as number) * 100 : this.currentZoom()
    );

    goToPage(page: number): void {
        this.currentPage.set(page);
    }

    rotate(rotation: PdfViewerRotation): void {
        this.currentRotation.set(rotation);
    }

    setZoom(zoom: PdfViewerZoom): void {
        this.currentZoom.set(zoom);
    }

    onContainerClick(event: MouseEvent): void {
        this.viewerClick.emit(event);
    }

    onPageChange(page?: number): void {
        if (page === undefined) {
            return;
        }

        this.currentPage.set(page);
        this.pageChange.emit(page);
    }

    onPageRendered(event: PageRenderedEvent): void {
        this.pageRendered.emit({ pageNumber: event.pageNumber });
    }

    onPdfLoaded(event: PdfLoadedEvent): void {
        this.loaded.emit({ pagesCount: event.pagesCount });
    }

    onPdfLoadingFailed(error: Error): void {
        this.loadingFailed.emit({ error });
    }

    onRotationChange(rotation: PdfViewerRotation): void {
        this.currentRotation.set(rotation);
        this.rotationChange.emit({ rotation });
    }

    onZoomFactorChange(zoomFactor: number): void {
        this.zoomChange.emit(zoomFactor);
    }

    onZoomModelChange(zoom?: string | number): void {
        if (zoom === undefined) {
            return;
        }

        this.currentZoom.set((typeof zoom === 'number' ? zoom / 100 : zoom) as PdfViewerZoom);
    }
}
