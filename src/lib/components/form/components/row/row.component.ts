import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

import { fieldStateKey, FormFieldState, FormFieldStates } from '../../form.component';
import { FormRow } from '../../models/form.model';
import { FormField } from '../../models/form-field.model';
import { FormFieldComponent } from '../field/field.component';

interface RowField {
    control: AbstractControl | null;
    field: FormField;
    state: FormFieldState;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormFieldComponent],
    selector: 'bey-form-row',
    standalone: true,
    templateUrl: './row.component.html'
})
export class FormRowComponent {
    readonly fieldStates = input.required<FormFieldStates>();
    readonly group = input.required<FormGroup>();
    readonly prefix = input.required<string>();
    readonly row = input.required<FormRow>();
    readonly sectionKey = input.required<string>();

    readonly fields = computed<RowField[]>(() =>
        this.row()
            .fields.map(field => ({
                control: this.group().get(field.key),
                field,
                state: this.fieldStates().get(fieldStateKey(this.sectionKey(), field.key))
            }))
            .filter((entry): entry is RowField => entry.state !== undefined && !entry.state.isHidden)
    );
}
