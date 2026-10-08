import { IconDefinition } from '@fortawesome/angular-fontawesome';
import { faDatabase } from '@fortawesome/free-solid-svg-icons';

export enum PropertyVariableType {
    Array = 'array',
    Boolean = 'boolean',
    Date = 'date',
    Number = 'number',
    Object = 'object',
    String = 'string'
}

export class PropertyVariable {
    children: PropertyVariable[];
    description: string;
    id: string;
    label: string;
    path: string;
    type: PropertyVariableType;

    example?: unknown;

    constructor({
        children = [],
        description = '',
        example,
        id,
        label,
        path,
        type = PropertyVariableType.String
    }: PropertyVariableParameters) {
        this.children = children;
        this.description = description;
        this.example = example;
        this.id = id;
        this.label = label ?? path;
        this.path = path;
        this.type = type;
    }
}

export interface PropertyVariableParameters {
    id: string;
    path: string;

    children?: PropertyVariable[];
    description?: string;
    example?: unknown;
    label?: string;
    type?: PropertyVariableType;
}

export const PROPERTY_VARIABLE_ICON: IconDefinition = faDatabase;
