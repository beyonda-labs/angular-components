import { PAGE_ORGANIZATIONS_MINIMUM, PageOrganization } from '../../page/models/page-organization.model';

export function isOrganizationColumnShown(organizations: PageOrganization[], isSuperadmin: boolean): boolean {
    const values = new Set([...(isSuperadmin ? [null] : []), ...organizations.map(({ id }) => id)]);

    return values.size >= PAGE_ORGANIZATIONS_MINIMUM;
}
