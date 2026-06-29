import { Component, inject, Input, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';

import { ButtonComponent } from '../../internal/button/button.component';
import { ButtonConfig, ButtonType } from '../../internal/button/models/button-config.model';
import { FormSectionComponent } from './components/section/section.component';
import { FormButton, FormButtonType, FormConfig } from './models/form.model';
import { FormService } from './services/form.service';

@Component({
    imports: [ButtonComponent, FormSectionComponent],
    selector: 'bey-form',
    standalone: true,
    templateUrl: './form.component.html'
})
export class FormComponent implements OnDestroy {
    @Input({ required: true })
    set config(value: FormConfig) {
        this._config = value;
        this.buildForm();
    }
    get config(): FormConfig {
        return this._config;
    }

    formGroup!: FormGroup;

    private _config!: FormConfig;
    private readonly destroy$ = new Subject<void>();
    private readonly configChange$ = new Subject<void>();

    private readonly formService = inject(FormService);

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.configChange$.next();
        this.configChange$.complete();
    }

    getFormButton(button: FormButton): ButtonConfig {
        return new ButtonConfig({
            action: this.getButtonAction(button),
            customClass: button.customClass,
            customStyles: button.customStyles,
            isDisabled: this.getButtonDisabled(button),
            isHidden: button.isHidden,
            label: button.label,
            tooltip: this.getButtonTooltip(button),
            type: this.getButtonType(button.type)
        });
    }

    private bindOnValueChangeIfNeeded(formGroup: FormGroup): void {
        if (!this.config.onValueChange) {return;}

        formGroup.valueChanges
            .pipe(debounceTime(0), takeUntil(this.configChange$), takeUntil(this.destroy$))
            .subscribe(() => {
                const currentValue = formGroup.getRawValue() as unknown;

                this.config.onValueChange?.(currentValue, this.config);
            });
    }

    private buildForm(): void {
        this.configChange$.next();
        const formGroup = new FormGroup({});

        this.config.sections.forEach(section => {
            const sectionGroup = new FormGroup({});

            section.rows.forEach(row => {
                row.fields.forEach(field => {
                    const existingControl = sectionGroup?.get(field.key);

                    if (!existingControl) {
                        const fieldControl = this.formService.initFieldControl(field);

                        if (fieldControl) {
                            sectionGroup.addControl(field.key, fieldControl);
                        }
                    }
                });
            });

            formGroup.addControl(section.key, sectionGroup);
        });

        this.formGroup = formGroup;
        this.config.formGroup = formGroup;

        this.config.onFormGroupAdded?.(formGroup, this.config);
        this.bindOnValueChangeIfNeeded(formGroup);
    }

    private cancelAction(): void {
        if (this.config.formGroup) {
            this.config.formGroup.reset(this.config.initialValue);
            this.config.onCancel?.();
        }
    }

    private getButtonAction(button: FormButton): () => void {
        if (button.action) {
            return button.action;
        }

        if (button.type === FormButtonType.Cancel) {
            return () => this.cancelAction();
        }

        if (button.type === FormButtonType.Submit) {
            return () => this.submitAction();
        }

        return () => {};
    }

    private getButtonDisabled(button: FormButton): boolean {
        if (button.type === FormButtonType.Cancel) {
            return !this.config.formGroup?.dirty === true;
        }

        if (button.type === FormButtonType.Submit) {
            return !this.config.formGroup?.valid === true;
        }

        return false;
    }

    private getButtonTooltip(button: FormButton): string {
        if (button.type === FormButtonType.Cancel) {
            return this.config.formGroup?.dirty === true ? '' : 'angular-components.form.cancel.without-changes';
        }

        if (button.type === FormButtonType.Submit) {
            if (this.config.formGroup?.valid) {
                return button.tooltip;
            }

            return 'angular-components.form.submit.invalid';
        }

        return button.tooltip;
    }

    private getButtonType(type: FormButtonType): ButtonType {
        switch (type) {
            case FormButtonType.Cancel:
            case FormButtonType.Previous:
                return ButtonType.Secondary;
            case FormButtonType.Next:
            case FormButtonType.Submit:
                return ButtonType.Primary;
            default:
                return ButtonType.Tertiary;
        }
    }

    private submitAction(): void {
        if (this.config.formGroup?.valid) {
            const currentValue = this.config.formGroup.getRawValue() as unknown;

            this.config.onSubmit?.(currentValue, this.config);
        }
    }
}
