import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FormNumberField } from '../../../models/fields/form-number-field.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, TranslateModule],
    selector: 'bey-form-number-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css', './field-number.component.css'],
    templateUrl: './field-number.component.html'
})
export class FormNumberFieldComponent {
    readonly control = input.required<FormControl<number | null>>();
    readonly field = input.required<FormNumberField>();
    readonly prefix = input.required<string>();

    readonly placeholder = computed(() => this.field().placeholder ?? `${this.prefix()}.placeholder`);

    decrement(): void {
        this.step(-1);
    }

    increment(): void {
        this.step(1);
    }

    isDecrementDisabled(): boolean {
        const { min } = this.field();

        return this.control().disabled || (min !== undefined && this.currentValue() <= min);
    }

    isIncrementDisabled(): boolean {
        const { max } = this.field();

        return this.control().disabled || (max !== undefined && this.currentValue() >= max);
    }

    isInvalid(): boolean {
        const control = this.control();

        return control.invalid && control.touched;
    }

    private currentValue(): number {
        return this.control().value ?? 0;
    }

    private step(delta: number): void {
        const { max, min } = this.field();
        const next = this.currentValue() + delta;

        if ((min !== undefined && next < min) || (max !== undefined && next > max)) {
            return;
        }

        this.control().setValue(next);
        this.control().markAsDirty();
    }
}
