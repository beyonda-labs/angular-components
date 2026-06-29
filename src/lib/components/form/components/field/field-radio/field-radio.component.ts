import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FormRadioField } from '../../../models/fields/form-radio-field.model';
import { FormConfig, FormSection } from '../../../models/form.model';
import { FormService } from '../../../services/form.service';

@Component({
    imports: [ReactiveFormsModule, TranslateModule],
    selector: 'bey-form-radio-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-radio.component.html'
})
export class FormRadioFieldComponent implements OnInit {
    @Input() field: FormRadioField;
    @Input() formConfig: FormConfig;
    @Input() section: FormSection;

    control?: FormControl<string | null>;
    sectionGroup?: FormGroup;

    private readonly formService = inject(FormService);

    ngOnInit(): void {
        this.sectionGroup = this.formService.getSectionGroup(this.formConfig, this.section.key);

        if (this.sectionGroup) {
            this.control = this.formService.getFieldControl(this.sectionGroup, this.field) as FormControl<
                string | null
            >;
        }
    }

    isInvalid(): boolean {
        return (this.control?.invalid && this.control?.touched) ?? false;
    }
}
