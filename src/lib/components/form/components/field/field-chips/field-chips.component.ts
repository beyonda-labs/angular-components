import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { FormChipsField } from '../../../models/fields/form-chips-field.model';
import { trackControl } from '../control-state';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, TranslateModule],
    selector: 'bey-form-chips-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css', './field-chips.component.css'],
    templateUrl: './field-chips.component.html'
})
export class FormChipsFieldComponent {
    readonly control = input.required<FormControl<string[] | null>>();
    readonly field = input.required<FormChipsField>();
    readonly isRequired = input(false);
    readonly prefix = input.required<string>();

    readonly controlState = trackControl(this.control);
    readonly inputValue = signal('');
    readonly placeholder = computed(() => this.field().placeholder ?? `${this.prefix()}.placeholder`);
    readonly removeIcon = faXmark;

    addChip(): void {
        const value = this.inputValue().trim();
        const chips = this.chips();

        this.inputValue.set('');

        if (!value || this.isMaxItemsReached() || (!this.field().allowDuplicates && chips.includes(value))) {
            return;
        }

        this.write([...chips, value]);
    }

    chips(): string[] {
        return this.controlState.value() ?? [];
    }

    isDisabled(): boolean {
        return this.controlState.isDisabled();
    }

    isInvalid(): boolean {
        const control = this.control();

        return control.invalid && control.touched;
    }

    isMaxItemsReached(): boolean {
        const { maxItems } = this.field();

        return maxItems !== undefined && this.chips().length >= maxItems;
    }

    onBlur(): void {
        this.addChip();
        this.control().markAsTouched();
    }

    onInput(event: Event): void {
        this.inputValue.set((event.target as HTMLInputElement).value);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            this.addChip();
        } else if (event.key === 'Backspace' && !this.inputValue()) {
            this.removeChip(this.chips().length - 1);
        }
    }

    removeChip(index: number): void {
        if (this.isDisabled() || index < 0) {
            return;
        }

        this.write(this.chips().filter((_, current) => current !== index));
    }

    private write(chips: string[]): void {
        const control = this.control();

        control.setValue(chips);
        control.markAsDirty();
        control.markAsTouched();
    }
}
