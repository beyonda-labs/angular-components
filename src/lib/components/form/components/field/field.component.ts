import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { toKeySegment } from '../../../../internal/i18n/key-segment.util';
import { FormFieldState } from '../../form.component';
import { FormField, FormFieldType } from '../../models/form-field.model';
import { FormAutocompleteFieldComponent } from './field-autocomplete/field-autocomplete.component';
import { FormCheckboxFieldComponent } from './field-checkbox/field-checkbox.component';
import { FormChipsFieldComponent } from './field-chips/field-chips.component';
import { FormDateFieldComponent } from './field-date/field-date.component';
import { FormFileFieldComponent } from './field-file/field-file.component';
import { FormInfoFieldComponent } from './field-info/field-info.component';
import { FormNumberFieldComponent } from './field-number/field-number.component';
import { FormPasswordFieldComponent } from './field-password/field-password.component';
import { FormRadioFieldComponent } from './field-radio/field-radio.component';
import { FormSelectFieldComponent } from './field-select/field-select.component';
import { FormTextFieldComponent } from './field-text/field-text.component';
import { FormTextVariableFieldComponent } from './field-text-variable/field-text-variable.component';
import { FormTextareaFieldComponent } from './field-textarea/field-textarea.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        FontAwesomeModule,
        FormAutocompleteFieldComponent,
        FormCheckboxFieldComponent,
        FormChipsFieldComponent,
        FormDateFieldComponent,
        FormFileFieldComponent,
        FormInfoFieldComponent,
        FormNumberFieldComponent,
        FormPasswordFieldComponent,
        FormRadioFieldComponent,
        FormSelectFieldComponent,
        FormTextFieldComponent,
        FormTextVariableFieldComponent,
        FormTextareaFieldComponent,
        TooltipModule,
        TranslateModule
    ],
    selector: 'bey-form-field',
    standalone: true,
    styleUrls: ['./field.component.css'],
    templateUrl: './field.component.html'
})
export class FormFieldComponent {
    readonly control = input.required<AbstractControl | null>();
    readonly field = input.required<FormField>();
    readonly prefix = input.required<string>();
    readonly state = input.required<FormFieldState>();

    readonly fieldPrefix = computed(() => `${this.prefix()}.${toKeySegment(this.field().key)}`);
    readonly formControl = computed(() => this.control() as FormControl | null);
    readonly hasLabel = computed(() => this.field().isLabelVisible && this.field().type !== FormFieldType.Checkbox);
    readonly label = computed(() => `${this.fieldPrefix()}.label`);
    readonly tooltip = computed(() => `${this.fieldPrefix()}.tooltip`);
    readonly type = computed(() => this.field().type);

    readonly fieldType = FormFieldType;
    readonly infoIcon = faInfoCircle;
}
