import { PropertyFieldType } from '../types/property-field-type';

export interface PropertyFieldParameters<T = unknown> {
    id: string;
    type: PropertyFieldType;

    acceptsVariable?: boolean;
    defaultValue?: T;
    description?: string;
    disabled?: boolean;
    hidden?: boolean;
    label?: string;
    metadata?: Record<string, unknown>;
    required?: boolean;
    value?: T;
}

export abstract class PropertyField<T = unknown> {
    acceptsVariable: boolean;
    defaultValue?: T;
    description: string;
    disabled: boolean;
    hidden: boolean;
    id: string;
    label: string;
    metadata: Record<string, unknown>;
    required: boolean;
    type: PropertyFieldType;
    value: T | undefined;

    constructor({
        id,
        type,

        acceptsVariable = false,
        defaultValue,
        description = '',
        disabled = false,
        hidden = false,
        label = `${id}.label`,
        metadata = {},
        required = false,
        value
    }: PropertyFieldParameters<T>) {
        this.acceptsVariable = acceptsVariable;
        this.defaultValue = defaultValue;
        this.description = description;
        this.disabled = disabled;
        this.hidden = hidden;
        this.id = id;
        this.label = label;
        this.metadata = metadata;
        this.required = required;
        this.type = type;
        this.value = value ?? defaultValue;
    }

    withValue(value: T | undefined): this {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this, { value });
    }
}
