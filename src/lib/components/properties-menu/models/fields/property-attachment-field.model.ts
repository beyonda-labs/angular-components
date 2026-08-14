import { PropertyFieldType } from '../../types/property-field-type';
import { PropertyField, PropertyFieldParameters } from '../property-field.model';

export interface PropertyAttachmentOptionParameters {
    id: string;
    label: string;

    description?: string;
    disabled?: boolean;
    previewUrl?: string;
}

export class PropertyAttachmentOption {
    disabled: boolean;
    id: string;
    label: string;

    description?: string;
    previewUrl?: string;

    constructor({ description, disabled = false, id, label, previewUrl }: PropertyAttachmentOptionParameters) {
        this.description = description;
        this.disabled = disabled;
        this.id = id;
        this.label = label;
        this.previewUrl = previewUrl;
    }
}

export interface PropertyAttachmentFieldParameters extends Omit<PropertyFieldParameters<string>, 'type'> {
    accept?: string;
    maxSizeBytes?: number;
    options?: PropertyAttachmentOptionParameters[];
    previewUrl?: string;
}

export class PropertyAttachmentField extends PropertyField<string> {
    options: PropertyAttachmentOption[];

    accept?: string;
    maxSizeBytes?: number;
    previewUrl?: string;

    constructor({ accept, maxSizeBytes, options = [], previewUrl, ...base }: PropertyAttachmentFieldParameters) {
        super({ ...base, type: PropertyFieldType.Attachment });

        this.accept = accept;
        this.maxSizeBytes = maxSizeBytes;
        this.options = options.map(option =>
            option instanceof PropertyAttachmentOption ? option : new PropertyAttachmentOption(option)
        );
        this.previewUrl = previewUrl;
    }

    get selectedOption(): PropertyAttachmentOption | undefined {
        return this.options.find(option => option.id === this.value);
    }
}
