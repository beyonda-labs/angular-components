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
    isDanger: boolean;
    isHidden: boolean;
    label: string;
    tooltip: string;
    type: FormButtonType;

    action?: (handle: FormHandle) => void;

    constructor({ action, isDanger = false, isHidden = false, label, tooltip = '', type }: FormButtonParameters) {
        this.action = action;
        this.isDanger = isDanger;
        this.isHidden = isHidden;
        this.label = label;
        this.tooltip = tooltip;
        this.type = type;
    }
}

export class FormConfig<TValue = unknown> {
    buttonLayout: FormButtonLayout;
    buttons: FormButton[];
    canSubmitWithoutChanges: boolean;
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
        buttonLayout = 'end',
        buttons = [],
        canSubmitWithoutChanges = false,
        footer,
        initialValue,
        onCancel,
        onReady,
        onStepChange,
        onSubmit,
        onValueChange,
        prefix,
        sections,
        steps = []
    }: FormConfigParameters<TValue>) {
        this.buttonLayout = buttonLayout;
        this.buttons = buttons;
        this.canSubmitWithoutChanges = canSubmitWithoutChanges;
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

    constructor({ alignment = 'start', fields }: FormRowParameters) {
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
        isHidden = false,
        isTitleVisible = true,
        isTooltipVisible = false,
        key,
        label,
        prefix = key,
        rows
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
    isDanger?: boolean;
    isHidden?: boolean;
    tooltip?: string;
}

export interface FormConfigParameters<TValue = unknown> {
    prefix: string;
    sections: FormSection[];

    buttonLayout?: FormButtonLayout;
    buttons?: FormButton[];
    canSubmitWithoutChanges?: boolean;
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
