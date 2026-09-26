import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { FormPasswordField } from '../../../models/fields/form-password-field.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FontAwesomeModule, ReactiveFormsModule, TranslateModule],
    selector: 'bey-form-password-field',
    standalone: true,
    styleUrls: ['../field-control.styles.css', './field-password.component.css'],
    templateUrl: './field-password.component.html'
})
export class FormPasswordFieldComponent {
    readonly control = input.required<FormControl<string | null>>();
    readonly field = input.required<FormPasswordField>();
    readonly prefix = input.required<string>();

    readonly isVisible = signal(false);

    readonly placeholder = computed(() => this.field().placeholder ?? `${this.prefix()}.placeholder`);
    readonly toggleIcon = computed(() => (this.isVisible() ? faEyeSlash : faEye));
    readonly toggleLabel = computed(() =>
        this.isVisible() ? 'angular-components.form.password-field.hide' : 'angular-components.form.password-field.show'
    );

    isInvalid(): boolean {
        const control = this.control();

        return control.invalid && control.touched;
    }

    toggleVisibility(): void {
        this.isVisible.update(isVisible => !isVisible);
    }
}
