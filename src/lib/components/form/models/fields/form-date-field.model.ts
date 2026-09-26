import { DateFormatService } from '../../services/date-format.service';
import { FormField, FormFieldBaseParameters, FormFieldType } from '../form-field.model';

export class FormDateField extends FormField {
    format: string;

    maxDate?: string;
    minDate?: string;

    constructor({ format = DateFormatService.DEFAULT_FORMAT, maxDate, minDate, ...base }: FormDateFieldParameters) {
        super({ ...base, type: FormFieldType.Date });

        this.format = format;
        this.maxDate = maxDate;
        this.minDate = minDate;
    }
}

export interface FormDateFieldParameters extends FormFieldBaseParameters {
    format?: string;
    maxDate?: string;
    minDate?: string;
}
