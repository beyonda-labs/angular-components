import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
    faChevronDown,
    faChevronUp,
    faDownload,
    faMagnifyingGlass,
    faMagnifyingGlassMinus,
    faMagnifyingGlassPlus
} from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../../../internal/button/models/button-config.model';
import { PdfViewerConfig } from '../../models/pdf-viewer-config.model';
import { NO_SEARCH_MATCHES, PdfViewerSearchMatches } from '../../models/pdf-viewer-value.model';

const DOWNLOAD = 'angular-components.pdf-viewer.toolbar.download';
const NEXT_MATCH = 'angular-components.pdf-viewer.toolbar.next-match';
const PERCENT = 100;
const PREVIOUS_MATCH = 'angular-components.pdf-viewer.toolbar.previous-match';
const ZOOM_IN = 'angular-components.pdf-viewer.toolbar.zoom-in';
const ZOOM_OUT = 'angular-components.pdf-viewer.toolbar.zoom-out';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonComponent, FontAwesomeModule, TranslateModule],
    selector: 'bey-pdf-viewer-toolbar',
    standalone: true,
    styleUrls: ['./pdf-viewer-toolbar.component.css'],
    templateUrl: './pdf-viewer-toolbar.component.html'
})
export class PdfViewerToolbarComponent {
    readonly config = input.required<PdfViewerConfig>();
    readonly page = input.required<number>();
    readonly pagesCount = input.required<number>();
    readonly searchMatches = input<PdfViewerSearchMatches>(NO_SEARCH_MATCHES);
    readonly zoom = input.required<number>();

    readonly download = output<void>();
    readonly pageChange = output<number>();
    readonly searchChange = output<string>();
    readonly searchNext = output<void>();
    readonly searchPrevious = output<void>();
    readonly zoomChange = output<number>();

    readonly downloadButton = new ButtonConfig({
        action: () => this.download.emit(),
        ariaLabel: DOWNLOAD,
        icon: faDownload,
        tooltip: DOWNLOAD,
        tooltipPlacement: 'bottom',
        type: ButtonType.IconOutline
    });
    readonly hasMatches = computed(() => this.searchMatches().total > 0);
    readonly hasPages = computed(() => this.pagesCount() > 0);
    readonly nextMatchButton = computed(
        () =>
            new ButtonConfig({
                action: () => this.searchNext.emit(),
                ariaLabel: NEXT_MATCH,
                icon: faChevronDown,
                isDisabled: !this.hasMatches(),
                tooltip: NEXT_MATCH,
                tooltipPlacement: 'bottom',
                type: ButtonType.IconOutline
            })
    );
    readonly previousMatchButton = computed(
        () =>
            new ButtonConfig({
                action: () => this.searchPrevious.emit(),
                ariaLabel: PREVIOUS_MATCH,
                icon: faChevronUp,
                isDisabled: !this.hasMatches(),
                tooltip: PREVIOUS_MATCH,
                tooltipPlacement: 'bottom',
                type: ButtonType.IconOutline
            })
    );
    readonly searchIcon = faMagnifyingGlass;
    readonly searchQuery = signal('');
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

    onSearchInput(field: HTMLInputElement): void {
        this.searchQuery.set(field.value);
        this.searchChange.emit(field.value);
    }

    onSearchKeydown(event: KeyboardEvent, field: HTMLInputElement): void {
        if (event.key === 'Enter') {
            event.preventDefault();

            if (event.shiftKey) {
                this.searchPrevious.emit();
            } else {
                this.searchNext.emit();
            }

            return;
        }

        if (event.key === 'Escape' && field.value) {
            event.preventDefault();
            event.stopPropagation();
            field.value = '';
            this.onSearchInput(field);
        }
    }

    private zoomBy(step: number): void {
        const { maxZoom, minZoom } = this.config();
        const zoom = Math.round((this.zoom() + step) * PERCENT) / PERCENT;

        this.zoomChange.emit(Math.min(maxZoom, Math.max(minZoom, zoom)));
    }
}
