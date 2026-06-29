import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FormCheckboxField } from '../../../models/fields/form-checkbox-field.model';
import { FormConfig, FormSection } from '../../../models/form.model';
import { FormService } from '../../../services/form.service';

@Component({
    imports: [ReactiveFormsModule, TranslateModule],
    selector: 'bey-form-checkbox-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-checkbox.component.html'
})
export class FormCheckboxFieldComponent implements OnInit {
    @Input() field: FormCheckboxField;
    @Input() formConfig: FormConfig;
    @Input() section: FormSection;

    control?: FormControl<boolean | null>;
    sectionGroup?: FormGroup;

    private readonly formService = inject(FormService);

    ngOnInit(): void {
        this.sectionGroup = this.formService.getSectionGroup(this.formConfig, this.section.key);

        if (this.sectionGroup) {
            this.control = this.formService.getFieldControl(this.sectionGroup, this.field) as FormControl<
                boolean | null
            >;
        }
    }

    getLabel(): string {
        return this.formService.getFieldPrefix(this.formConfig, this.section, this.field) + '.label';
    }

    isInvalid(): boolean {
        return (this.control?.invalid && this.control?.touched) ?? false;
    }
}
