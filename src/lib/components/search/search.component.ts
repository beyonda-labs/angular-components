import { Component, ElementRef, HostListener, inject, Input, OnDestroy } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faFilter, faMagnifyingGlass, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, Subject, Subscription } from 'rxjs';

import { ButtonComponent } from '../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../internal/button/models/button-config.model';
import { SearchConfig, SearchField, SearchFieldOption, SearchFieldType } from './models/search.model';
import {
    BooleanFilter,
    BooleanFilterOperator,
    NumberFilter,
    NumberFilterOperator,
    SearchFilter,
    SearchFilterOperator,
    StringFilter,
    StringFilterOperator
} from './models/search-filter.model';

const DEFAULT_PLACEHOLDER = 'angular-components.search.placeholder';
const SEARCH_DEBOUNCE_MS = 300;

interface SearchDraftRow {
    fieldKey: string;
    operator: SearchFilterOperator | '';
    value: string;
    valueTo: string;
}

@Component({
    imports: [ButtonComponent, FontAwesomeModule, TranslateModule],
    selector: 'bey-search',
    standalone: true,
    styleUrls: ['./search.component.css'],
    templateUrl: './search.component.html'
})
export class SearchComponent implements OnDestroy {
    @Input({ required: true }) config!: SearchConfig;

    appliedFilters: SearchFilter[] = [];
    panelOpen = false;
    rows: SearchDraftRow[] = [];
    searchTerm = '';

    readonly addIcon = faPlus;
    readonly chevronIcon = faChevronDown;
    readonly fieldTypes = SearchFieldType;
    readonly filterIcon = faFilter;
    readonly removeIcon = faXmark;
    readonly searchIcon = faMagnifyingGlass;

    private readonly elementRef = inject(ElementRef<HTMLElement>);
    private readonly searchTerm$ = new Subject<void>();
    private readonly searchTermSubscription: Subscription;

    constructor() {
        this.searchTermSubscription = this.searchTerm$.pipe(debounceTime(SEARCH_DEBOUNCE_MS)).subscribe(() => {
            this.syncMainRow();
            this.applyRows(false);
        });
    }

    ngOnDestroy(): void {
        this.searchTermSubscription.unsubscribe();
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (this.panelOpen && !(this.elementRef.nativeElement as HTMLElement).contains(event.target as Node)) {
            this.panelOpen = false;
        }
    }

    get addButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.addRow(),
            icon: this.addIcon,
            label: 'angular-components.search.add',
            type: ButtonType.Secondary
        });
    }

    get applyButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.applyFilters(),
            label: 'angular-components.search.apply',
            type: ButtonType.Primary
        });
    }

    get clearButton(): ButtonConfig {
        return new ButtonConfig({
            action: () => this.clearFilters(),
            label: 'angular-components.search.clear',
            type: ButtonType.Secondary
        });
    }

    addRow(): void {
        this.rows = [...this.rows, { fieldKey: '', operator: '', value: '', valueTo: '' }];
    }

    applyFilters(): void {
        this.applyRows(true);
        this.syncSearchTermFromMainRow();
    }

    clearFilters(): void {
        this.rows = [];
        this.appliedFilters = [];
        this.searchTerm = '';
        this.emitFilters();
    }

    getFieldLabel(field: SearchField): string {
        return `${this.config.prefix}.fields.${field.key}`;
    }

    getFieldOptions(row: SearchDraftRow): SearchFieldOption[] {
        return this.getField(row)?.options ?? [];
    }

    getOperatorLabel(operator: SearchFilterOperator): string {
        return `angular-components.search.operators.${operator}`;
    }

    getOperators(row: SearchDraftRow): SearchFilterOperator[] {
        return this.getField(row)?.getOperators() ?? [];
    }

    getPlaceholder(): string {
        return this.config.placeholder ?? DEFAULT_PLACEHOLDER;
    }

    getRowType(row: SearchDraftRow): SearchFieldType | null {
        return this.getField(row)?.type ?? null;
    }

    isBetween(row: SearchDraftRow): boolean {
        return row.operator === SearchFilterOperator.Between;
    }

    onFieldChange(index: number, event: Event): void {
        const fieldKey = (event.target as HTMLSelectElement).value;
        const field = this.config.fields.find(current => current.key === fieldKey);

        this.rows[index] = {
            fieldKey,
            operator: field ? field.getOperators()[0] : '',
            value: '',
            valueTo: ''
        };
        this.rows = [...this.rows];
    }

    onOperatorChange(index: number, event: Event): void {
        const operator = (event.target as HTMLSelectElement).value as SearchFilterOperator;

        this.rows[index] = { ...this.rows[index], operator, valueTo: '' };
        this.rows = [...this.rows];
    }

    onSearchTermChange(event: Event): void {
        this.searchTerm = (event.target as HTMLInputElement).value;
        this.searchTerm$.next();
    }

    onValueChange(index: number, event: Event): void {
        this.rows[index] = { ...this.rows[index], value: (event.target as HTMLInputElement).value };
        this.rows = [...this.rows];
    }

    onValueToChange(index: number, event: Event): void {
        this.rows[index] = { ...this.rows[index], valueTo: (event.target as HTMLInputElement).value };
        this.rows = [...this.rows];
    }

    removeRow(index: number): void {
        this.rows = this.rows.filter((_, currentIndex) => currentIndex !== index);
    }

    togglePanel(): void {
        this.panelOpen = !this.panelOpen;
    }

    private applyRows(closePanel: boolean): void {
        this.appliedFilters = this.rows.filter(row => this.isRowValid(row)).map(row => this.toFilter(row));

        if (closePanel) {
            this.panelOpen = false;
        }

        this.emitFilters();
    }

    private emitFilters(): void {
        this.config.onFiltersChange?.([...this.appliedFilters]);
    }

    private getMainRow(): SearchDraftRow | undefined {
        return this.config.mainField ? this.rows.find(row => row.fieldKey === this.config.mainField) : undefined;
    }

    private syncMainRow(): void {
        const { mainField } = this.config;

        if (!mainField) {
            return;
        }

        const term = this.searchTerm.trim();
        const index = this.rows.findIndex(row => row.fieldKey === mainField);

        if (!term) {
            if (index !== -1) {
                this.rows = this.rows.filter((_, currentIndex) => currentIndex !== index);
            }

            return;
        }

        if (index === -1) {
            const field = this.config.fields.find(current => current.key === mainField);

            this.rows = [
                ...this.rows,
                { fieldKey: mainField, operator: field?.getOperators()[0] ?? '', value: term, valueTo: '' }
            ];

            return;
        }

        this.rows[index] = { ...this.rows[index], value: term };
        this.rows = [...this.rows];
    }

    private syncSearchTermFromMainRow(): void {
        if (!this.config.mainField) {
            return;
        }

        const mainRow = this.getMainRow();
        const rowType = mainRow ? this.getRowType(mainRow) : null;
        const isDropdownType = rowType === SearchFieldType.Boolean || rowType === SearchFieldType.Select;

        this.searchTerm = mainRow && !isDropdownType ? mainRow.value : '';
    }

    private getField(row: SearchDraftRow): SearchField | undefined {
        return this.config.fields.find(current => current.key === row.fieldKey);
    }

    private isNumeric(value: string): boolean {
        return value.trim().length > 0 && !Number.isNaN(Number(value));
    }

    private isRowValid(row: SearchDraftRow): boolean {
        const field = this.getField(row);

        if (!field || !row.operator) {
            return false;
        }

        switch (field.type) {
            case SearchFieldType.Boolean:
                return row.value === 'true' || row.value === 'false';

            case SearchFieldType.Number:
                if (this.isBetween(row)) {
                    return this.isNumeric(row.value) && this.isNumeric(row.valueTo);
                }

                return this.isNumeric(row.value);

            default:
                return row.value.trim().length > 0;
        }
    }

    private toFilter(row: SearchDraftRow): SearchFilter {
        const field = this.getField(row)!;

        switch (field.type) {
            case SearchFieldType.Boolean:
                return new BooleanFilter({
                    field: field.key,
                    operator: row.operator as BooleanFilterOperator,
                    value: row.value === 'true'
                });

            case SearchFieldType.Number:
                return new NumberFilter({
                    field: field.key,
                    operator: row.operator as NumberFilterOperator,
                    value: this.isBetween(row) ? [Number(row.value), Number(row.valueTo)] : Number(row.value)
                });

            default:
                return new StringFilter({
                    field: field.key,
                    operator: row.operator as StringFilterOperator,
                    value: row.value.trim()
                });
        }
    }
}
