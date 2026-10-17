import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { nextDomId } from '../../../../../internal/dom-ids/dom-ids';
import { checkPasswordRules, resolvePasswordPolicy } from '../../../functions/password-rules';
import { FormPasswordField, PasswordRuleItem } from '../../../models/fields/form-password-field.model';
import { trackControl } from '../functions/control-state';
import { toRuleItem } from './functions/password-rule-items';

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
    readonly describedBy = input<string | null>(null);
    readonly field = input.required<FormPasswordField>();
    readonly isRequired = input(false);
    readonly prefix = input.required<string>();

    readonly controlDescribedBy = computed(
        () => [this.describedBy(), this.hasRules() ? this.rulesId : null].filter(Boolean).join(' ') || null
    );
    readonly hasRules = computed(() => this.field().policy !== undefined);
    readonly isVisible = signal(false);
    readonly placeholder = computed(() => this.field().placeholder ?? `${this.prefix()}.placeholder`);
    readonly rules = computed<PasswordRuleItem[]>(() => {
        const { policy } = this.field();

        if (!policy) {
            return [];
        }

        const current = resolvePasswordPolicy(policy);
        const password = this.controlState.value() ?? '';
        const isFlagged = this.controlState.isTouched() && (password !== '' || this.isRequired());

        return checkPasswordRules(current, password).map(check => toRuleItem(check, current, isFlagged));
    });
    readonly rulesId = nextDomId('bey-form-password-rules');
    readonly toggleIcon = computed(() => (this.isVisible() ? faEyeSlash : faEye));
    readonly toggleLabel = computed(() =>
        this.isVisible() ? 'angular-components.form.password-field.hide' : 'angular-components.form.password-field.show'
    );

    private readonly controlState = trackControl(this.control);

    isInvalid(): boolean {
        const control = this.control();

        return control.invalid && control.touched;
    }

    toggleVisibility(): void {
        this.isVisible.update(isVisible => !isVisible);
    }
}
