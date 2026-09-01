import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    inject,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    Renderer2
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { FormFieldOption } from '../../../../models/form-field.model';

// Matches the CSS default for --bey-option-picker-max-height (option-picker.component.css) — used as
// the assumed panel height when deciding whether to flip above the anchor, since content changes as the
// user types a search term.
const PANEL_MAX_HEIGHT_PX = 256;

// Floats above every ancestor (modal, scroll container, ...) the same way ngx-bootstrap tooltips do
// via `container="body"` — see variable-picker.component.ts (properties-menu module) for the sibling
// implementation of this same trick. Kept separate rather than shared because this component works
// over plain `FormFieldOption[]` and has no notion of a "variable" entity — the `form` module has no
// business depending on the properties-menu module's domain model just to show a searchable list.
@Component({
    imports: [FontAwesomeModule, TooltipModule, TranslateModule],
    selector: 'bey-form-option-picker',
    standalone: true,
    styleUrls: ['./option-picker.component.css'],
    templateUrl: './option-picker.component.html'
})
export class OptionPickerComponent implements AfterViewInit, OnChanges, OnDestroy {
    @Input({ required: true }) anchor!: HTMLElement;
    @Input({ required: true }) options: FormFieldOption[] = [];
    @Input() searchable = true;

    @Output() closed = new EventEmitter<void>();
    @Output() selected = new EventEmitter<FormFieldOption>();

    activeIndex = 0;
    searchTerm = '';

    readonly closeIcon = faXmark;
    readonly searchIcon = faMagnifyingGlass;

    private readonly elementRef = inject(ElementRef<HTMLElement>);
    private readonly renderer = inject(Renderer2);

    private readonly onWindowResize = (): void => this.position();
    // Scrolling the picker's own option list also fires a (non-bubbling) scroll event caught by this
    // same capture-phase listener — only an *ancestor* scrolling should close the picker.
    private readonly onAncestorScroll = (event: Event): void => {
        if (!(this.elementRef.nativeElement as HTMLElement).contains(event.target as Node)) {
            this.closed.emit();
        }
    };

    ngOnChanges(): void {
        this.activeIndex = 0;
    }

    ngAfterViewInit(): void {
        this.renderer.appendChild(document.body, this.elementRef.nativeElement);
        this.position();

        window.addEventListener('resize', this.onWindowResize);
        document.addEventListener('scroll', this.onAncestorScroll, { capture: true });
    }

    ngOnDestroy(): void {
        window.removeEventListener('resize', this.onWindowResize);
        document.removeEventListener('scroll', this.onAncestorScroll, { capture: true });
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        const target = event.target as Node;

        if (!(this.elementRef.nativeElement as HTMLElement).contains(target) && !this.anchor?.contains(target)) {
            this.closed.emit();
        }
    }

    @HostListener('keydown', ['$event'])
    onKeydown(event: KeyboardEvent): void {
        const options = this.visibleOptions;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.activeIndex = Math.min(this.activeIndex + 1, options.length - 1);
                break;

            case 'ArrowUp':
                event.preventDefault();
                this.activeIndex = Math.max(this.activeIndex - 1, 0);
                break;

            case 'Enter':
                event.preventDefault();

                if (options[this.activeIndex]) {
                    this.selectOption(options[this.activeIndex]);
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

    get visibleOptions(): FormFieldOption[] {
        const term = this.searchTerm.trim().toLowerCase();

        if (!term) {
            return this.options;
        }

        return this.options.filter(
            option => option.value.toLowerCase().includes(term) || option.label.toLowerCase().includes(term)
        );
    }

    onSearchTermChange(event: Event): void {
        this.searchTerm = (event.target as HTMLInputElement).value;
        this.activeIndex = 0;
    }

    selectOption(option: FormFieldOption): void {
        this.selected.emit(option);
    }

    trackOption(_index: number, option: FormFieldOption): string {
        return option.value;
    }

    // Flips above the anchor when there isn't enough room below (and there's more room above) — the
    // panel's max-height (see option-picker.component.css) is used as the assumed height rather than
    // measuring the actual rendered height, since content changes as the user types a search term.
    private position(): void {
        const rect = this.anchor.getBoundingClientRect();
        const element = this.elementRef.nativeElement as HTMLElement;
        const gap = 4;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const opensAbove = spaceBelow < PANEL_MAX_HEIGHT_PX && spaceAbove > spaceBelow;

        this.renderer.setStyle(element, 'left', `${rect.left}px`);
        this.renderer.setStyle(element, 'width', `${rect.width}px`);
        this.renderer.setStyle(
            element,
            '--bey-option-picker-max-height',
            `${Math.min(PANEL_MAX_HEIGHT_PX, (opensAbove ? spaceAbove : spaceBelow) - gap)}px`
        );

        if (opensAbove) {
            this.renderer.setStyle(element, 'top', 'auto');
            this.renderer.setStyle(element, 'bottom', `${window.innerHeight - rect.top + gap}px`);
        } else {
            this.renderer.setStyle(element, 'bottom', 'auto');
            this.renderer.setStyle(element, 'top', `${rect.bottom + gap}px`);
        }
    }
}
