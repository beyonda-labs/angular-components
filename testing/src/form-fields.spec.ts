import { BeyFormRow, BeyFormSection, BeyFormTextField } from '@beyonda-labs/angular-components';

import { fieldsOf } from './form-fields';

const NAME = new BeyFormTextField({ key: 'name' });
const EMAIL = new BeyFormTextField({ key: 'email' });
const SECTIONS = [
    new BeyFormSection({ key: 'main', rows: [new BeyFormRow({ fields: [NAME] })] }),
    new BeyFormSection({ key: 'contact', rows: [new BeyFormRow({ fields: [EMAIL] })] })
];

describe('testing/form-fields', () => {
    it('lists the fields of every section, from the sections or from a form config', () => {
        expect(fieldsOf(SECTIONS)).toEqual([NAME, EMAIL]);
        expect(fieldsOf({ sections: SECTIONS })).toEqual([NAME, EMAIL]);
    });

    it('lists only the fields of the section it names', () => {
        expect(fieldsOf(SECTIONS, 'contact')).toEqual([EMAIL]);
    });

    it('lists nothing when there is no form', () => {
        expect(fieldsOf(undefined)).toEqual([]);
    });
});
