import type { FormGroup } from '@angular/forms';
import { v4 as uuid } from 'uuid';

import { FormField } from './form-field.model';

export class FormConfig<TValue = unknown> {
    buttons: FormButton[];
    i18nPrefix: string;
    id: string;
    sections: FormSection[];
    steps: FormStep[];

    formGroup?: FormGroup;
    initialValue?: TValue;
    onCancel?: () => void;
    onFormGroupAdded?: (formGroup: FormGroup, form: FormConfig<TValue>) => void;
    onSubmit?: (currentValue: TValue, form: FormConfig<TValue>) => void;
    onValueChange?: (currentValue: TValue, form: FormConfig<TValue>) => void;

    constructor({
        i18nPrefix,
        sections,

        buttons = [],
        id = uuid(),
        onCancel,
        onFormGroupAdded,
        onSubmit,
        onValueChange,
        steps = []
    }: FormConfigParameters<TValue>) {
        this.buttons = buttons;
        this.id = id;
        this.i18nPrefix = i18nPrefix;
        this.onCancel = onCancel;
        this.onFormGroupAdded = onFormGroupAdded;
        this.onSubmit = onSubmit;
        this.onValueChange = onValueChange;
        this.sections = sections;
        this.steps = steps;
    }

    getInitialValue(): TValue | undefined {
        return this.initialValue;
    }

    getValue(): TValue | undefined {
        return this.formGroup?.getRawValue();
    }

    patchValue(value: Partial<TValue>, emitEvent = false): void {
        this.formGroup?.patchValue(value as Record<string, unknown>, { emitEvent });
    }

    setInitialValue(value: TValue): void {
        if (this.formGroup) {
            this.initialValue = value;
            this.formGroup.reset(value, { emitEvent: false });
        }
    }
}

interface FormConfigParameters<TValue> {
    i18nPrefix: string;
    sections: FormSection[];

    buttons?: FormButton[];
    id?: string;
    onCancel?: () => void;
    onFormGroupAdded?: (formGroup: FormGroup, form: FormConfig<TValue>) => void;
    onSubmit?: (currentValue: TValue, form: FormConfig<TValue>) => void;
    onValueChange?: (currentValue: TValue, form: FormConfig<TValue>) => void;
    steps?: FormStep[];
}

export class FormSection {
    isHidden: boolean;
    isTitleVisible: boolean;
    isTooltipVisible: boolean;
    key: string;
    rows: FormRow[];

    constructor({
        key,
        rows,

        isHidden = false,
        isTitleVisible = true,
        isTooltipVisible = false
    }: FormSectionParameters) {
        this.isHidden = isHidden;
        this.isTitleVisible = isTitleVisible;
        this.isTooltipVisible = isTooltipVisible;
        this.key = key;
        this.rows = rows;
    }
}

interface FormSectionParameters {
    key: string;
    rows: FormRow[];

    isHidden?: boolean;
    isTitleVisible?: boolean;
    isTooltipVisible?: boolean;
}

export class FormRow {
    alignment: 'start' | 'end';
    fields: FormField[];

    constructor({
        fields,

        alignment = 'start'
    }: FormRowParameters) {
        this.alignment = alignment;
        this.fields = fields;
    }
}

interface FormRowParameters {
    fields: FormField[];

    alignment?: 'start' | 'end';
}

export class FormStep {
    sections: string[];
}

export class FormButton {
    isHidden: boolean;
    label: string;
    tooltip: string;
    type: FormButtonType;

    action?: () => void;
    customClass?: string;
    customStyles?: string;

    constructor({
        action,
        label,
        type,

        customClass,
        customStyles,
        isHidden = false,
        tooltip = ''
    }: FormButtonParameters) {
        this.action = action;
        this.customClass = customClass;
        this.customStyles = customStyles;
        this.isHidden = isHidden;
        this.label = label;
        this.tooltip = tooltip;
        this.type = type;
    }
}

interface FormButtonParameters {
    label: string;
    type: FormButtonType;

    action?: () => void;
    customClass?: string;
    customStyles?: string;
    isHidden?: boolean;
    tooltip?: string;
}

export enum FormButtonType {
    Cancel,
    Next,
    Optional,
    Previous,
    Submit
}
