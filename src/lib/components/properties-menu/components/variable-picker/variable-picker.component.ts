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

import { PropertyVariable } from '../../models/property-variable.model';

// Matches the CSS default for --bey-variable-picker-max-height (variable-picker.component.css) — used
// as the assumed panel height when deciding whether to flip above the anchor, since content changes as
// the user types a search term.
const PANEL_MAX_HEIGHT_PX = 256;

interface VariableRow {
    depth: number;
    variable: PropertyVariable;
}

// Positioned relative to a `position: relative` wrapper, `bey-variable-picker` used to be clipped by
// any scrollable/overflow ancestor (e.g. a modal body) instead of floating above it like a native
// `<select>` or an ngx-bootstrap tooltip does. Since this repo has neither Angular CDK Overlay nor
// ngx-bootstrap's dropdown module wired up, this replicates the same trick tooltips use under the
// hood (`container="body"`): move the host node to `<body>` and position it with `fixed` coordinates
// computed from the trigger element's own rect, so it escapes every ancestor's overflow/stacking
// context regardless of where it's opened from.
@Component({
    imports: [FontAwesomeModule, TranslateModule],
    selector: 'bey-variable-picker',
    standalone: true,
    styleUrls: ['./variable-picker.component.css'],
    templateUrl: './variable-picker.component.html'
})
export class VariablePickerComponent implements AfterViewInit, OnChanges, OnDestroy {
    @Input({ required: true }) anchor!: HTMLElement;
    @Input({ required: true }) variables: PropertyVariable[] = [];
    @Input() searchable = true;

    @Output() closed = new EventEmitter<void>();
    @Output() selected = new EventEmitter<PropertyVariable>();

    activeIndex = 0;
    searchTerm = '';

    readonly closeIcon = faXmark;
    readonly searchIcon = faMagnifyingGlass;

    private readonly elementRef = inject(ElementRef<HTMLElement>);
    private readonly renderer = inject(Renderer2);

    private rows: VariableRow[] = [];
    private readonly onWindowResize = (): void => this.position();
    // Scrolling the picker's own option list also fires a (non-bubbling) scroll event caught by this
    // same capture-phase listener — only an *ancestor* scrolling should close the picker.
    private readonly onAncestorScroll = (event: Event): void => {
        if (!(this.elementRef.nativeElement as HTMLElement).contains(event.target as Node)) {
            this.closed.emit();
        }
    };

    ngOnChanges(): void {
        this.rows = this.buildRows();
        this.activeIndex = 0;
    }

    ngAfterViewInit(): void {
        this.renderer.appendChild(document.body, this.elementRef.nativeElement);
        this.position();

        window.addEventListener('resize', this.onWindowResize);
        // `capture: true` so scrolling any ancestor (e.g. a modal body), not just the window, closes
        // the picker — scroll events don't bubble, so this is the only way to hear about them.
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

    // Flips above the anchor when there isn't enough room below (and there's more room above) — the
    // panel's max-height (see variable-picker.component.css) is used as the assumed height rather than
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
            '--bey-variable-picker-max-height',
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

    @HostListener('keydown', ['$event'])
    onKeydown(event: KeyboardEvent): void {
        const rows = this.visibleRows;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.activeIndex = Math.min(this.activeIndex + 1, rows.length - 1);
                break;

            case 'ArrowUp':
                event.preventDefault();
                this.activeIndex = Math.max(this.activeIndex - 1, 0);
                break;

            case 'Enter':
                event.preventDefault();

                if (rows[this.activeIndex]) {
                    this.selectVariable(rows[this.activeIndex].variable);
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

    get visibleRows(): VariableRow[] {
        const term = this.searchTerm.trim().toLowerCase();

        if (!term) {
            return this.rows;
        }

        return this.flatten(this.variables).filter(
            row => row.variable.path.toLowerCase().includes(term) || row.variable.label.toLowerCase().includes(term)
        );
    }

    onSearchTermChange(event: Event): void {
        this.searchTerm = (event.target as HTMLInputElement).value;
        this.activeIndex = 0;
    }

    selectVariable(variable: PropertyVariable): void {
        this.selected.emit(variable);
    }

    trackRow(_index: number, row: VariableRow): string {
        return row.variable.id;
    }

    private buildRows(): VariableRow[] {
        return this.flattenHierarchical(this.variables, 0);
    }

    private flattenHierarchical(variables: PropertyVariable[], depth: number): VariableRow[] {
        return variables.reduce<VariableRow[]>(
            (rows, variable) => [
                ...rows,
                { depth, variable },
                ...this.flattenHierarchical(variable.children, depth + 1)
            ],
            []
        );
    }

    private flatten(variables: PropertyVariable[]): VariableRow[] {
        return variables.reduce<VariableRow[]>(
            (rows, variable) => [...rows, { depth: 0, variable }, ...this.flatten(variable.children)],
            []
        );
    }
}
