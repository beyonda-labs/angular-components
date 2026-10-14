import { FormTextField } from '../models/fields/form-text-field.model';
import { FormRow, FormSection } from '../models/form.model';
import { fieldsOf } from './section-fields';

describe('section-fields', () => {
    it('lists the fields of every row of a section, row after row', () => {
        const name = new FormTextField({ key: 'name' });
        const surname = new FormTextField({ key: 'surname' });
        const email = new FormTextField({ key: 'email' });
        const section = new FormSection({
            key: 'person',
            rows: [new FormRow({ fields: [name, surname] }), new FormRow({ fields: [email] })]
        });

        expect(fieldsOf(section)).toEqual([name, surname, email]);
    });

    it('lists nothing for a section without rows', () => {
        expect(fieldsOf(new FormSection({ key: 'empty', rows: [] }))).toEqual([]);
    });
});
