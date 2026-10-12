import { buildDisabledOrganizationField } from './organization-fields';

describe('buildDisabledOrganizationField', () => {
    it('shows the organization of a row in a disabled select that offers only that organization', () => {
        expect(buildDisabledOrganizationField({ organizationId: 'o2', organizationName: 'Globex' })).toMatchObject({
            isDisabled: true,
            isRequired: false,
            key: 'organizationId',
            options: [{ label: 'Globex', value: 'o2' }]
        });
    });

    it('takes the full row by default, or the columns it is given', () => {
        const row = { organizationId: 'o2', organizationName: 'Globex' };

        expect(buildDisabledOrganizationField(row)?.columns).toBe(12);
        expect(buildDisabledOrganizationField(row, 6)?.columns).toBe(6);
    });

    it('names the organization by its id when the row carries no name', () => {
        expect(buildDisabledOrganizationField({ organizationId: 'o2', organizationName: null })?.options).toEqual([
            { label: 'o2', value: 'o2' }
        ]);
    });

    it.each([null, undefined])('shows nothing for a row of no organization, such as %s', organizationId => {
        expect(buildDisabledOrganizationField({ organizationId, organizationName: null })).toBeNull();
    });
});
