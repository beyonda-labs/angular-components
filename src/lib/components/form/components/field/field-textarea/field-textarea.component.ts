import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FormTextareaField } from '../../../models/fields/form-textarea-field.model';
import { FormConfig, FormSection } from '../../../models/form.model';
import { FormService } from '../../../services/form.service';

@Component({
    imports: [ReactiveFormsModule, TranslateModule],
    selector: 'bey-form-textarea-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-textarea.component.html'
})
export class FormTextareaFieldComponent implements OnInit {
    @Input() field: FormTextareaField;
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

    getPlaceholder(): string {
        return (
            this.field.placeholder ??
            this.formService.getFieldPrefix(this.formConfig, this.section, this.field) + '.placeholder'
        );
    }

    isInvalid(): boolean {
        return (this.control?.invalid && this.control?.touched) ?? false;
    }
}
