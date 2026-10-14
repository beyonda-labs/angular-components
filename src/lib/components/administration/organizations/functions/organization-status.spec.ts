import { OrganizationStatus } from '../models/organizations.model';
import { organizationStatusLabel, organizationStatusOptions } from './organization-status';

describe('organization status', () => {
    it('names a status by its key under the prefix of the page', () => {
        expect(organizationStatusLabel('demo.organizations', OrganizationStatus.Inactive)).toBe(
            'demo.organizations.status.inactive'
        );
    });

    it('offers every status, named under the prefix of the page', () => {
        expect(organizationStatusOptions('demo.organizations')).toEqual([
            { label: 'demo.organizations.status.active', value: OrganizationStatus.Active },
            { label: 'demo.organizations.status.inactive', value: OrganizationStatus.Inactive }
        ]);
    });
});
