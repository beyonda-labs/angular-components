import { Component, EventEmitter, Input, Output } from '@angular/core';
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
    imports: [NgxExtendedPdfViewerModule],
    selector: 'bey-pdf-viewer',
    standalone: true,
    styleUrls: ['./pdf-viewer.component.css'],
    templateUrl: './pdf-viewer.component.html'
})
export class PdfViewerComponent {
    @Input({ required: true })
    set config(value: PdfViewerConfig) {
        this._config = value;
        this.currentPage = value.page;
        this.currentRotation = value.rotation;
        this.currentZoom = value.zoom;
    }

    get config(): PdfViewerConfig {
        return this._config;
    }

    @Output() loaded = new EventEmitter<PdfViewerLoaded>();
    @Output() loadingFailed = new EventEmitter<PdfViewerLoadingFailed>();
    @Output() pageChange = new EventEmitter<number>();
    @Output() pageRendered = new EventEmitter<PdfViewerPageRendered>();
    @Output() rotationChange = new EventEmitter<PdfViewerRotationChange>();
    @Output() viewerClick = new EventEmitter<MouseEvent>();
    @Output() zoomChange = new EventEmitter<number>();

    currentPage = 1;
    currentRotation: PdfViewerRotation = 0;
    currentZoom: PdfViewerZoom = 'auto';

    private _config!: PdfViewerConfig;

    get zoomInput(): PdfViewerZoom {
        return typeof this.currentZoom === 'number' ? this.currentZoom * 100 : this.currentZoom;
    }

    goToPage(page: number): void {
        this.currentPage = page;
    }

    rotate(rotation: PdfViewerRotation): void {
        this.currentRotation = rotation;
    }

    setZoom(zoom: PdfViewerZoom): void {
        this.currentZoom = zoom;
    }

    onContainerClick(event: MouseEvent): void {
        this.viewerClick.emit(event);
    }

    onPageChange(page?: number): void {
        if (page === undefined) {
            return;
        }

        this.currentPage = page;
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
        this.currentRotation = rotation;
        this.rotationChange.emit({ rotation });
    }

    onZoomFactorChange(zoomFactor: number): void {
        this.zoomChange.emit(zoomFactor);
    }

    onZoomModelChange(zoom?: string | number): void {
        if (zoom === undefined) {
            return;
        }

        this.currentZoom = (typeof zoom === 'number' ? zoom / 100 : zoom) as PdfViewerZoom;
    }
}
