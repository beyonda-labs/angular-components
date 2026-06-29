import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { FormConfig, FormRow, FormSection } from '../../models/form.model';
import { FormFieldComponent } from '../field/field.component';

@Component({
    imports: [CommonModule, FormFieldComponent],
    selector: 'bey-form-row',
    standalone: true,
    templateUrl: './row.component.html'
})
export class FormRowComponent {
    @Input() formConfig: FormConfig;
    @Input() row: FormRow;
    @Input() section: FormSection;
}
