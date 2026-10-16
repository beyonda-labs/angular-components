import { buildDisabledOrganizationField, initialOrganizationId, toOrganizationOptions } from './organization-fields';

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

describe('initialOrganizationId', () => {
    const options = [
        { label: 'Acme', value: 'o1' },
        { label: 'Globex', value: 'o2' }
    ];

    it('chooses the organization of the open folder when the form offers it', () => {
        expect(initialOrganizationId(options, { id: 'o2' })).toBe('o2');
    });

    it('chooses the only organization offered, or none among several, at the root', () => {
        expect(initialOrganizationId([options[0]])).toBe('o1');
        expect(initialOrganizationId(options)).toBeUndefined();
    });

    it('ignores an open folder the form does not offer, such as a deactivated organization', () => {
        expect(initialOrganizationId(options, { id: 'o9' })).toBeUndefined();
        expect(initialOrganizationId([options[0]], { id: 'o9' })).toBe('o1');
    });

    it('chooses nothing when the form asks for no organization', () => {
        expect(initialOrganizationId(null, { id: 'o1' })).toBeUndefined();
    });
});

describe('toOrganizationOptions', () => {
    it('offers each organization by its name, valued by its id', () => {
        expect(
            toOrganizationOptions([
                { id: 'o1', name: 'Acme' },
                { id: 'o2', name: 'Globex' }
            ])
        ).toEqual([
            { label: 'Acme', value: 'o1' },
            { label: 'Globex', value: 'o2' }
        ]);
    });
});
