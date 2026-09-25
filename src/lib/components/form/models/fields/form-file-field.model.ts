import { FormField, FormFieldBaseParameters, FormFieldType } from '../form-field.model';

export class FormFileField extends FormField {
    accept: string[];

    maxSizeBytes?: number;

    constructor({ accept = [], maxSizeBytes, ...base }: FormFileFieldParameters) {
        super({ ...base, type: FormFieldType.File });

        this.accept = accept;
        this.maxSizeBytes = maxSizeBytes;
    }
}

export interface FormFileFieldParameters extends FormFieldBaseParameters {
    accept?: string[];
    maxSizeBytes?: number;
}

export { matchesAcceptPattern } from '../../../../internal/file/accept-pattern.util';
