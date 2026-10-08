import {
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    HostListener,
    inject,
    input,
    linkedSignal,
    signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faFilter, faMagnifyingGlass, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, Subject } from 'rxjs';

import { ButtonComponent } from '../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../internal/button/models/button-config.model';
import { toKeySegment } from '../../utilities/key-segment';
import { searchFieldOperators } from './functions/search-field-operators';
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonComponent, FontAwesomeModule, TranslateModule],
    selector: 'bey-search',
    standalone: true,
    styleUrls: ['./search.component.css'],
    templateUrl: './search.component.html'
})
export class SearchComponent {
    private readonly elementRef = inject(ElementRef<HTMLElement>);

    readonly config = input.required<SearchConfig>();

    readonly addIcon = faPlus;
    readonly addButton = new ButtonConfig({
        action: () => this.addRow(),
        icon: this.addIcon,
        label: 'angular-components.search.add',
        type: ButtonType.Secondary
    });
    readonly appliedFilters = linkedSignal<SearchFilter[]>(() => [...this.config().filters]);
    readonly applyButton = new ButtonConfig({
        action: () => this.applyFilters(),
        label: 'angular-components.search.apply',
        type: ButtonType.Primary
    });
    readonly chevronIcon = faChevronDown;
    readonly clearButton = new ButtonConfig({
        action: () => this.clearFilters(),
        label: 'angular-components.search.clear',
        type: ButtonType.Secondary
    });
    readonly fieldTypes = SearchFieldType;
    readonly filterIcon = faFilter;
    readonly isPanelOpen = signal(false);
    readonly placeholder = computed(() => this.config().placeholder ?? DEFAULT_PLACEHOLDER);
    readonly removeIcon = faXmark;
    readonly rows = linkedSignal<SearchDraftRow[]>(() => this.config().filters.map(filter => toDraftRow(filter)));
    readonly searchIcon = faMagnifyingGlass;
    readonly searchTerm = linkedSignal(() => findMainTerm(this.config()));

    private readonly searchTerm$ = new Subject<void>();

    constructor() {
        this.searchTerm$.pipe(debounceTime(SEARCH_DEBOUNCE_MS), takeUntilDestroyed()).subscribe(() => {
            this.syncMainRow();
            this.applyRows(false);
        });
    }

    addRow(): void {
        this.rows.update(rows => [...rows, { fieldKey: '', operator: '', value: '', valueTo: '' }]);
    }

    applyFilters(): void {
        this.applyRows(true);
        this.syncSearchTermFromMainRow();
    }

    clearFilters(): void {
        this.rows.set([]);
        this.appliedFilters.set([]);
        this.searchTerm.set('');
        this.emitFilters();
    }

    getFieldLabel(field: SearchField): string {
        return `${this.config().prefix}.fields.${toKeySegment(field.key)}`;
    }

    getFieldOptions(row: SearchDraftRow): SearchFieldOption[] {
        return this.getField(row)?.options ?? [];
    }

    getOperatorLabel(operator: SearchFilterOperator): string {
        return `angular-components.search.operators.${toKeySegment(operator)}`;
    }

    getOperators(row: SearchDraftRow): SearchFilterOperator[] {
        const field = this.getField(row);

        return field ? searchFieldOperators(field) : [];
    }

    getRowType(row: SearchDraftRow): SearchFieldType | null {
        return this.getField(row)?.type ?? null;
    }

    isBetween(row: SearchDraftRow): boolean {
        return row.operator === SearchFilterOperator.Between;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (this.isPanelOpen() && !(this.elementRef.nativeElement as HTMLElement).contains(event.target as Node)) {
            this.isPanelOpen.set(false);
        }
    }

    onFieldChange(index: number, event: Event): void {
        const fieldKey = (event.target as HTMLSelectElement).value;
        const field = this.config().fields.find(current => current.key === fieldKey);

        this.rows.update(rows =>
            rows.map((row, currentIndex) =>
                currentIndex === index
                    ? { fieldKey, operator: field ? searchFieldOperators(field)[0] : '', value: '', valueTo: '' }
                    : row
            )
        );
    }

    onOperatorChange(index: number, event: Event): void {
        const operator = (event.target as HTMLSelectElement).value as SearchFilterOperator;

        this.rows.update(rows =>
            rows.map((row, currentIndex) => (currentIndex === index ? { ...row, operator, valueTo: '' } : row))
        );
    }

    onSearchTermChange(event: Event): void {
        this.searchTerm.set((event.target as HTMLInputElement).value);
        this.searchTerm$.next();
    }

    onValueChange(index: number, event: Event): void {
        const { value } = event.target as HTMLInputElement;

        this.rows.update(rows => rows.map((row, currentIndex) => (currentIndex === index ? { ...row, value } : row)));
    }

    onValueToChange(index: number, event: Event): void {
        const valueTo = (event.target as HTMLInputElement).value;

        this.rows.update(rows => rows.map((row, currentIndex) => (currentIndex === index ? { ...row, valueTo } : row)));
    }

    removeRow(index: number): void {
        this.rows.update(rows => rows.filter((_, currentIndex) => currentIndex !== index));
    }

    togglePanel(): void {
        this.isPanelOpen.update(isOpen => !isOpen);
    }

    private applyRows(closePanel: boolean): void {
        this.appliedFilters.set(
            this.rows()
                .filter(row => this.isRowValid(row))
                .map(row => this.toFilter(row))
        );

        if (closePanel) {
            this.isPanelOpen.set(false);
        }

        this.emitFilters();
    }

    private emitFilters(): void {
        this.config().onFiltersChange?.([...this.appliedFilters()]);
    }

    private getField(row: SearchDraftRow): SearchField | undefined {
        return this.config().fields.find(current => current.key === row.fieldKey);
    }

    private getMainRow(): SearchDraftRow | undefined {
        const { mainField } = this.config();

        return mainField ? this.rows().find(row => row.fieldKey === mainField) : undefined;
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

    private syncMainRow(): void {
        const { mainField } = this.config();

        if (!mainField) {
            return;
        }

        const term = this.searchTerm().trim();
        const index = this.rows().findIndex(row => row.fieldKey === mainField);

        if (!term) {
            if (index !== -1) {
                this.rows.update(rows => rows.filter((_, currentIndex) => currentIndex !== index));
            }

            return;
        }

        if (index === -1) {
            const field = this.config().fields.find(current => current.key === mainField);

            this.rows.update(rows => [
                ...rows,
                { fieldKey: mainField, operator: field ? searchFieldOperators(field)[0] : '', value: term, valueTo: '' }
            ]);

            return;
        }

        this.rows.update(rows =>
            rows.map((row, currentIndex) => (currentIndex === index ? { ...row, value: term } : row))
        );
    }

    private syncSearchTermFromMainRow(): void {
        if (!this.config().mainField) {
            return;
        }

        const mainRow = this.getMainRow();
        const rowType = mainRow ? this.getRowType(mainRow) : null;
        const isDropdownType = rowType === SearchFieldType.Boolean || rowType === SearchFieldType.Select;

        this.searchTerm.set(mainRow && !isDropdownType ? mainRow.value : '');
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

function findMainTerm({ fields, filters, mainField }: SearchConfig): string {
    const field = fields.find(current => current.key === mainField);
    const filter = filters.find(current => current.field === mainField);

    if (!field || !filter || field.type === SearchFieldType.Boolean || field.type === SearchFieldType.Select) {
        return '';
    }

    return String(filter.value ?? '');
}

function toDraftRow({ field, operator, value }: SearchFilter): SearchDraftRow {
    const [from, to] = Array.isArray(value) ? value : [value, ''];

    return { fieldKey: field, operator, value: String(from ?? ''), valueTo: String(to ?? '') };
}
