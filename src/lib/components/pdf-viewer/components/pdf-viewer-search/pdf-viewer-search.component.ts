import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    input,
    linkedSignal,
    output,
    viewChild
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faChevronUp, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../../../internal/button/models/button-config.model';
import { NO_SEARCH_MATCHES, PdfViewerSearchMatches } from '../../models/pdf-viewer-value.model';

const CLOSE = 'angular-components.pdf-viewer.search.close';
const NEXT_MATCH = 'angular-components.pdf-viewer.search.next-match';
const PREVIOUS_MATCH = 'angular-components.pdf-viewer.search.previous-match';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonComponent, FontAwesomeModule, TranslateModule],
    selector: 'bey-pdf-viewer-search',
    standalone: true,
    styleUrls: ['./pdf-viewer-search.component.css'],
    templateUrl: './pdf-viewer-search.component.html'
})
export class PdfViewerSearchComponent {
    readonly matches = input<PdfViewerSearchMatches>(NO_SEARCH_MATCHES);
    readonly query = input('');

    readonly dismiss = output<void>();
    readonly next = output<void>();
    readonly previous = output<void>();
    readonly queryChange = output<string>();

    readonly closeButton = new ButtonConfig({
        action: () => this.dismiss.emit(),
        ariaLabel: CLOSE,
        icon: faXmark,
        tooltip: CLOSE,
        tooltipPlacement: 'bottom',
        type: ButtonType.IconOutline
    });
    readonly hasMatches = computed(() => this.matches().total > 0);
    readonly nextButton = computed(
        () =>
            new ButtonConfig({
                action: () => this.next.emit(),
                ariaLabel: NEXT_MATCH,
                icon: faChevronDown,
                isDisabled: !this.hasMatches(),
                tooltip: NEXT_MATCH,
                tooltipPlacement: 'bottom',
                type: ButtonType.IconOutline
            })
    );
    readonly previousButton = computed(
        () =>
            new ButtonConfig({
                action: () => this.previous.emit(),
                ariaLabel: PREVIOUS_MATCH,
                icon: faChevronUp,
                isDisabled: !this.hasMatches(),
                tooltip: PREVIOUS_MATCH,
                tooltipPlacement: 'bottom',
                type: ButtonType.IconOutline
            })
    );
    readonly searchIcon = faMagnifyingGlass;
    readonly typed = linkedSignal(() => this.query());

    private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

    constructor() {
        afterNextRender(() => this.focusField());
    }

    focusField(): void {
        const field = this.field().nativeElement;

        field.focus();
        field.select();
    }

    onFieldKeydown(event: KeyboardEvent): void {
        if (event.key !== 'Enter') {
            return;
        }

        event.preventDefault();

        if (event.shiftKey) {
            this.previous.emit();
        } else {
            this.next.emit();
        }
    }

    onInput(field: HTMLInputElement): void {
        this.typed.set(field.value);
        this.queryChange.emit(field.value);
    }

    onKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            this.dismiss.emit();
        }
    }
}
