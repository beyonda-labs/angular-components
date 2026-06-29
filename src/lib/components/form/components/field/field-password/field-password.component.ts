import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { FormPasswordField } from '../../../models/fields/form-password-field.model';
import { FormConfig, FormSection } from '../../../models/form.model';
import { FormService } from '../../../services/form.service';

@Component({
    imports: [FontAwesomeModule, ReactiveFormsModule, TranslateModule],
    selector: 'bey-form-password-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-password.component.html'
})
export class FormPasswordFieldComponent implements OnInit {
    @Input() field: FormPasswordField;
    @Input() formConfig: FormConfig;
    @Input() section: FormSection;

    control?: FormControl<string | null>;
    sectionGroup?: FormGroup;
    isVisible = false;

    eyeIcon = faEye;
    eyeSlashIcon = faEyeSlash;

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
        return this.field.placeholder ?? `${this.getPrefix()}.placeholder`;
    }

    toggleVisibility(): void {
        this.isVisible = !this.isVisible;
    }

    isInvalid(): boolean {
        return (this.control?.invalid && this.control?.touched) ?? false;
    }

    private getPrefix(): string {
        if (this.formConfig && this.section && this.field) {
            return this.formService.getFieldPrefix(this.formConfig, this.section, this.field);
        }

        return '';
    }
}
