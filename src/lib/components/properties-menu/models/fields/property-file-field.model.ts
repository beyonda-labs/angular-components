import { PropertyField, PropertyFieldParameters } from '../property-field.model';
import { PropertyFieldType } from '../property-field-type.model';

export class PropertyFileField extends PropertyField<string> {
    accept?: string;
    fileName?: string;
    maxSizeBytes?: number;

    constructor({ accept, fileName, maxSizeBytes, ...base }: PropertyFileFieldParameters) {
        super({ ...base, type: PropertyFieldType.File });

        this.accept = accept;
        this.fileName = fileName;
        this.maxSizeBytes = maxSizeBytes;
    }
}

export interface PropertyFileFieldParameters extends Omit<PropertyFieldParameters<string>, 'type'> {
    accept?: string;
    fileName?: string;
    maxSizeBytes?: number;
}
