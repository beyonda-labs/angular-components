import { AuditDetailEntry, AuditEventRow } from '../models/audit.model';

export function auditDetailEntries({ details }: Pick<AuditEventRow, 'details'>): AuditDetailEntry[] {
    return Object.entries(details ?? {}).map(([key, value]) => ({ key, value: detailValue(value) }));
}

function detailValue(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    return typeof value === 'object' ? JSON.stringify(value) : String(value);
}
