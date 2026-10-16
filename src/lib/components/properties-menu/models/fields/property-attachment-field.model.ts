import { PropertyField, PropertyFieldParameters } from '../property-field.model';
import { PropertyFieldType } from '../property-field-type.model';
import { PropertyVariable } from '../property-variable.model';

export class PropertyAttachmentField extends PropertyField<string> {
    isUploadEnabled: boolean;
    options: PropertyAttachmentOption[];
    variables: PropertyVariable[];

    accept?: string;
    maxSizeBytes?: number;

    constructor({
        accept,
        isUploadEnabled = true,
        maxSizeBytes,
        options = [],
        variables = [],
        ...base
    }: PropertyAttachmentFieldParameters) {
        super({ ...base, type: PropertyFieldType.Attachment });
        this.accept = accept;
        this.isUploadEnabled = isUploadEnabled;
        this.maxSizeBytes = maxSizeBytes;
        this.options = options;
        this.variables = variables;
    }
}

export class PropertyAttachmentOption {
    id: string;
    isDisabled: boolean;
    label: string;

    description?: string;

    constructor({ description, id, isDisabled = false, label }: PropertyAttachmentOptionParameters) {
        this.description = description;
        this.id = id;
        this.isDisabled = isDisabled;
        this.label = label;
    }
}

export interface PropertyAttachmentFieldParameters extends Omit<PropertyFieldParameters<string>, 'type'> {
    accept?: string;
    isUploadEnabled?: boolean;
    maxSizeBytes?: number;
    options?: PropertyAttachmentOption[];
    variables?: PropertyVariable[];
}

export interface PropertyAttachmentOptionParameters {
    id: string;
    label: string;

    description?: string;
    isDisabled?: boolean;
}
