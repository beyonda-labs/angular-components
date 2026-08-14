import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { PropertyFieldType } from '../types/property-field-type';

export interface PropertyFieldActionButton {
    icon: IconDefinition;

    key?: string;
}

export type PropertyFieldSpan = 'full' | 'half';

export interface PropertyFieldParameters<T = unknown> {
    id: string;
    type: PropertyFieldType;

    acceptsVariable?: boolean;
    actionButton?: PropertyFieldActionButton;
    defaultValue?: T;
    description?: string;
    disabled?: boolean;
    hidden?: boolean;
    label?: string;
    metadata?: Record<string, unknown>;
    required?: boolean;
    span?: PropertyFieldSpan;
    value?: T;
}

export abstract class PropertyField<T = unknown> {
    acceptsVariable: boolean;
    actionButton?: PropertyFieldActionButton;
    defaultValue?: T;
    description: string;
    disabled: boolean;
    hidden: boolean;
    id: string;
    label: string;
    metadata: Record<string, unknown>;
    required: boolean;
    span: PropertyFieldSpan;
    type: PropertyFieldType;
    value: T | undefined;

    constructor({
        id,
        type,

        acceptsVariable = false,
        actionButton,
        defaultValue,
        description = '',
        disabled = false,
        hidden = false,
        label = `${id}.label`,
        metadata = {},
        required = false,
        span = 'full',
        value
    }: PropertyFieldParameters<T>) {
        this.acceptsVariable = acceptsVariable;
        this.actionButton = actionButton ? { icon: actionButton.icon, key: actionButton.key ?? id } : undefined;
        this.defaultValue = defaultValue;
        this.description = description;
        this.disabled = disabled;
        this.hidden = hidden;
        this.id = id;
        this.label = label;
        this.metadata = metadata;
        this.required = required;
        this.span = span;
        this.type = type;
        this.value = value ?? defaultValue;
    }

    withValue(value: T | undefined): this {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this, { value });
    }
}
