import { ChangeDetectionStrategy, Component, computed, inject, input, isSignal, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { holdsListValue } from '../../../functions/list-value';
import { FormAutocompleteField } from '../../../models/fields/form-autocomplete-field.model';
import { FormListField } from '../../../models/fields/form-list-field.model';
import { FormFieldOption } from '../../../models/form-field.model';
import { FormAutocompleteFieldComponent } from '../field-autocomplete/field-autocomplete.component';
import { trackControl } from '../functions/control-state';

const REMOVE_KEY = 'angular-components.form.list-field.remove';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, FormAutocompleteFieldComponent, TranslateModule],
    selector: 'bey-form-list-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css', './field-list.component.css'],
    templateUrl: './field-list.component.html'
})
export class FormListFieldComponent {
    private readonly translateService = inject(TranslateService);

    readonly control = input<FormControl<string[] | null> | null>(null);
    readonly describedBy = input<string | null>(null);
    readonly excludedValues = input<string[]>([]);
    readonly field = input.required<FormListField>();
    readonly label = input.required<string>();
    readonly options = input<FormFieldOption[]>([]);
    readonly prefix = input.required<string>();

    readonly controlState = trackControl(computed(() => this.control() ?? this.detachedControl));
    readonly emptyKey = computed(
        () => this.field().emptyKey ?? this.field().placeholder ?? `${this.prefix()}.placeholder`
    );
    readonly hasItemClick = computed(() => this.field().onItemClick !== undefined);
    readonly hasRows = computed(() => (this.isValued() ? this.rows().length : this.items().length) > 0);
    readonly isEditable = computed(() => this.isValued() && !this.controlState.isDisabled());
    readonly isRemovable = computed(() => this.field().isRemovable && this.isEditable());
    readonly isValued = computed(() => holdsListValue(this.field()) && this.control() !== null);
    readonly items = computed(() => {
        const { items } = this.field();

        return isSignal(items) ? items() : items;
    });
    readonly listId = computed(() => (this.picker() ? `${this.field().key}-list` : this.field().key));
    readonly picker = computed(() => {
        const { key, picker } = this.field();

        return picker
            ? new FormAutocompleteField({
                  ...picker,
                  isClearedOnSelect: true,
                  key,
                  onSelect: option => {
                      this.add(option);
                      picker.onSelect?.(option);
                  }
              })
            : null;
    });
    readonly pickerControl = new FormControl<string | null>('');
    readonly pickerExcludedValues = computed(() => [...this.values(), ...this.excludedValues()]);
    readonly removeIcon = faXmark;
    readonly rows = computed<FormFieldOption[]>(() => {
        const labels = new Map(
            [...this.options(), ...this.pickedOptions()].map(({ label, value }) => [value, label] as const)
        );

        return this.values().map(value => ({ label: labels.get(value) ?? value, value }));
    });
    readonly values = computed(() => {
        const value = this.controlState.value();

        return Array.isArray(value) ? value : [];
    });

    private readonly detachedControl = new FormControl<string[] | null>([]);
    private readonly pickedOptions = signal<FormFieldOption[]>([]);

    onItemClick(item: string, index: number): void {
        this.field().onItemClick?.(item, index);
    }

    onRemove(value: string): void {
        this.write(this.values().filter(current => current !== value));
    }

    removeLabel(row: FormFieldOption): string {
        return this.translateService.instant(REMOVE_KEY, { label: this.translateService.instant(row.label) });
    }

    private add(option: FormFieldOption): void {
        this.pickedOptions.update(options => [...options, option]);

        if (!this.values().includes(option.value)) {
            this.write([...this.values(), option.value]);
        }
    }

    private write(values: string[]): void {
        const control = this.control();

        if (control) {
            control.setValue(values);
            control.markAsDirty();
            control.markAsTouched();
        }
    }
}
