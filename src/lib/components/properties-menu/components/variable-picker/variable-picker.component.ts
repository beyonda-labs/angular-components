import { Component, ElementRef, EventEmitter, HostListener, inject, Input, OnChanges, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyVariable } from '../../models/property-variable.model';

interface VariableRow {
    depth: number;
    variable: PropertyVariable;
}

@Component({
    imports: [FontAwesomeModule, TranslateModule],
    selector: 'bey-variable-picker',
    standalone: true,
    styleUrls: ['./variable-picker.component.css'],
    templateUrl: './variable-picker.component.html'
})
export class VariablePickerComponent implements OnChanges {
    @Input({ required: true }) variables: PropertyVariable[] = [];
    @Input() searchable = true;

    @Output() closed = new EventEmitter<void>();
    @Output() selected = new EventEmitter<PropertyVariable>();

    activeIndex = 0;
    searchTerm = '';

    readonly closeIcon = faXmark;
    readonly searchIcon = faMagnifyingGlass;

    private readonly elementRef = inject(ElementRef<HTMLElement>);

    private rows: VariableRow[] = [];

    ngOnChanges(): void {
        this.rows = this.buildRows();
        this.activeIndex = 0;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!(this.elementRef.nativeElement as HTMLElement).contains(event.target as Node)) {
            this.closed.emit();
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
