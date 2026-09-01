import {
    AfterViewChecked,
    Component,
    ElementRef,
    inject,
    Input,
    OnDestroy,
    OnInit,
    Renderer2,
    ViewChild
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { FormAutocompleteField } from '../../../models/fields/form-autocomplete-field.model';
import { FormConfig, FormSection } from '../../../models/form.model';
import { FormFieldOption } from '../../../models/form-field.model';
import { FormService } from '../../../services/form.service';

const EMPTY_KEY = 'angular-components.form.autocompleteField.empty';
const PANEL_GAP_PX = 2;
const PANEL_MAX_HEIGHT_PX = 208;

@Component({
    imports: [FontAwesomeModule, TranslateModule],
    selector: 'bey-form-autocomplete-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-autocomplete.component.html'
})
export class FormAutocompleteFieldComponent implements AfterViewChecked, OnDestroy, OnInit {
    @Input() field: FormAutocompleteField;
    @Input() formConfig: FormConfig;
    @Input() section: FormSection;

    @ViewChild('queryInput') queryInput?: ElementRef<HTMLInputElement>;
    @ViewChild('panel') panel?: ElementRef<HTMLElement>;

    clearIcon = faXmark;
    toggleIcon = faChevronDown;

    activeIndex = -1;
    isOpen = false;
    query = '';

    control?: FormControl<string | null>;
    sectionGroup?: FormGroup;

    private readonly formService = inject(FormService);
    private readonly renderer = inject(Renderer2);
    private readonly translateService = inject(TranslateService);

    private movedPanel?: HTMLElement;
    private readonly onWindowResize = (): void => this.positionPanel();
    private readonly onAncestorScroll = (event: Event): void => {
        if (!this.movedPanel?.contains(event.target as Node)) {
            this.close();
        }
    };

    ngAfterViewChecked(): void {
        const panel = this.panel?.nativeElement;

        if (panel && panel !== this.movedPanel) {
            this.movedPanel = panel;
            this.renderer.appendChild(document.body, panel);
            window.addEventListener('resize', this.onWindowResize);
            document.addEventListener('scroll', this.onAncestorScroll, { capture: true });
        }

        if (!panel && this.movedPanel) {
            this.releasePanel();
        }

        if (panel) {
            this.positionPanel();
        }
    }

    ngOnDestroy(): void {
        this.releasePanel();
    }

    ngOnInit(): void {
        this.sectionGroup = this.formService.getSectionGroup(this.formConfig, this.section.key);

        if (this.sectionGroup) {
            this.control = this.formService.getFieldControl(this.sectionGroup, this.field) as FormControl<
                string | null
            >;
        }
    }

    get displayValue(): string {
        return this.isOpen ? this.query : this.getSelectedLabel();
    }

    get emptyKey(): string {
        return this.field.emptyKey ?? EMPTY_KEY;
    }

    get filteredOptions(): FormFieldOption[] {
        const term = this.query.trim().toLowerCase();

        if (!term) {
            return this.field.options;
        }

        return this.field.options.filter(option => this.getOptionLabel(option).toLowerCase().includes(term));
    }

    getOptionLabel(option: FormFieldOption): string {
        return this.translateService.instant(option.label);
    }

    getPlaceholder(): string {
        return (
            this.field.placeholder ??
            this.formService.getFieldPrefix(this.formConfig, this.section, this.field) + '.placeholder'
        );
    }

    getSelectedLabel(): string {
        const selected = this.field.options.find(option => option.value === this.control?.value);

        return selected ? this.getOptionLabel(selected) : '';
    }

    isInvalid(): boolean {
        return (this.control?.invalid && this.control?.touched) ?? false;
    }

    isSelected(option: FormFieldOption): boolean {
        return option.value === this.control?.value;
    }

    onQueryInput(event: Event): void {
        this.query = (event.target as HTMLInputElement).value;
        this.activeIndex = -1;
        this.isOpen = true;
    }

    onFocus(): void {
        this.open();
    }

    onBlur(): void {
        this.control?.markAsTouched();
        this.close();
    }

    onToggle(): void {
        if (this.isOpen) {
            this.close();

            return;
        }

        this.open();
        this.queryInput?.nativeElement.focus();
    }

    onOptionPicked(option: FormFieldOption, event?: Event): void {
        event?.preventDefault();

        if (option.isDisabled) {
            return;
        }

        this.select(option.value);
        this.close();
    }

    onClear(event: Event): void {
        event.preventDefault();
        this.select('');
        this.close();
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

        if (event.key === 'Enter' && this.isOpen) {
            event.preventDefault();

            const option = this.filteredOptions[this.activeIndex];

            if (option) {
                this.onOptionPicked(option);
            }
        }
    }

    private moveActive(step: number): void {
        if (!this.isOpen) {
            this.open();
        }

        const total = this.filteredOptions.length;

        if (total === 0) {
            this.activeIndex = -1;

            return;
        }

        if (this.activeIndex === -1) {
            this.activeIndex = step > 0 ? 0 : total - 1;

            return;
        }

        this.activeIndex = (this.activeIndex + step + total) % total;
    }

    private open(): void {
        this.isOpen = true;
        this.query = '';
        this.activeIndex = -1;
    }

    private close(): void {
        this.isOpen = false;
        this.query = '';
        this.activeIndex = -1;
    }

    private select(value: string): void {
        this.control?.setValue(value);
        this.control?.markAsDirty();
        this.control?.markAsTouched();
    }

    private releasePanel(): void {
        if (!this.movedPanel) {
            return;
        }

        this.movedPanel.remove();
        this.movedPanel = undefined;
        window.removeEventListener('resize', this.onWindowResize);
        document.removeEventListener('scroll', this.onAncestorScroll, { capture: true });
    }

    private positionPanel(): void {
        const panel = this.movedPanel;
        const anchor = this.queryInput?.nativeElement;

        if (!panel || !anchor) {
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
}
