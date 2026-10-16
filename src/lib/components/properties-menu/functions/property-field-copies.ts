import { PropertyField } from '../models/property-field.model';

export function propertyFieldWithDisabled<TField extends PropertyField>(field: TField, isDisabled = true): TField {
    return copyField(field, { isDisabled });
}

export function propertyFieldWithValue<TField extends PropertyField>(field: TField, value: TField['value']): TField {
    return copyField(field, { value });
}

function copyField<TField extends PropertyField>(field: TField, changes: Partial<PropertyField>): TField {
    const copy = Object.create(Object.getPrototypeOf(field) as object) as TField;

    return Object.assign(copy, field, changes);
}
