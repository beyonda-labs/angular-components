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
import { FormControl } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { FormAutocompleteField } from '../../../models/fields/form-autocomplete-field.model';
import { FormFieldOption } from '../../../models/form-field.model';
import { trackControl } from '../functions/control-state';

const EMPTY_KEY = 'angular-components.form.autocomplete-field.empty';
const PANEL_GAP_PX = 2;
const PANEL_MAX_HEIGHT_PX = 208;

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
    readonly field = input.required<FormAutocompleteField>();
    readonly isRequired = input(false);
    readonly options = input<FormFieldOption[]>([]);
    readonly prefix = input.required<string>();

    readonly activeIndex = signal(-1);
    readonly clearIcon = faXmark;
    readonly controlState = trackControl(this.control);
    readonly emptyKey = computed(() => this.field().emptyKey ?? EMPTY_KEY);
    readonly filteredOptions = computed(() => {
        const term = this.hasTyped() ? this.query().trim().toLowerCase() : '';

        return term
            ? this.options().filter(option => this.optionLabel(option).toLowerCase().includes(term))
            : this.options();
    });
    readonly hasTyped = signal(false);
    readonly isOpen = signal(false);
    readonly isPanelVisible = computed(
        () => this.isOpen() && (this.filteredOptions().length > 0 || !this.field().isFreeTextAllowed)
    );
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
    private readonly queryInput = viewChild.required<ElementRef<HTMLInputElement>>('queryInput');

    constructor() {
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

        this.select(option.value);
        this.close();
    }

    onQueryInput(event: Event): void {
        const { value } = event.target as HTMLInputElement;

        this.query.set(value);
        this.hasTyped.set(true);
        this.activeIndex.set(-1);
        this.isOpen.set(true);

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
        this.query.set('');
        this.hasTyped.set(false);
        this.activeIndex.set(-1);
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
        this.query.set('');
        this.hasTyped.set(false);
        this.activeIndex.set(-1);
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

    private select(value: string): void {
        const control = this.control();

        control.setValue(value);
        control.markAsDirty();
        control.markAsTouched();
    }

    private selectedLabel(): string {
        const value = this.controlState.value();
        const selected = this.options().find(option => option.value === value);

        if (selected) {
            return this.optionLabel(selected);
        }

        return this.field().isFreeTextAllowed ? (value ?? '') : '';
    }
}
