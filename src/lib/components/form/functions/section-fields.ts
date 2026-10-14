import { FormSection } from '../models/form.model';
import { FormField } from '../models/form-field.model';

export function fieldsOf(section: Pick<FormSection, 'rows'>): FormField[] {
    return section.rows.flatMap(row => row.fields);
}
