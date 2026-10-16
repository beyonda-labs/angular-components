import { PAGE_ORGANIZATIONS_MINIMUM } from '../../../page/models/page-organization.model';
import { AuditEventRow } from '../models/audit.model';

export function spansOrganizations(events: Pick<AuditEventRow, 'organizationId'>[]): boolean {
    return new Set(events.map(({ organizationId }) => organizationId ?? null)).size >= PAGE_ORGANIZATIONS_MINIMUM;
}
