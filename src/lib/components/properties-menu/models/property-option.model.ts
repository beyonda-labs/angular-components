import { IconDefinition } from '@fortawesome/angular-fontawesome';

export class PropertyOption<T = unknown> {
    isDisabled: boolean;
    label: string;
    value: T;

    icon?: IconDefinition;

    constructor({ icon, isDisabled = false, label = '', value }: PropertyOptionParameters<T>) {
        this.icon = icon;
        this.isDisabled = isDisabled;
        this.label = label;
        this.value = value;
    }
}

export interface PropertyOptionParameters<T = unknown> {
    value: T;

    icon?: IconDefinition;
    isDisabled?: boolean;
    label?: string;
}
