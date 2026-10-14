import {
    PropertyAttachmentField,
    PropertyAttachmentOption
} from '../../../../models/fields/property-attachment-field.model';

type AttachmentValue = Pick<PropertyAttachmentField, 'options' | 'value'>;

export function isUnresolvedAttachment(field: AttachmentValue): boolean {
    const { options, value } = field;

    return (
        Boolean(value?.trim()) &&
        !isVariableReference(value) &&
        options.length > 0 &&
        selectedAttachmentOption(field) === undefined
    );
}

export function isVariableReference(value: string | undefined): boolean {
    return (value ?? '').trim().startsWith('{{');
}

export function selectedAttachmentOption({ options, value }: AttachmentValue): PropertyAttachmentOption | undefined {
    return options.find(option => option.id === value);
}
