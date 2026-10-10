import { FormField, FormRule } from './form-field.model';

export enum FormButtonType {
    Cancel = 'cancel',
    Secondary = 'secondary',
    Submit = 'submit'
}

export type FormButtonLayout = 'end' | 'stretch';

export interface FormHandle<TValue = unknown> {
    close(): void;
    goToStep(key: string): void;
    isDirty(): boolean;
    patchValue(value: Partial<TValue>): void;
    requestClose(): void;
    reset(): void;
    value(): TValue;
}

export class FormButton {
    isHidden: boolean;
    label: string;
    tooltip: string;
    type: FormButtonType;

    action?: (handle: FormHandle) => void;

    constructor({ label, type, action, isHidden = false, tooltip = '' }: FormButtonParameters) {
        this.action = action;
        this.isHidden = isHidden;
        this.label = label;
        this.tooltip = tooltip;
        this.type = type;
    }
}

export class FormConfig<TValue = unknown> {
    allowSubmitWithoutChanges: boolean;
    buttonLayout: FormButtonLayout;
    buttons: FormButton[];
    prefix: string;
    sections: FormSection[];
    steps: FormStep[];

    footer?: FormFooter;
    initialValue?: TValue;
    onCancel?: () => void;
    onReady?: (handle: FormHandle<TValue>) => void;
    onStepChange?: (key: string) => void;
    onSubmit?: (value: TValue, handle: FormHandle<TValue>) => void;
    onValueChange?: (value: TValue, handle: FormHandle<TValue>) => void;

    constructor({
        prefix,
        sections,

        allowSubmitWithoutChanges = false,
        buttonLayout = 'end',
        buttons = [],
        footer,
        initialValue,
        onCancel,
        onReady,
        onStepChange,
        onSubmit,
        onValueChange,
        steps = []
    }: FormConfigParameters<TValue>) {
        this.allowSubmitWithoutChanges = allowSubmitWithoutChanges;
        this.buttonLayout = buttonLayout;
        this.buttons = buttons;
        this.footer = footer;
        this.initialValue = initialValue;
        this.onCancel = onCancel;
        this.onReady = onReady;
        this.onStepChange = onStepChange;
        this.onSubmit = onSubmit;
        this.onValueChange = onValueChange;
        this.prefix = prefix;
        this.sections = sections;
        this.steps = steps;
    }
}

export class FormFooter {
    isDivided: boolean;

    note?: string;

    constructor({ isDivided = true, note }: FormFooterParameters = {}) {
        this.isDivided = isDivided;
        this.note = note;
    }
}

export class FormRow {
    alignment: 'start' | 'end';
    fields: FormField[];

    constructor({ fields, alignment = 'start' }: FormRowParameters) {
        this.alignment = alignment;
        this.fields = fields;
    }
}

export class FormSection {
    isHidden: FormRule<boolean>;
    isTitleVisible: boolean;
    isTooltipVisible: boolean;
    key: string;
    prefix: string;
    rows: FormRow[];

    label?: string;

    constructor({
        key,
        rows,

        isHidden = false,
        isTitleVisible = true,
        isTooltipVisible = false,
        label,
        prefix = key
    }: FormSectionParameters) {
        this.isHidden = isHidden;
        this.isTitleVisible = isTitleVisible;
        this.isTooltipVisible = isTooltipVisible;
        this.key = key;
        this.label = label;
        this.prefix = prefix;
        this.rows = rows;
    }
}

export class FormStep {
    key: string;
    sections: string[];

    constructor({ key, sections }: FormStepParameters) {
        this.key = key;
        this.sections = sections;
    }
}

export interface FormButtonParameters {
    label: string;
    type: FormButtonType;

    action?: (handle: FormHandle) => void;
    isHidden?: boolean;
    tooltip?: string;
}

export interface FormConfigParameters<TValue = unknown> {
    prefix: string;
    sections: FormSection[];

    allowSubmitWithoutChanges?: boolean;
    buttonLayout?: FormButtonLayout;
    buttons?: FormButton[];
    footer?: FormFooter;
    initialValue?: TValue;
    onCancel?: () => void;
    onReady?: (handle: FormHandle<TValue>) => void;
    onStepChange?: (key: string) => void;
    onSubmit?: (value: TValue, handle: FormHandle<TValue>) => void;
    onValueChange?: (value: TValue, handle: FormHandle<TValue>) => void;
    steps?: FormStep[];
}

export interface FormFooterParameters {
    isDivided?: boolean;
    note?: string;
}

export interface FormRowParameters {
    fields: FormField[];

    alignment?: 'start' | 'end';
}

export interface FormSectionParameters {
    key: string;
    rows: FormRow[];

    isHidden?: FormRule<boolean>;
    isTitleVisible?: boolean;
    isTooltipVisible?: boolean;
    label?: string;
    prefix?: string;
}

export interface FormStepParameters {
    key: string;
    sections: string[];
}
