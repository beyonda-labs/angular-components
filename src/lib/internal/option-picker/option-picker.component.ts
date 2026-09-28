import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    HostListener,
    inject,
    input,
    linkedSignal,
    output,
    Renderer2,
    signal
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { OptionPickerOption } from './models/option-picker-option.model';

const PANEL_MAX_HEIGHT_PX = 256;
const PANEL_GAP_PX = 4;

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, TooltipModule, TranslateModule],
    selector: 'bey-option-picker',
    standalone: true,
    styleUrls: ['./option-picker.component.css'],
    templateUrl: './option-picker.component.html'
})
export class OptionPickerComponent {
    readonly anchor = input.required<HTMLElement>();
    readonly options = input.required<OptionPickerOption[]>();
    readonly searchable = input(true);

    readonly closed = output<void>();
    readonly selected = output<OptionPickerOption>();

    readonly visibleOptions = computed(() => {
        const term = this.searchTerm().trim().toLowerCase();

        return term
            ? this.options().filter(
                  option => option.value.toLowerCase().includes(term) || option.label.toLowerCase().includes(term)
              )
            : this.options();
    });
    readonly activeIndex = linkedSignal({ source: this.visibleOptions, computation: () => 0 });
    readonly closeIcon = faXmark;
    readonly isFiltering = computed(() => this.searchTerm().trim().length > 0);
    readonly searchIcon = faMagnifyingGlass;
    readonly searchTerm = signal('');

    private readonly onAncestorScroll = (event: Event): void => {
        if (!this.elementRef.nativeElement.contains(event.target as Node)) {
            this.closed.emit();
        }
    };
    private readonly onWindowResize = (): void => this.position();

    private readonly destroyRef = inject(DestroyRef);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly renderer = inject(Renderer2);

    constructor() {
        afterNextRender(() => {
            this.renderer.appendChild(document.body, this.elementRef.nativeElement);
            this.position();
            window.addEventListener('resize', this.onWindowResize);
            document.addEventListener('scroll', this.onAncestorScroll, { capture: true });
        });

        this.destroyRef.onDestroy(() => {
            window.removeEventListener('resize', this.onWindowResize);
            document.removeEventListener('scroll', this.onAncestorScroll, { capture: true });
        });
    }

    indent(option: OptionPickerOption): number {
        return this.isFiltering() ? 0 : (option.depth ?? 0);
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        const target = event.target as Node;

        if (!this.elementRef.nativeElement.contains(target) && !this.anchor().contains(target)) {
            this.closed.emit();
        }
    }

    @HostListener('keydown', ['$event'])
    onKeydown(event: KeyboardEvent): void {
        const options = this.visibleOptions();

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.activeIndex.update(index => Math.min(index + 1, options.length - 1));
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.activeIndex.update(index => Math.max(index - 1, 0));
                break;
            case 'Enter':
                event.preventDefault();

                if (options[this.activeIndex()]) {
                    this.selectOption(options[this.activeIndex()]);
                }

                break;
            case 'Escape':
                event.preventDefault();
                this.closed.emit();
                break;
            default:
                break;
        }
    }

    onSearchTermChange(event: Event): void {
        this.searchTerm.set((event.target as HTMLInputElement).value);
    }

    selectOption(option: OptionPickerOption): void {
        if (option.isDisabled) {
            return;
        }

        this.selected.emit(option);
    }

    private position(): void {
        const rect = this.anchor().getBoundingClientRect();
        const element = this.elementRef.nativeElement;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const opensAbove = spaceBelow < PANEL_MAX_HEIGHT_PX && spaceAbove > spaceBelow;

        this.renderer.setStyle(element, 'left', `${rect.left}px`);
        this.renderer.setStyle(element, 'width', `${rect.width}px`);
        this.renderer.setStyle(
            element,
            '--bey-option-picker-max-height',
            `${Math.min(PANEL_MAX_HEIGHT_PX, (opensAbove ? spaceAbove : spaceBelow) - PANEL_GAP_PX)}px`
        );

        if (opensAbove) {
            this.renderer.setStyle(element, 'top', 'auto');
            this.renderer.setStyle(element, 'bottom', `${window.innerHeight - rect.top + PANEL_GAP_PX}px`);
        } else {
            this.renderer.setStyle(element, 'bottom', 'auto');
            this.renderer.setStyle(element, 'top', `${rect.bottom + PANEL_GAP_PX}px`);
        }
    }
}
