import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    input,
    Renderer2,
    signal,
    viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { catchError, map, Observable, of, Subject, switchMap, timer } from 'rxjs';

import {
    FormAutocompleteField,
    FormAutocompleteSearchResult
} from '../../../models/fields/form-autocomplete-field.model';
import { FormFieldOption } from '../../../models/form-field.model';
import { trackControl } from '../functions/control-state';
import { matchesOptionText } from '../functions/option-match';

const EMPTY_KEY = 'angular-components.form.autocomplete-field.empty';
const PANEL_GAP_PX = 2;
const PANEL_MAX_HEIGHT_PX = 208;
const SEARCH_DEBOUNCE_MS = 300;

interface SearchRequest {
    delay: number;
    text: string;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, TranslateModule],
    selector: 'bey-form-autocomplete-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css', './field-autocomplete.component.css'],
    templateUrl: './field-autocomplete.component.html'
})
export class FormAutocompleteFieldComponent {
    private readonly renderer = inject(Renderer2);
    private readonly translateService = inject(TranslateService);

    readonly control = input.required<FormControl<string | null>>();
    readonly describedBy = input<string | null>(null);
    readonly excludedValues = input<string[]>([]);
    readonly field = input.required<FormAutocompleteField>();
    readonly isRequired = input(false);
    readonly options = input<FormFieldOption[]>([]);
    readonly prefix = input.required<string>();

    readonly activeIndex = signal(-1);
    readonly availableOptions = computed(() => {
        const excluded = new Set(this.excludedValues());
        const options = this.field().search ? (this.searchResult()?.options ?? []) : this.options();

        return options.filter(option => !excluded.has(option.value));
    });
    readonly clearIcon = faXmark;
    readonly controlState = trackControl(this.control);
    readonly emptyKey = computed(() => this.field().emptyKey ?? EMPTY_KEY);
    readonly filteredOptions = computed(() => {
        const { filter, search } = this.field();
        const text = this.hasTyped() ? this.query().trim() : '';
        const options = this.availableOptions();

        if (!text || search) {
            return options;
        }

        return options.filter(option =>
            filter ? filter(option, text) : matchesOptionText(this.optionLabel(option), text)
        );
    });
    readonly hasMore = computed(() => this.searchResult()?.hasMore ?? false);
    readonly hasTyped = signal(false);
    readonly isOpen = signal(false);
    readonly isPanelVisible = computed(() => {
        const { isFreeTextAllowed, search } = this.field();

        if (!this.isOpen()) {
            return false;
        }

        return this.filteredOptions().length > 0 || (!isFreeTextAllowed && (!search || this.searchResult() !== null));
    });
    readonly placeholder = computed(() => this.field().placeholder ?? `${this.prefix()}.placeholder`);
    readonly query = signal('');
    readonly toggleIcon = faChevronDown;

    private readonly onAncestorScroll = (event: Event): void => {
        if (!this.panel()?.nativeElement.contains(event.target as Node)) {
            this.close();
        }
    };
    private readonly onWindowResize = (): void => this.positionPanel();
    private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
    private readonly pickedOption = signal<FormFieldOption | null>(null);
    private readonly queryInput = viewChild.required<ElementRef<HTMLInputElement>>('queryInput');
    private readonly searchRequests = new Subject<SearchRequest | null>();
    private readonly searchResult = signal<FormAutocompleteSearchResult | null>(null);

    constructor() {
        this.searchRequests
            .pipe(
                switchMap(request =>
                    request ? timer(request.delay).pipe(switchMap(() => this.searchOptions(request.text))) : of(null)
                ),
                takeUntilDestroyed()
            )
            .subscribe(result => this.searchResult.set(result));

        effect(onCleanup => {
            const panel = this.panel()?.nativeElement;

            if (!panel) {
                return;
            }

            this.renderer.appendChild(document.body, panel);
            this.positionPanel();
            window.addEventListener('resize', this.onWindowResize);
            document.addEventListener('scroll', this.onAncestorScroll, { capture: true });

            onCleanup(() => {
                panel.remove();
                window.removeEventListener('resize', this.onWindowResize);
                document.removeEventListener('scroll', this.onAncestorScroll, { capture: true });
            });
        });
    }

    displayValue(): string {
        if (this.isOpen() && (this.hasTyped() || !this.field().isFreeTextAllowed)) {
            return this.query();
        }

        return this.selectedLabel();
    }

    hasValue(): boolean {
        return Boolean(this.controlState.value());
    }

    isDisabled(): boolean {
        return this.controlState.isDisabled();
    }

    isInvalid(): boolean {
        const control = this.control();

        return control.invalid && control.touched;
    }

    isSelected(option: FormFieldOption): boolean {
        return option.value === this.controlState.value();
    }

    onBlur(): void {
        this.control().markAsTouched();
        this.close();
    }

    onClear(event: Event): void {
        event.preventDefault();
        this.select('');
        this.close();
    }

    onFocus(): void {
        this.open();
    }

    onKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.close();

            return;
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            this.moveActive(event.key === 'ArrowDown' ? 1 : -1);

            return;
        }

        if (event.key === 'Enter' && this.isOpen()) {
            event.preventDefault();

            const option = this.filteredOptions()[this.activeIndex()];

            if (option) {
                this.onOptionPicked(option);
            } else if (this.field().isFreeTextAllowed) {
                this.close();
            }
        }
    }

    onOptionPicked(option: FormFieldOption, event?: Event): void {
        event?.preventDefault();

        if (option.isDisabled) {
            return;
        }

        const { isClearedOnSelect, onSelect } = this.field();

        if (!isClearedOnSelect) {
            this.pickedOption.set(option);
            this.select(option.value);
        }

        this.close();
        onSelect?.(option);
    }

    onQueryInput(event: Event): void {
        const { value } = event.target as HTMLInputElement;

        this.query.set(value);
        this.hasTyped.set(true);
        this.activeIndex.set(-1);
        this.isOpen.set(true);

        this.requestSearch(value.trim(), SEARCH_DEBOUNCE_MS);

        if (this.field().isFreeTextAllowed) {
            this.select(value);
        }
    }

    onToggle(): void {
        if (this.isOpen()) {
            this.close();

            return;
        }

        this.open();
        this.queryInput().nativeElement.focus();
    }

    optionLabel(option: FormFieldOption): string {
        return this.translateService.instant(option.label);
    }

    private close(): void {
        this.isOpen.set(false);
        this.resetQuery();
        this.searchRequests.next(null);
    }

    private moveActive(step: number): void {
        if (!this.isOpen()) {
            this.open();
        }

        const total = this.filteredOptions().length;

        if (total === 0) {
            this.activeIndex.set(-1);

            return;
        }

        const first = step > 0 ? 0 : total - 1;

        this.activeIndex.update(index => (index === -1 ? first : (index + step + total) % total));
    }

    private open(): void {
        this.isOpen.set(true);
        this.resetQuery();
        this.requestSearch('', 0);
    }

    private positionPanel(): void {
        const panel = this.panel()?.nativeElement;
        const anchor = this.queryInput().nativeElement;

        if (!panel) {
            return;
        }

        const rect = anchor.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const opensAbove = spaceBelow < PANEL_MAX_HEIGHT_PX && spaceAbove > spaceBelow;

        this.renderer.setStyle(panel, 'left', `${rect.left}px`);
        this.renderer.setStyle(panel, 'width', `${rect.width}px`);
        this.renderer.setStyle(
            panel,
            'max-height',
            `${Math.min(PANEL_MAX_HEIGHT_PX, (opensAbove ? spaceAbove : spaceBelow) - PANEL_GAP_PX)}px`
        );

        if (opensAbove) {
            this.renderer.setStyle(panel, 'top', 'auto');
            this.renderer.setStyle(panel, 'bottom', `${window.innerHeight - rect.top + PANEL_GAP_PX}px`);
        } else {
            this.renderer.setStyle(panel, 'bottom', 'auto');
            this.renderer.setStyle(panel, 'top', `${rect.bottom + PANEL_GAP_PX}px`);
        }
    }

    private requestSearch(text: string, delay: number): void {
        if (this.field().search) {
            this.searchRequests.next({ delay, text });
        }
    }

    private resetQuery(): void {
        this.query.set('');
        this.hasTyped.set(false);
        this.activeIndex.set(-1);
    }

    private searchOptions(text: string): Observable<FormAutocompleteSearchResult | null> {
        const { search } = this.field();

        return search
            ? search(text, this.excludedValues()).pipe(
                  map(answer => (Array.isArray(answer) ? { options: answer } : answer)),
                  catchError(() => of({ options: [] }))
              )
            : of(null);
    }

    private select(value: string): void {
        const control = this.control();

        control.setValue(value);
        control.markAsDirty();
        control.markAsTouched();
    }

    private selectedLabel(): string {
        const value = this.controlState.value();
        const picked = this.pickedOption();
        const selected =
            this.options().find(option => option.value === value) ?? (picked?.value === value ? picked : undefined);

        if (selected) {
            return this.optionLabel(selected);
        }

        return this.field().isFreeTextAllowed ? (value ?? '') : '';
    }
}
