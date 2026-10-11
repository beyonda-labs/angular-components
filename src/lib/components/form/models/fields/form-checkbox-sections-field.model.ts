import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { FormField, FormFieldBaseParameters, FormFieldType } from '../form-field.model';
import { FormFieldCustomValidator } from '../form-field-validator.model';

export interface FormCheckboxSection {
    key: string;
    label: string;
    options: FormCheckboxSectionOption[];

    icon?: IconDefinition;
}

export interface FormCheckboxSectionOption {
    label: string;
    value: string;

    description?: string;
    isDisabled?: boolean;
}

export interface FormCheckboxSectionOptionView {
    descriptionId: string;
    id: string;
    isChecked: boolean;
    isDisabled: boolean;
    label: string;
    value: string;

    description?: string;
}

export interface FormCheckboxSectionsViewOptions {
    expandedKeys: ReadonlySet<string>;
    fieldKey: string;
    isDisabled: boolean;
    values: string[];
}

export interface FormCheckboxSectionView {
    bodyId: string;
    checkedCount: number;
    controlsId: string | null;
    countParameters: { checked: number; total: number };
    hasToggleAll: boolean;
    isAllChecked: boolean;
    isExpanded: boolean;
    key: string;
    label: string;
    options: FormCheckboxSectionOptionView[];
    titleId: string;
    toggleAllLabel: string;
    toggleAllName: string;
    total: number;

    icon?: IconDefinition;
}

export class FormCheckboxSectionsField extends FormField {
    sections: FormCheckboxSection[];

    constructor({ sections = [], ...base }: FormCheckboxSectionsFieldParameters) {
        super({ ...base, type: FormFieldType.CheckboxSections });

        this.sections = sections;
    }
}

export interface FormCheckboxSectionsFieldParameters extends FormFieldBaseParameters {
    sections?: FormCheckboxSection[];
    validators?: FormFieldCustomValidator[];
}

export const FORM_CHECKBOX_SECTIONS_TEXTS = {
    clearAll: 'angular-components.form.checkbox-sections.clear-all',
    clearAllIn: 'angular-components.form.checkbox-sections.clear-all-in',
    count: 'angular-components.form.checkbox-sections.count',
    selectAll: 'angular-components.form.checkbox-sections.select-all',
    selectAllIn: 'angular-components.form.checkbox-sections.select-all-in'
} as const;
