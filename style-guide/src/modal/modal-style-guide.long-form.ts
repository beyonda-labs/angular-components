import {
    BeyFormField,
    BeyFormRow,
    BeyFormSection,
    BeyFormTextareaField,
    BeyFormTextField,
    BeyModalFormConfig
} from '@beyonda-labs/angular-components';

import { LONG_FORM_PREFIX } from './models/modal-style-guide.model';

const SECTIONS = [
    { fields: ['name', 'surname', 'email', 'phone'], key: 'person' },
    { fields: ['street', 'city', 'postcode', 'country'], key: 'address' },
    { fields: ['company', 'department', 'position'], key: 'work' }
];

export function buildLongForm(onSubmit: () => void): BeyModalFormConfig {
    return new BeyModalFormConfig({
        onSubmit: (_value, handle) => {
            onSubmit();
            handle.close();
        },
        prefix: LONG_FORM_PREFIX,
        sections: [
            ...SECTIONS.map(
                ({ fields, key }) =>
                    new BeyFormSection({
                        key,
                        rows: fields.map(field => new BeyFormRow({ fields: [buildField(field)] }))
                    })
            ),
            new BeyFormSection({
                key: 'notes',
                rows: [new BeyFormRow({ fields: [new BeyFormTextareaField({ key: 'notes', rows: 6 })] })]
            })
        ]
    });
}

function buildField(key: string): BeyFormField {
    return new BeyFormTextField({ isRequired: key === 'name', key });
}
