import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import {
    FORM_CHECKBOX_SECTIONS_TEXTS,
    FormCheckboxSectionsField,
    FormCheckboxSectionView
} from '../../../models/fields/form-checkbox-sections-field.model';
import {
    checkboxSectionViews,
    checkedSectionKeys,
    toggleOptionValues,
    toggleSectionValues
} from '../functions/checkbox-sections';
import { trackControl } from '../functions/control-state';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, TranslateModule],
    selector: 'bey-form-checkbox-sections-field',
    standalone: true,
    styleUrls: ['./field-checkbox-sections.component.css'],
    templateUrl: './field-checkbox-sections.component.html'
})
export class FormCheckboxSectionsFieldComponent {
    readonly control = input.required<FormControl<string[] | null>>();
    readonly describedBy = input<string | null>(null);
    readonly field = input.required<FormCheckboxSectionsField>();
    readonly isRequired = input(false);
    readonly label = input.required<string>();

    readonly chevronIcon = faChevronDown;
    readonly controlState = trackControl(this.control);
    readonly countLabel = FORM_CHECKBOX_SECTIONS_TEXTS.count;
    readonly expandedKeys = linkedSignal({
        computation: ({ control, field }) => checkedSectionKeys(field.sections, control.value ?? []),
        source: () => ({ control: this.control(), field: this.field() })
    });
    readonly sections = computed(() =>
        checkboxSectionViews(this.field().sections, {
            expandedKeys: this.expandedKeys(),
            fieldKey: this.field().key,
            isDisabled: this.controlState.isDisabled(),
            values: this.values()
        })
    );

    isInvalid(): boolean {
        const control = this.control();

        return control.invalid && control.touched;
    }

    onBlur(): void {
        this.control().markAsTouched();
    }

    toggleAll(section: FormCheckboxSectionView): void {
        this.write(toggleSectionValues(this.field().sections, this.values(), section.key, !section.isAllChecked));
    }

    toggleOption(value: string, isChecked: boolean): void {
        this.write(toggleOptionValues(this.field().sections, this.values(), value, isChecked));
    }

    toggleSection(key: string): void {
        this.expandedKeys.update(keys => {
            const next = new Set(keys);

            if (!next.delete(key)) {
                next.add(key);
            }

            return next;
        });
    }

    private values(): string[] {
        return this.controlState.value() ?? [];
    }

    private write(values: string[]): void {
        const control = this.control();

        control.setValue(values);
        control.markAsDirty();
        control.markAsTouched();
    }
}
