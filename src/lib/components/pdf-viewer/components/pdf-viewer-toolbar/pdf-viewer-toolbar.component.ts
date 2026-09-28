import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlassMinus, faMagnifyingGlassPlus } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { PdfViewerConfig } from '../../models/pdf-viewer-config.model';

const PERCENT = 100;

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, TranslateModule],
    selector: 'bey-pdf-viewer-toolbar',
    standalone: true,
    styleUrls: ['./pdf-viewer-toolbar.component.css'],
    templateUrl: './pdf-viewer-toolbar.component.html'
})
export class PdfViewerToolbarComponent {
    readonly config = input.required<PdfViewerConfig>();
    readonly page = input.required<number>();
    readonly pagesCount = input.required<number>();
    readonly zoom = input.required<number>();

    readonly pageChange = output<number>();
    readonly zoomChange = output<number>();

    readonly canZoomIn = computed(() => this.zoom() < this.config().maxZoom);
    readonly canZoomOut = computed(() => this.zoom() > this.config().minZoom);
    readonly hasPages = computed(() => this.pagesCount() > 0);
    readonly zoomInIcon = faMagnifyingGlassPlus;
    readonly zoomOutIcon = faMagnifyingGlassMinus;
    readonly zoomPercent = computed(() => Math.round(this.zoom() * PERCENT));

    onPageInput(field: HTMLInputElement): void {
        const requested = Number.parseInt(field.value, 10);

        if (Number.isNaN(requested)) {
            field.value = String(this.page());

            return;
        }

        const page = Math.min(this.pagesCount(), Math.max(1, requested));

        field.value = String(page);

        if (page !== this.page()) {
            this.pageChange.emit(page);
        }
    }

    zoomIn(): void {
        this.zoomBy(this.config().zoomStep);
    }

    zoomOut(): void {
        this.zoomBy(-this.config().zoomStep);
    }

    private zoomBy(step: number): void {
        const { maxZoom, minZoom } = this.config();
        const zoom = Math.round((this.zoom() + step) * PERCENT) / PERCENT;

        this.zoomChange.emit(Math.min(maxZoom, Math.max(minZoom, zoom)));
    }
}
