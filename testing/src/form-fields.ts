import { BeyFormField, BeyFormSection } from '@beyonda-labs/angular-components';

import { FormFieldsSource } from './models/testing.model';

export function fieldsOf<TField extends BeyFormField = BeyFormField>(
    source: FormFieldsSource,
    sectionKey?: string
): TField[] {
    return sectionsOf(source)
        .filter(section => sectionKey === undefined || section.key === sectionKey)
        .flatMap(section => section.rows.flatMap(row => row.fields)) as TField[];
}

function sectionsOf(source: FormFieldsSource): BeyFormSection[] {
    if (!source) {
        return [];
    }

    return Array.isArray(source) ? source : source.sections;
}
