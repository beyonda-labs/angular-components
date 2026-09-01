import { DecimalPipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
    faArrowRotateLeft,
    faArrowRotateRight,
    faChevronLeft,
    faChevronRight,
    faMagnifyingGlassMinus,
    faMagnifyingGlassPlus
} from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { PdfViewerConfig } from '../../models/pdf-viewer-config.model';
import { PdfViewerComponent } from '../../pdf-viewer.component';
import { PdfViewerLoaded, PdfViewerLoadingFailed, PdfViewerPageRendered, PdfViewerRotationChange } from '../../types/pdf-viewer-events';

const SAMPLE_PDF_URL = 'https://raw.githubusercontent.com/mozilla/pdf.js/master/test/pdfs/tracemonkey.pdf';

@Component({
    imports: [DecimalPipe, FontAwesomeModule, PdfViewerComponent, TranslateModule],
    selector: 'bey-pdf-viewer-style-guide',
    standalone: true,
    styleUrls: ['../../../style-guide/style-guide.component.css', './pdf-viewer-style-guide.component.css'],
    templateUrl: './pdf-viewer-style-guide.component.html'
})
export class PdfViewerStyleGuideComponent {
    @ViewChild(PdfViewerComponent) pdfViewer!: PdfViewerComponent;

    readonly config = new PdfViewerConfig({ src: SAMPLE_PDF_URL, showToolbar: false });

    readonly nextIcon = faChevronRight;
    readonly prevIcon = faChevronLeft;
    readonly rotateLeftIcon = faArrowRotateLeft;
    readonly rotateRightIcon = faArrowRotateRight;
    readonly zoomInIcon = faMagnifyingGlassPlus;
    readonly zoomOutIcon = faMagnifyingGlassMinus;

    lastLoaded: PdfViewerLoaded | null = null;
    lastLoadingFailed: PdfViewerLoadingFailed | null = null;
    lastPageRendered: PdfViewerPageRendered | null = null;
    lastRotationChange: PdfViewerRotationChange | null = null;
    lastZoomFactor: number | null = null;
    pageCount = 0;

    get currentPage(): number {
        return this.pdfViewer?.currentPage ?? 1;
    }

    goToNextPage(): void {
        this.pdfViewer.goToPage(this.currentPage + 1);
    }

    goToPreviousPage(): void {
        this.pdfViewer.goToPage(this.currentPage - 1);
    }

    onLoaded(event: PdfViewerLoaded): void {
        this.lastLoaded = event;
        this.pageCount = event.pagesCount;
    }

    onLoadingFailed(event: PdfViewerLoadingFailed): void {
        this.lastLoadingFailed = event;
    }

    onPageRendered(event: PdfViewerPageRendered): void {
        this.lastPageRendered = event;
    }

    onRotationChange(event: PdfViewerRotationChange): void {
        this.lastRotationChange = event;
    }

    onZoomChange(zoomFactor: number): void {
        this.lastZoomFactor = zoomFactor;
    }

    rotateLeft(): void {
        this.pdfViewer.rotate(this.rotationMinus90());
    }

    rotateRight(): void {
        this.pdfViewer.rotate(this.rotationPlus90());
    }

    zoomIn(): void {
        this.lastZoomFactor = (this.lastZoomFactor ?? 1) + 0.25;
        this.pdfViewer.setZoom(this.lastZoomFactor);
    }

    zoomOut(): void {
        this.lastZoomFactor = Math.max(0.25, (this.lastZoomFactor ?? 1) - 0.25);
        this.pdfViewer.setZoom(this.lastZoomFactor);
    }

    private rotationMinus90(): 0 | 90 | 180 | 270 {
        return ((this.pdfViewer.currentRotation + 270) % 360) as 0 | 90 | 180 | 270;
    }

    private rotationPlus90(): 0 | 90 | 180 | 270 {
        return ((this.pdfViewer.currentRotation + 90) % 360) as 0 | 90 | 180 | 270;
    }
}
