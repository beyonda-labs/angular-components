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
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, map, startWith, switchMap } from 'rxjs';

import { ButtonComponent } from '../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../internal/button/models/button-config.model';
import { nextDomId } from '../../internal/dom-ids/dom-ids';
import { FormSectionComponent } from './components/section/section.component';
import { haveSameOptions, isFreeText, offersOwnOptions, ruleOf } from './functions/field-options';
import { fieldStateKey } from './functions/field-state-key';
import { noop, submitType } from './functions/form-buttons';
import { resolveRule } from './functions/form-rule-resolution';
import { readState } from './functions/form-state';
import { fieldsOf } from './functions/section-fields';
import { FormButton, FormButtonType, FormConfig, FormHandle, FormSection } from './models/form.model';
import { FormField, FormFieldOption, FormFieldType, FormValue } from './models/form-field.model';
import { FormFieldState, FormFieldStates } from './models/form-field-state.model';
import { FORM_HOST } from './models/form-host.model';
import { FormService } from './services/form.service';

const NEXT_LABEL = 'angular-components.form.steps.next';
const BACK_LABEL = 'angular-components.form.steps.back';
const INVALID_TOOLTIP = 'angular-components.form.submit.invalid';
const WITHOUT_CHANGES_TOOLTIP = 'angular-components.form.submit.without-changes';
const CANCEL_WITHOUT_CHANGES_TOOLTIP = 'angular-components.form.cancel.without-changes';
const OPTION_FIELD_TYPES: ReadonlySet<FormFieldType> = new Set([
    FormFieldType.Autocomplete,
    FormFieldType.Radio,
    FormFieldType.Select
]);

type FormValidatorErrors = ReadonlyMap<string, ValidationErrors | null>;

interface FormSync {
    fieldStates: FormFieldStates;
    validatorErrors: FormValidatorErrors;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonComponent, FontAwesomeModule, FormSectionComponent, TranslateModule],
    selector: 'bey-form',
    standalone: true,
    styleUrls: ['./form.component.css'],
    templateUrl: './form.component.html'
})
export class FormComponent<TValue = unknown> {
    private readonly formHost = inject(FORM_HOST, { optional: true });
    private readonly formService = inject(FormService);

    readonly config = input.required<FormConfig<TValue>>();

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
    readonly currentStepKey = linkedSignal<string | null>(() => this.config().steps[0]?.key ?? null);
    readonly fieldStates = computed<FormFieldStates>(() => {
        const { value } = this.state();
        const formGroup = this.formGroup();
        const states = new Map<string, FormFieldState>();

        for (const section of this.config().sections) {
            for (const field of fieldsOf(section)) {
                const control = formGroup.get([section.key, field.key]);

                states.set(fieldStateKey(section.key, field.key), {
                    excludedValues: resolveRule(ruleOf<string>(field, 'excludedValues'), value),
                    isDisabled: resolveRule(field.isDisabled, value),
                    isHidden: resolveRule(field.isHidden, value),
                    isRequired: resolveRule(field.isRequired, value),
                    isValid: control?.valid ?? true,
                    options: resolveRule(ruleOf<FormFieldOption>(field, 'options'), value)
                });
            }
        }

        return states;
    });
    readonly footerNote = computed(() => this.config().footer?.note ?? '');
    readonly formGroup = computed(() => {
        const config = this.config();

        return untracked(() => this.formService.buildFormGroup(config));
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
    readonly hasFooter = computed(() => this.config().footer !== undefined);
    readonly isFooterDivided = computed(() => this.config().footer?.isDivided ?? false);
    readonly noteIcon = faCircleInfo;
    readonly noteId = nextDomId('bey-form-note');
    readonly state = linkedSignal(() => readState(this.formGroup()));
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

    private readonly lastSync = linkedSignal<FormGroup, FormSync | null>({
        computation: () => null,
        source: this.formGroup
    });
    private readonly validatorErrors = computed<FormValidatorErrors>(() => {
        this.state();

        const formGroup = this.formGroup();
        const errors = new Map<string, ValidationErrors | null>();

        for (const section of this.config().sections) {
            for (const field of fieldsOf(section)) {
                const control = formGroup.get([section.key, field.key]);
                const validate = this.formService.getCustomValidator(field);

                if (control && validate) {
                    errors.set(fieldStateKey(section.key, field.key), validate(control));
                }
            }
        }

        return errors;
    });

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
            const sync: FormSync = { fieldStates: this.fieldStates(), validatorErrors: this.validatorErrors() };

            untracked(() => {
                this.syncControls(formGroup, sync, this.lastSync());
                this.lastSync.set(sync);
            });
        });
    }

    sectionGroup(section: FormSection): FormGroup {
        return this.formGroup().get(section.key) as FormGroup;
    }

    private buildButton(button: FormButton): ButtonConfig {
        const { isDirty, isValid } = this.state();
        const { canSubmitWithoutChanges } = this.config();
        const isDescribedByNote = button.type === FormButtonType.Submit && this.footerNote() !== '';
        const base = {
            describedBy: isDescribedByNote ? this.noteId : undefined,
            label: button.label,
            tooltip: button.tooltip
        };

        if (button.action) {
            const { action } = button;

            return new ButtonConfig({
                ...base,
                action: () => action(this.handle),
                type: button.type === FormButtonType.Submit ? submitType(button) : ButtonType.Secondary
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
            const requiresChanges = !isDirty && !canSubmitWithoutChanges;
            const blockedTooltip = requiresChanges ? WITHOUT_CHANGES_TOOLTIP : INVALID_TOOLTIP;

            return new ButtonConfig({
                ...base,
                action: () => this.submit(),
                isDisabled: requiresChanges || !isValid,
                tooltip: requiresChanges || !isValid ? blockedTooltip : button.tooltip,
                type: submitType(button)
            });
        }

        return new ButtonConfig({ ...base, action: noop, type: ButtonType.Tertiary });
    }

    private cancel(): void {
        this.reset();
        this.config().onCancel?.();
    }

    private dropUnlistedValue(
        control: AbstractControl,
        field: FormField,
        state: FormFieldState,
        previous: FormFieldState | undefined
    ): void {
        const emptyValue = this.formService.emptyValue(field.type);
        const { value } = control;

        if (
            previous &&
            value !== null &&
            value !== undefined &&
            value !== emptyValue &&
            !haveSameOptions(previous.options, state.options) &&
            !state.options.some(option => option.value === value)
        ) {
            control.setValue(emptyValue);
        }
    }

    private goToStep(key: string): void {
        if (this.config().steps.some(step => step.key === key) && key !== this.currentStepKey()) {
            this.currentStepKey.set(key);
            this.config().onStepChange?.(key);
        }
    }

    private hasVisibleField(section: FormSection, fieldStates: FormFieldStates): boolean {
        const fields = fieldsOf(section);

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

    private syncControls(formGroup: FormGroup, sync: FormSync, previous: FormSync | null): void {
        for (const section of this.config().sections) {
            for (const field of fieldsOf(section)) {
                const key = fieldStateKey(section.key, field.key);
                const control = formGroup.get([section.key, field.key]);
                const state = sync.fieldStates.get(key);

                if (control && state) {
                    this.formService.syncDisabled(control, state);
                    this.formService.syncRequired(control, state.isRequired);

                    if (sync.validatorErrors.has(key)) {
                        this.formService.syncValidatorErrors(
                            control,
                            sync.validatorErrors.get(key) ?? null,
                            previous?.validatorErrors.get(key) ?? null
                        );
                    }

                    if (OPTION_FIELD_TYPES.has(field.type) && !isFreeText(field)) {
                        this.dropUnlistedValue(control, field, state, previous?.fieldStates.get(key));
                    } else if (offersOwnOptions(field)) {
                        this.formService.dropUnlistedIds(control, state, previous?.fieldStates.get(key));
                    }
                }
            }
        }
    }
}
