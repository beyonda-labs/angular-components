import { PropertyFieldType } from '../../types/property-field-type';
import { PropertyField, PropertyFieldParameters } from '../property-field.model';
import { PropertyVariable, PropertyVariableParameters } from '../property-variable.model';

export interface PropertyAttachmentOptionParameters {
    id: string;
    label: string;

    description?: string;
    disabled?: boolean;
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
    options?: PropertyAttachmentOptionParameters[];
    variables?: PropertyVariableParameters[];
}

export class PropertyAttachmentField extends PropertyField<string> {
    options: PropertyAttachmentOption[];
    variables: PropertyVariable[];

    accept?: string;
    maxSizeBytes?: number;

    constructor({ accept, maxSizeBytes, options = [], variables = [], ...base }: PropertyAttachmentFieldParameters) {
        super({ ...base, type: PropertyFieldType.Attachment });

        this.accept = accept;
        this.maxSizeBytes = maxSizeBytes;
        this.options = options.map(option =>
            option instanceof PropertyAttachmentOption ? option : new PropertyAttachmentOption(option)
        );
        this.variables = variables.map(variable =>
            variable instanceof PropertyVariable ? variable : new PropertyVariable(variable)
        );
    }

    get selectedOption(): PropertyAttachmentOption | undefined {
        return this.options.find(option => option.id === this.value);
    }

    get holdsVariable(): boolean {
        return (this.value ?? '').trim().startsWith('{{');
    }
}
