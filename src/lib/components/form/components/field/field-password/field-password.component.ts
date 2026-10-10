import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule, IconDefinition } from '@fortawesome/angular-fontawesome';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { faCircleCheck, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { PasswordPolicy } from '../../../../../services/password-policy/models/password-policy.model';
import { checkPasswordRules, resolvePasswordPolicy } from '../../../functions/password-rules';
import { FormPasswordField, PasswordRule, PasswordRuleCheck } from '../../../models/fields/form-password-field.model';
import { trackControl } from '../functions/control-state';

const RULE_KEY_PREFIX = 'angular-components.form.password-field.policy.';

let rulesCount = 0;

export interface PasswordRuleItem {
    icon: IconDefinition;
    isInvalid: boolean;
    isMet: boolean;
    label: string;
    parameters: Record<string, unknown>;
    rule: PasswordRule;
    status: string;
}

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
    readonly rulesId = nextRulesId();
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

function nextRulesId(): string {
    rulesCount += 1;

    return `bey-form-password-rules-${rulesCount}`;
}

function toRuleItem(
    { isMet, rule }: PasswordRuleCheck,
    { minLength }: PasswordPolicy,
    isFlagged: boolean
): PasswordRuleItem {
    return {
        icon: isMet ? faCircleCheck : faCircle,
        isInvalid: isFlagged && !isMet,
        isMet,
        label: `${RULE_KEY_PREFIX}${rule}`,
        parameters: { min: minLength },
        rule,
        status: `${RULE_KEY_PREFIX}${isMet ? 'met' : 'unmet'}`
    };
}
