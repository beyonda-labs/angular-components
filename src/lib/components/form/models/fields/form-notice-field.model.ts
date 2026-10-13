import { NoticeVariant } from '../../../notice/models/notice.model';
import { FormField, FormFieldBaseParameters, FormFieldType } from '../form-field.model';

export class FormNoticeField extends FormField {
    message: string;
    variant: NoticeVariant;

    messageParameters?: Record<string, unknown>;

    constructor({
        isLabelVisible = false,
        message,
        messageParameters,
        variant = NoticeVariant.Info,
        ...base
    }: FormNoticeFieldParameters) {
        super({ ...base, isLabelVisible, type: FormFieldType.Notice });

        this.message = message;
        this.messageParameters = messageParameters;
        this.variant = variant;
    }
}

export interface FormNoticeFieldParameters extends FormFieldBaseParameters {
    message: string;

    messageParameters?: Record<string, unknown>;
    variant?: NoticeVariant;
}
