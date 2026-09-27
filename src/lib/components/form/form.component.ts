import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    input,
    linkedSignal,
    untracked
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { debounceTime, map, startWith, switchMap } from 'rxjs';

import { ButtonComponent } from '../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../internal/button/models/button-config.model';
import { FormSectionComponent } from './components/section/section.component';
import { FormButton, FormButtonType, FormConfig, FormHandle, FormSection } from './models/form.model';
import { FormFieldOption, FormValue } from './models/form-field.model';
import { FORM_HOST } from './models/form-host.model';
import { resolveRule } from './models/form-rule-resolution';
import { FormService } from './services/form.service';

const NEXT_LABEL = 'angular-components.form.steps.next';
const BACK_LABEL = 'angular-components.form.steps.back';
const INVALID_TOOLTIP = 'angular-components.form.submit.invalid';
const WITHOUT_CHANGES_TOOLTIP = 'angular-components.form.submit.without-changes';
const CANCEL_WITHOUT_CHANGES_TOOLTIP = 'angular-components.form.cancel.without-changes';

export interface FormFieldState {
    isDisabled: boolean;
    isHidden: boolean;
    isValid: boolean;
    options: FormFieldOption[];
}

export type FormFieldStates = ReadonlyMap<string, FormFieldState>;

interface FormState {
    isDirty: boolean;
    isValid: boolean;
    value: FormValue;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonComponent, FormSectionComponent],
    selector: 'bey-form',
    standalone: true,
    styleUrls: ['./form.component.css'],
    templateUrl: './form.component.html'
})
export class FormComponent<TValue = unknown> {
    readonly config = input.required<FormConfig<TValue>>();

    readonly formGroup = computed(() => this.formService.buildFormGroup(this.config()));
    readonly state = linkedSignal(() => readState(this.formGroup()));
    readonly currentStepKey = linkedSignal<string | null>(() => this.config().steps[0]?.key ?? null);

    readonly fieldStates = computed<FormFieldStates>(() => {
        const { value } = this.state();
        const formGroup = this.formGroup();
        const states = new Map<string, FormFieldState>();

        for (const section of this.config().sections) {
            for (const field of section.rows.flatMap(row => row.fields)) {
                const control = formGroup.get([section.key, field.key]);
                const options = 'options' in field ? (field as { options: unknown }).options : [];

                states.set(fieldStateKey(section.key, field.key), {
                    isDisabled: resolveRule(field.isDisabled, value),
                    isHidden: resolveRule(field.isHidden, value),
                    isValid: control?.valid ?? true,
                    options: resolveRule(options as FormFieldOption[], value)
                });
            }
        }

        return states;
    });
    readonly visibleSections = computed(() => {
        const { sections, steps } = this.config();
        const step = steps.find(current => current.key === this.currentStepKey());
        const { value } = this.state();
        const fieldStates = this.fieldStates();

        return sections.filter(
            section =>
                (!step || step.sections.includes(section.key)) &&
                !resolveRule(section.isHidden, value) &&
                this.hasVisibleField(section, fieldStates)
        );
    });
    readonly buttons = computed<ButtonConfig[]>(() => {
        const { buttons, steps } = this.config();
        const index = steps.findIndex(step => step.key === this.currentStepKey());
        const isLast = index === steps.length - 1;
        const stepButtons: ButtonConfig[] = [];

        if (index > 0) {
            stepButtons.push(
                new ButtonConfig({
                    action: () => this.goToStep(steps[index - 1].key),
                    label: BACK_LABEL,
                    type: ButtonType.Secondary
                })
            );
        }

        if (steps.length > 0 && !isLast) {
            const isStepValid = this.isStepValid(steps[index].sections);

            stepButtons.push(
                new ButtonConfig({
                    action: () => this.goToStep(steps[index + 1].key),
                    isDisabled: !isStepValid,
                    label: NEXT_LABEL,
                    tooltip: isStepValid ? '' : INVALID_TOOLTIP,
                    type: ButtonType.Primary
                })
            );

            return stepButtons;
        }

        return [...stepButtons, ...buttons.filter(button => !button.isHidden).map(button => this.buildButton(button))];
    });

    readonly handle: FormHandle<TValue> = {
        close: () => this.formHost?.close(),
        goToStep: key => this.goToStep(key),
        isDirty: () => this.formGroup().dirty,
        patchValue: value => this.formGroup().patchValue(value as FormValue),
        requestClose: () => this.formHost?.requestClose(),
        reset: () => this.reset(),
        value: () => this.formGroup().getRawValue() as TValue
    };

    private readonly formHost = inject(FORM_HOST, { optional: true });
    private readonly formService = inject(FormService);

    constructor() {
        const formGroup$ = toObservable(this.formGroup);

        formGroup$
            .pipe(
                switchMap(formGroup => formGroup.events.pipe(map(() => readState(formGroup)))),
                takeUntilDestroyed()
            )
            .subscribe(state => this.state.set(state));

        formGroup$
            .pipe(
                switchMap(formGroup =>
                    formGroup.valueChanges.pipe(
                        debounceTime(0),
                        map(() => formGroup.getRawValue() as TValue)
                    )
                ),
                takeUntilDestroyed()
            )
            .subscribe(value => this.config().onValueChange?.(value, this.handle));

        formGroup$.pipe(startWith(null), takeUntilDestroyed()).subscribe(formGroup => {
            if (formGroup) {
                this.config().onReady?.(this.handle);
            }
        });

        effect(() => {
            const formGroup = this.formGroup();
            const fieldStates = this.fieldStates();

            untracked(() => this.syncControls(formGroup, fieldStates));
        });
    }

    sectionGroup(section: FormSection): FormGroup {
        return this.formGroup().get(section.key) as FormGroup;
    }

    private buildButton(button: FormButton): ButtonConfig {
        const { isDirty, isValid } = this.state();
        const { allowSubmitWithoutChanges } = this.config();
        const base = { label: button.label, tooltip: button.tooltip };

        if (button.action) {
            const { action } = button;

            return new ButtonConfig({
                ...base,
                action: () => action(this.handle),
                type: button.type === FormButtonType.Submit ? ButtonType.Primary : ButtonType.Secondary
            });
        }

        if (button.type === FormButtonType.Cancel) {
            return new ButtonConfig({
                ...base,
                action: () => this.cancel(),
                isDisabled: !isDirty,
                tooltip: isDirty ? button.tooltip : CANCEL_WITHOUT_CHANGES_TOOLTIP,
                type: ButtonType.Secondary
            });
        }

        if (button.type === FormButtonType.Submit) {
            const requiresChanges = !isDirty && !allowSubmitWithoutChanges;
            const blockedTooltip = requiresChanges ? WITHOUT_CHANGES_TOOLTIP : INVALID_TOOLTIP;

            return new ButtonConfig({
                ...base,
                action: () => this.submit(),
                isDisabled: requiresChanges || !isValid,
                tooltip: requiresChanges || !isValid ? blockedTooltip : button.tooltip,
                type: ButtonType.Primary
            });
        }

        return new ButtonConfig({ ...base, action: noop, type: ButtonType.Tertiary });
    }

    private cancel(): void {
        this.reset();
        this.config().onCancel?.();
    }

    private goToStep(key: string): void {
        if (this.config().steps.some(step => step.key === key) && key !== this.currentStepKey()) {
            this.currentStepKey.set(key);
            this.config().onStepChange?.(key);
        }
    }

    private hasVisibleField(section: FormSection, fieldStates: FormFieldStates): boolean {
        const fields = section.rows.flatMap(row => row.fields);

        return (
            fields.length === 0 ||
            fields.some(field => !fieldStates.get(fieldStateKey(section.key, field.key))?.isHidden)
        );
    }

    private isStepValid(sectionKeys: string[]): boolean {
        this.state();

        return sectionKeys.every(key => this.formGroup().get(key)?.valid ?? true);
    }

    private reset(): void {
        this.formGroup().reset((this.config().initialValue ?? {}) as FormValue);
    }

    private submit(): void {
        const formGroup = this.formGroup();

        if (formGroup.valid) {
            this.config().onSubmit?.(formGroup.getRawValue() as TValue, this.handle);
        }
    }

    private syncControls(formGroup: FormGroup, fieldStates: FormFieldStates): void {
        for (const [key, state] of fieldStates) {
            const control = formGroup.get(key.split('.'));
            const shouldDisable = state.isDisabled || state.isHidden;

            if (control && control.disabled !== shouldDisable) {
                if (shouldDisable) {
                    control.disable();
                } else {
                    control.enable();
                }
            }
        }
    }
}

export function fieldStateKey(sectionKey: string, fieldKey: string): string {
    return `${sectionKey}.${fieldKey}`;
}

function noop(): void {}

function readState(formGroup: FormGroup): FormState {
    return { isDirty: formGroup.dirty, isValid: formGroup.valid, value: formGroup.getRawValue() as FormValue };
}
