import { FormSelectField } from '../../form/models/fields/form-select-field.model';
import { buildChangeStatusForm, buildDuplicateForm } from './page-lifecycle-forms';

describe('buildDuplicateForm', () => {
    it('asks for the name of the copy, required and filled in, with the texts of the duplicate form', () => {
        const form = buildDuplicateForm('shop.products', 'title', 'Oats (copy)');
        const [field] = form.sections[0]?.rows[0]?.fields ?? [];

        expect(form.prefix).toBe('shop.products.duplicate');
        expect(form.title).toBe('shop.products.duplicate.title');
        expect(form.initialValue).toEqual({ main: { title: 'Oats (copy)' } });
        expect(field).toMatchObject({ isRequired: true, key: 'title' });
    });
});

describe('buildChangeStatusForm', () => {
    it('offers the statuses it is given, labelled by the page, with nothing chosen yet', () => {
        const form = buildChangeStatusForm('shop.products', 'status', ['published', 'archived']);
        const [field] = form.sections[0]?.rows[0]?.fields ?? [];

        expect(form.prefix).toBe('shop.products.change-status');
        expect(form.initialValue).toEqual({ main: { status: '' } });
        expect((field as FormSelectField).options).toEqual([
            { label: 'shop.products.status.published', value: 'published' },
            { label: 'shop.products.status.archived', value: 'archived' }
        ]);
    });
});
