import { IconDefinition } from '@fortawesome/angular-fontawesome';

export class PropertyOption<T = unknown> {
    disabled: boolean;
    label: string;
    value: T;

    icon?: IconDefinition;

    constructor({ disabled = false, icon, label = '', value }: PropertyOptionParameters<T>) {
        this.disabled = disabled;
        this.icon = icon;
        this.label = label;
        this.value = value;
    }
}

export interface PropertyOptionParameters<T = unknown> {
    value: T;

    disabled?: boolean;
    icon?: IconDefinition;
    label?: string;
}
