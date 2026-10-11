import { FormListField } from '../models/fields/form-list-field.model';
import { FormField } from '../models/form-field.model';

export function holdsListValue(field: FormField): boolean {
    return field instanceof FormListField && (field.options !== undefined || field.picker !== undefined);
}
