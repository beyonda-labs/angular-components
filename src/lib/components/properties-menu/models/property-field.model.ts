import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { PropertyFieldType } from './property-field-type.model';

export type PropertyFieldSpan = 'full' | 'half';

export interface PropertyFieldActionButton {
    icon: IconDefinition;

    key?: string;
}

export abstract class PropertyField<T = unknown> {
    acceptsVariable: boolean;
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

    actionButton?: PropertyFieldActionButton;
    defaultValue?: T;

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

    withDisabled(disabled = true): this {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this, { disabled });
    }

    withValue(value: T | undefined): this {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this, { value });
    }
}

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
