import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { FormField, FormFieldColumn, FormFieldType } from '../form-field.model';

export interface FormInfoItem {
    label: string;

    icon?: IconDefinition;
}

export class FormInfoField extends FormField {
    items: FormInfoItem[];

    constructor({
        key,
        columns,
        isHidden,
        isLabelTooltipVisible,
        isLabelVisible,
        items = []
    }: FormInfoFieldParameters) {
        super({
            key,
            columns,
            isDisabled: true,
            isHidden,
            isLabelTooltipVisible,
            isLabelVisible,
            isRequired: false,
            type: FormFieldType.Info
        });

        this.items = items;
    }
}

interface FormInfoFieldParameters {
    key: string;

    columns?: FormFieldColumn;
    isHidden?: boolean;
    isLabelTooltipVisible?: boolean;
    isLabelVisible?: boolean;
    items?: FormInfoItem[];
}
