import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
    BeyPdfViewerComponent,
    BeyPdfViewerConfig,
    BeyPdfViewerHandle,
    BeyPdfViewerLoadingFailed,
    BeyPdfViewerRotation,
    BeyPdfViewerRotationChange
} from '@beyonda-labs/angular-components';
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

const SAMPLE_PDF_URL = 'https://raw.githubusercontent.com/mozilla/pdf.js/master/test/pdfs/tracemonkey.pdf';
const ZOOM_STEP = 0.25;
const QUARTER_TURN = 90;
const FULL_TURN = 360;

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DecimalPipe, FontAwesomeModule, BeyPdfViewerComponent, TranslateModule],
    selector: 'bey-pdf-viewer-style-guide',
    standalone: true,
    styleUrls: ['../style-guide-shared.css', './pdf-viewer-style-guide.component.css'],
    templateUrl: './pdf-viewer-style-guide.component.html'
})
export class PdfViewerStyleGuideComponent {
    readonly currentPage = signal(1);
    readonly lastLoadingFailed = signal<BeyPdfViewerLoadingFailed | null>(null);
    readonly lastRotationChange = signal<BeyPdfViewerRotationChange | null>(null);
    readonly lastZoomFactor = signal<number | null>(null);
    readonly pageCount = signal(0);

    readonly config = new BeyPdfViewerConfig({
        onLoaded: ({ pagesCount }) => this.pageCount.set(pagesCount),
        onLoadingFailed: event => this.lastLoadingFailed.set(event),
        onPageChange: page => this.currentPage.set(page),
        onReady: handle => (this.viewer = handle),
        onRotationChange: event => this.lastRotationChange.set(event),
        onZoomChange: zoom => this.lastZoomFactor.set(zoom),
        src: SAMPLE_PDF_URL
    });

    readonly nextIcon = faChevronRight;
    readonly prevIcon = faChevronLeft;
    readonly rotateLeftIcon = faArrowRotateLeft;
    readonly rotateRightIcon = faArrowRotateRight;
    readonly zoomInIcon = faMagnifyingGlassPlus;
    readonly zoomOutIcon = faMagnifyingGlassMinus;

    private viewer?: BeyPdfViewerHandle;

    goToNextPage(): void {
        this.goToPage(this.currentPage() + 1);
    }

    goToPreviousPage(): void {
        this.goToPage(this.currentPage() - 1);
    }

    rotateLeft(): void {
        this.rotateBy(-QUARTER_TURN);
    }

    rotateRight(): void {
        this.rotateBy(QUARTER_TURN);
    }

    zoomIn(): void {
        this.zoomTo((this.lastZoomFactor() ?? 1) + ZOOM_STEP);
    }

    zoomOut(): void {
        this.zoomTo(Math.max(ZOOM_STEP, (this.lastZoomFactor() ?? 1) - ZOOM_STEP));
    }

    private goToPage(page: number): void {
        this.currentPage.set(page);
        this.viewer?.goToPage(page);
    }

    private rotateBy(degrees: number): void {
        const current = this.viewer?.currentRotation() ?? 0;

        this.viewer?.rotate(((current + degrees + FULL_TURN) % FULL_TURN) as BeyPdfViewerRotation);
    }

    private zoomTo(zoom: number): void {
        this.lastZoomFactor.set(zoom);
        this.viewer?.setZoom(zoom);
    }
}
