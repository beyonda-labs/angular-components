export enum PropertyVariableType {
    Array = 'array',
    Boolean = 'boolean',
    Date = 'date',
    Number = 'number',
    Object = 'object',
    String = 'string'
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

export class PropertyVariable {
    children: PropertyVariable[];
    description: string;
    example?: unknown;
    id: string;
    label: string;
    path: string;
    type: PropertyVariableType;

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
