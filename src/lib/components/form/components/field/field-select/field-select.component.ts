import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { startWith, switchMap } from 'rxjs';

import { FormSelectField } from '../../../models/fields/form-select-field.model';
import { FormFieldOption } from '../../../models/form-field.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, TranslateModule],
    selector: 'bey-form-select-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-select.component.html'
})
export class FormSelectFieldComponent {
    readonly control = input.required<FormControl<string | null>>();
    readonly field = input.required<FormSelectField>();
    readonly isRequired = input(false);
    readonly options = input<FormFieldOption[]>([]);
    readonly prefix = input.required<string>();

    readonly isPlaceholderShown = signal(true);
    readonly placeholder = computed(() => this.field().placeholder ?? `${this.prefix()}.placeholder`);

    constructor() {
        toObservable(this.control)
            .pipe(
                switchMap(control => control.valueChanges.pipe(startWith(control.value))),
                takeUntilDestroyed()
            )
            .subscribe(value => this.isPlaceholderShown.set(value === null || value === ''));
    }

    isInvalid(): boolean {
        const control = this.control();

        return control.invalid && control.touched;
    }
}
