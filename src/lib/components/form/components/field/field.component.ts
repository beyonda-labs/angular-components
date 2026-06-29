import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { FormDateField } from '../../models/fields/form-date-field.model';
import { FormConfig, FormSection } from '../../models/form.model';
import { FormField } from '../../models/form-field.model';
import { FormService } from '../../services/form.service';
import { FormCheckboxFieldComponent } from './field-checkbox/field-checkbox.component';
import { FormDateFieldComponent } from './field-date/field-date.component';
import { FormNumberFieldComponent } from './field-number/field-number.component';
import { FormPasswordFieldComponent } from './field-password/field-password.component';
import { FormRadioFieldComponent } from './field-radio/field-radio.component';
import { FormSelectFieldComponent } from './field-select/field-select.component';
import { FormTextFieldComponent } from './field-text/field-text.component';
import { FormTextareaFieldComponent } from './field-textarea/field-textarea.component';

@Component({
    imports: [
        CommonModule,
        FontAwesomeModule,
        FormCheckboxFieldComponent,
        FormDateFieldComponent,
        FormNumberFieldComponent,
        FormPasswordFieldComponent,
        FormRadioFieldComponent,
        FormSelectFieldComponent,
        FormTextFieldComponent,
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
    @Input() field: FormField;
    @Input() formConfig: FormConfig;
    @Input() section: FormSection;

    infoIcon = faInfoCircle;

    private readonly formService = inject(FormService);

    getFieldLabel(): string {
        return `${this.getPrefix()}.label`;
    }

    getFieldTooltip(): string {
        return `${this.getPrefix()}.tooltip`;
    }

    getDateField(): FormDateField {
        return this.field as FormDateField;
    }

    isFieldValid(): boolean {
        if (this.field && this.formConfig && this.section) {
            const sectionGroup = this.formService.getSectionGroup(this.formConfig, this.section.key);

            if (sectionGroup) {
                const control = this.formService.getFieldControl(sectionGroup, this.field);

                return control?.valid ?? false;
            }
        }

        return false;
    }

    private getPrefix(): string {
        if (this.field && this.formConfig && this.section) {
            return this.formService.getFieldPrefix(this.formConfig, this.section, this.field);
        }

        return '';
    }
}
