import { FormCheckboxSection } from '../../../../models/fields/form-checkbox-sections-field.model';
import { checkboxSectionViews, toggleOptionValues, toggleSectionValues } from './checkbox-sections';

const SECTIONS: FormCheckboxSection[] = [
    {
        key: 'templates',
        label: 'Templates',
        options: [
            { label: 'Read', value: 'templates.read' },
            { isDisabled: true, label: 'Publish', value: 'templates.publish' }
        ]
    },
    { key: 'documents', label: 'Documents', options: [{ label: 'Read', value: 'documents.read' }] }
];

describe('checkbox sections', () => {
    it('describes each section with its counts, its ids and whether all its enabled options are checked', () => {
        const [templates, documents] = checkboxSectionViews(SECTIONS, {
            expandedKeys: new Set(['templates']),
            fieldKey: 'permissions',
            isDisabled: false,
            values: ['templates.read']
        });

        expect(templates).toEqual(
            expect.objectContaining({
                checkedCount: 1,
                controlsId: 'permissions_templates_options',
                hasToggleAll: true,
                isAllChecked: true,
                isExpanded: true,
                toggleAllLabel: 'angular-components.form.checkbox-sections.clear-all',
                total: 2
            })
        );
        expect(templates.options[1]).toEqual(
            expect.objectContaining({ id: 'permissions_templates.publish', isChecked: false, isDisabled: true })
        );
        expect(documents).toEqual(
            expect.objectContaining({ controlsId: null, isAllChecked: false, isExpanded: false })
        );
    });

    it('offers no select all and disables every option while the field is disabled', () => {
        const [templates] = checkboxSectionViews(SECTIONS, {
            expandedKeys: new Set(),
            fieldKey: 'permissions',
            isDisabled: true,
            values: []
        });

        expect(templates.hasToggleAll).toBe(false);
        expect(templates.options.every(({ isDisabled }) => isDisabled)).toBe(true);
    });

    it('checks and unchecks one value, keeping the order of the sections', () => {
        expect(toggleOptionValues(SECTIONS, ['documents.read'], 'templates.read', true)).toEqual([
            'templates.read',
            'documents.read'
        ]);
        expect(toggleOptionValues(SECTIONS, ['templates.read', 'documents.read'], 'templates.read', false)).toEqual([
            'documents.read'
        ]);
    });

    it('checks or clears the enabled options of one section, leaving the disabled ones as they were', () => {
        expect(toggleSectionValues(SECTIONS, [], 'templates', true)).toEqual(['templates.read']);
        expect(toggleSectionValues(SECTIONS, ['templates.read', 'templates.publish'], 'templates', false)).toEqual([
            'templates.publish'
        ]);
        expect(toggleSectionValues(SECTIONS, ['documents.read'], 'missing', true)).toEqual(['documents.read']);
    });
});
