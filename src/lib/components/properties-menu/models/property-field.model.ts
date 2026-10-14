import { IconDefinition } from '@fortawesome/angular-fontawesome';

import { PropertyFieldType } from './property-field-type.model';

export type PropertyFieldSpan = 'full' | 'half';

export interface PropertyFieldActionButton {
    icon: IconDefinition;

    key?: string;
}

export abstract class PropertyField<T = unknown> {
    canAcceptVariable: boolean;
    description: string;
    id: string;
    isDisabled: boolean;
    isHidden: boolean;
    isRequired: boolean;
    label: string;
    metadata: Record<string, unknown>;
    span: PropertyFieldSpan;
    type: PropertyFieldType;
    value: T | undefined;

    actionButton?: PropertyFieldActionButton;
    defaultValue?: T;

    constructor({
        id,
        type,
        actionButton,
        canAcceptVariable = false,
        defaultValue,
        description = '',
        isDisabled = false,
        isHidden = false,
        isRequired = false,
        label = `${id}.label`,
        metadata = {},
        span = 'full',
        value
    }: PropertyFieldParameters<T>) {
        this.actionButton = actionButton ? { icon: actionButton.icon, key: actionButton.key ?? id } : undefined;
        this.canAcceptVariable = canAcceptVariable;
        this.defaultValue = defaultValue;
        this.description = description;
        this.id = id;
        this.isDisabled = isDisabled;
        this.isHidden = isHidden;
        this.isRequired = isRequired;
        this.label = label;
        this.metadata = metadata;
        this.span = span;
        this.type = type;
        this.value = value ?? defaultValue;
    }
}

export interface PropertyFieldParameters<T = unknown> {
    id: string;
    type: PropertyFieldType;

    actionButton?: PropertyFieldActionButton;
    canAcceptVariable?: boolean;
    defaultValue?: T;
    description?: string;
    isDisabled?: boolean;
    isHidden?: boolean;
    isRequired?: boolean;
    label?: string;
    metadata?: Record<string, unknown>;
    span?: PropertyFieldSpan;
    value?: T;
}
