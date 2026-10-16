import {
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    HostListener,
    inject,
    input,
    linkedSignal,
    signal,
    untracked
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faFilter, faMagnifyingGlass, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, Subject, switchMap } from 'rxjs';

import { ButtonComponent } from '../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../internal/button/models/button-config.model';
import { toKeySegment } from '../../utilities/key-segment';
import {
    emptySearchRow,
    findMainTerm,
    isBetweenRow,
    isSearchRowValid,
    searchLabelKey,
    searchTermOf,
    toSearchDraftRow,
    toSearchFilter
} from './functions/search-draft-rows';
import { searchFieldOperators } from './functions/search-field-operators';
import { requestSearchSuggestions } from './functions/search-suggestions';
import { SearchConfig, SearchField, SearchFieldOption, SearchFieldType } from './models/search.model';
import { SearchDraftRow, SearchSuggestionRequest, SearchSuggestions } from './models/search-draft.model';
import { SearchFilter, SearchFilterOperator } from './models/search-filter.model';

const DEFAULT_PLACEHOLDER = 'angular-components.search.placeholder';
const SEARCH_DEBOUNCE_MS = 300;

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

    private readonly knownLabels = signal<ReadonlyMap<string, string>>(new Map());
    readonly rows = linkedSignal<SearchDraftRow[]>(() => {
        const { fields, filters } = this.config();
        const labels = untracked(() => this.knownLabels());

        return filters.map(filter => toSearchDraftRow(filter, fields, labels));
    });
    readonly searchIcon = faMagnifyingGlass;
    readonly searchTerm = linkedSignal(() => findMainTerm(this.config()));
    readonly suggestions = signal<SearchSuggestions | null>(null);

    private readonly searchTerm$ = new Subject<void>();
    private readonly suggestionRequests$ = new Subject<SearchSuggestionRequest>();

    constructor() {
        this.searchTerm$.pipe(debounceTime(SEARCH_DEBOUNCE_MS), takeUntilDestroyed()).subscribe(() => {
            this.syncMainRow();
            this.applyRows(false);
        });

        this.suggestionRequests$
            .pipe(
                debounceTime(SEARCH_DEBOUNCE_MS),
                switchMap(request => requestSearchSuggestions(request)),
                takeUntilDestroyed()
            )
            .subscribe(suggestions => this.suggestions.set(suggestions));
    }

    addRow(): void {
        this.rows.update(rows => [...rows, emptySearchRow('')]);
    }

    applyFilters(): void {
        this.applyRows(true);
        this.syncSearchTermFromMainRow();
    }

    chooseOption(index: number, option: SearchFieldOption): void {
        const fieldKey = this.rows()[index]?.fieldKey ?? '';

        this.knownLabels.update(labels => new Map(labels).set(searchLabelKey(fieldKey, option.value), option.label));
        this.rows.update(rows =>
            rows.map((row, currentIndex) =>
                currentIndex === index ? { ...row, value: option.value, valueLabel: option.label } : row
            )
        );
        this.suggestions.set(null);
    }

    clearFilters(): void {
        this.rows.set([]);
        this.suggestions.set(null);
        this.appliedFilters.set([]);
        this.searchTerm.set('');
        this.emitFilters();
    }

    getFieldLabel(field: SearchField): string {
        return field.label ?? `${this.config().prefix}.fields.${toKeySegment(field.key)}`;
    }

    getFieldOptions(row: SearchDraftRow): SearchFieldOption[] {
        return this.getField(row)?.options ?? [];
    }

    getOperatorLabel(row: SearchDraftRow, operator: SearchFilterOperator): string {
        const node = this.getRowType(row) === SearchFieldType.Date ? 'date-operators' : 'operators';

        return `angular-components.search.${node}.${toKeySegment(operator)}`;
    }

    getOperators(row: SearchDraftRow): SearchFilterOperator[] {
        const field = this.getField(row);

        return field ? searchFieldOperators(field) : [];
    }

    getRowType(row: SearchDraftRow): SearchFieldType | null {
        return this.getField(row)?.type ?? null;
    }

    getSuggestions(index: number): SearchSuggestions | null {
        const suggestions = this.suggestions();

        return suggestions?.index === index ? suggestions : null;
    }

    isBetween(row: SearchDraftRow): boolean {
        return isBetweenRow(row);
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
                currentIndex === index ? emptySearchRow(fieldKey, field ? searchFieldOperators(field)[0] : '') : row
            )
        );
        this.suggestions.set(null);
    }

    onOperatorChange(index: number, event: Event): void {
        const operator = (event.target as HTMLSelectElement).value as SearchFilterOperator;

        this.rows.update(rows =>
            rows.map((row, currentIndex) => (currentIndex === index ? { ...row, operator, valueTo: '' } : row))
        );
    }

    onOptionSearch(index: number, event: Event): void {
        const text = (event.target as HTMLInputElement).value;
        const field = this.getField(this.rows()[index]);

        this.rows.update(rows =>
            rows.map((row, currentIndex) => (currentIndex === index ? { ...row, value: '', valueLabel: text } : row))
        );

        if (field?.searchOptions) {
            this.suggestionRequests$.next({ field, index, text: text.trim() });
        }
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
        this.suggestions.set(null);
    }

    togglePanel(): void {
        const isOpening = !this.isPanelOpen();

        this.isPanelOpen.set(isOpening);

        if (isOpening) {
            this.config().onPanelOpen?.();
        }
    }

    private applyRows(closePanel: boolean): void {
        this.appliedFilters.set(
            this.rows().flatMap(row => {
                const field = this.getField(row);

                return field && isSearchRowValid(row, field) ? [toSearchFilter(row, field)] : [];
            })
        );

        if (closePanel) {
            this.isPanelOpen.set(false);
        }

        this.emitFilters();
    }

    private emitFilters(): void {
        this.config().onFiltersChange?.([...this.appliedFilters()]);
    }

    private getField(row: SearchDraftRow | undefined): SearchField | undefined {
        return row ? this.config().fields.find(current => current.key === row.fieldKey) : undefined;
    }

    private getMainRow(): SearchDraftRow | undefined {
        const { mainField } = this.config();

        return mainField ? this.rows().find(row => row.fieldKey === mainField) : undefined;
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
                { ...emptySearchRow(mainField, field ? searchFieldOperators(field)[0] : ''), value: term }
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

        this.searchTerm.set(searchTermOf(mainRow, this.getField(mainRow)));
    }
}
