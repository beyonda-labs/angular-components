import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { FormPasswordField } from '../../../models/fields/form-password-field.model';

@Component({
    imports: [FontAwesomeModule, ReactiveFormsModule, TranslateModule],
    selector: 'bey-form-password-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css'],
    templateUrl: './field-password.component.html'
})
export class FormPasswordFieldComponent {
    @Input({ required: true }) field!: FormPasswordField;
    @Input({ required: true }) prefix!: string;

    @Input({ required: true }) control!: FormControl<string | null>;
    isVisible = false;

    eyeIcon = faEye;
    eyeSlashIcon = faEyeSlash;

    getPlaceholder(): string {
        return this.field.placeholder ?? `${this.prefix}.placeholder`;
    }

    toggleVisibility(): void {
        this.isVisible = !this.isVisible;
    }

    isInvalid(): boolean {
        return (this.control?.invalid && this.control?.touched) ?? false;
    }
}
