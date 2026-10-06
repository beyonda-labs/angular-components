import { ChangeDetectionStrategy, Component, computed, ElementRef, input, output, viewChild } from '@angular/core';
import {
    faDownload,
    faMagnifyingGlass,
    faMagnifyingGlassMinus,
    faMagnifyingGlassPlus
} from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../../../internal/button/models/button-config.model';
import { PdfViewerConfig } from '../../models/pdf-viewer-config.model';

const DOWNLOAD = 'angular-components.pdf-viewer.toolbar.download';
const PERCENT = 100;
const SEARCH = 'angular-components.pdf-viewer.toolbar.search';
const SEARCH_TOOLTIP = 'angular-components.pdf-viewer.toolbar.search-tooltip';
const ZOOM_IN = 'angular-components.pdf-viewer.toolbar.zoom-in';
const ZOOM_OUT = 'angular-components.pdf-viewer.toolbar.zoom-out';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonComponent, TranslateModule],
    selector: 'bey-pdf-viewer-toolbar',
    standalone: true,
    styleUrls: ['./pdf-viewer-toolbar.component.css'],
    templateUrl: './pdf-viewer-toolbar.component.html'
})
export class PdfViewerToolbarComponent {
    readonly config = input.required<PdfViewerConfig>();
    readonly isSearchOpen = input(false);
    readonly page = input.required<number>();
    readonly pagesCount = input.required<number>();
    readonly zoom = input.required<number>();

    readonly download = output<void>();
    readonly pageChange = output<number>();
    readonly searchToggle = output<void>();
    readonly zoomChange = output<number>();

    readonly downloadButton = new ButtonConfig({
        action: () => this.download.emit(),
        ariaLabel: DOWNLOAD,
        icon: faDownload,
        tooltip: DOWNLOAD,
        tooltipPlacement: 'bottom',
        type: ButtonType.IconOutline
    });
    readonly hasPages = computed(() => this.pagesCount() > 0);
    readonly searchButton = computed(
        () =>
            new ButtonConfig({
                action: () => this.searchToggle.emit(),
                ariaLabel: SEARCH,
                icon: faMagnifyingGlass,
                isPressed: this.isSearchOpen(),
                tooltip: SEARCH_TOOLTIP,
                tooltipPlacement: 'bottom',
                type: ButtonType.IconOutline
            })
    );
    readonly zoomInButton = computed(
        () =>
            new ButtonConfig({
                action: () => this.zoomBy(this.config().zoomStep),
                ariaLabel: ZOOM_IN,
                icon: faMagnifyingGlassPlus,
                isDisabled: this.zoom() >= this.config().maxZoom,
                tooltip: ZOOM_IN,
                tooltipPlacement: 'bottom',
                type: ButtonType.IconOutline
            })
    );
    readonly zoomOutButton = computed(
        () =>
            new ButtonConfig({
                action: () => this.zoomBy(-this.config().zoomStep),
                ariaLabel: ZOOM_OUT,
                icon: faMagnifyingGlassMinus,
                isDisabled: this.zoom() <= this.config().minZoom,
                tooltip: ZOOM_OUT,
                tooltipPlacement: 'bottom',
                type: ButtonType.IconOutline
            })
    );
    readonly zoomPercent = computed(() => Math.round(this.zoom() * PERCENT));

    private readonly searchButtonHost = viewChild('searchButtonHost', { read: ElementRef });

    focusSearchButton(): void {
        const host = this.searchButtonHost()?.nativeElement as HTMLElement | undefined;

        host?.querySelector('button')?.focus();
    }

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

    private zoomBy(step: number): void {
        const { maxZoom, minZoom } = this.config();
        const zoom = Math.round((this.zoom() + step) * PERCENT) / PERCENT;

        this.zoomChange.emit(Math.min(maxZoom, Math.max(minZoom, zoom)));
    }
}
