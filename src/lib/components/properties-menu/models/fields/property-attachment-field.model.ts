import { PropertyField, PropertyFieldParameters } from '../property-field.model';
import { PropertyFieldType } from '../property-field-type.model';
import { PropertyVariable } from '../property-variable.model';

export class PropertyAttachmentField extends PropertyField<string> {
    options: PropertyAttachmentOption[];
    variables: PropertyVariable[];

    accept?: string;
    maxSizeBytes?: number;

    constructor({ accept, maxSizeBytes, options = [], variables = [], ...base }: PropertyAttachmentFieldParameters) {
        super({ ...base, type: PropertyFieldType.Attachment });
        this.accept = accept;
        this.maxSizeBytes = maxSizeBytes;
        this.options = options;
        this.variables = variables;
    }

    get holdsVariable(): boolean {
        return (this.value ?? '').trim().startsWith('{{');
    }

    get selectedOption(): PropertyAttachmentOption | undefined {
        return this.options.find(option => option.id === this.value);
    }
}

export class PropertyAttachmentOption {
    disabled: boolean;
    id: string;
    label: string;

    description?: string;

    constructor({ description, disabled = false, id, label }: PropertyAttachmentOptionParameters) {
        this.description = description;
        this.disabled = disabled;
        this.id = id;
        this.label = label;
    }
}

export interface PropertyAttachmentFieldParameters extends Omit<PropertyFieldParameters<string>, 'type'> {
    accept?: string;
    maxSizeBytes?: number;
    options?: PropertyAttachmentOption[];
    variables?: PropertyVariable[];
}

export interface PropertyAttachmentOptionParameters {
    id: string;
    label: string;

    description?: string;
    disabled?: boolean;
}
