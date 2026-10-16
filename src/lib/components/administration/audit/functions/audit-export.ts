import { AUDIT_EXPORT_FILE_PREFIX, AUDIT_EXPORT_FILE_SUFFIX } from '../models/audit.model';

const DAY_DIGITS = 2;

export function auditExportFileName(now: Date = new Date()): string {
    const day = [
        String(now.getFullYear()),
        String(now.getMonth() + 1).padStart(DAY_DIGITS, '0'),
        String(now.getDate()).padStart(DAY_DIGITS, '0')
    ].join('');

    return `${AUDIT_EXPORT_FILE_PREFIX}${day}${AUDIT_EXPORT_FILE_SUFFIX}`;
}

export function saveAuditExport(content: Blob, now: Date = new Date()): void {
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');

    link.href = url;
    link.download = auditExportFileName(now);
    link.click();
    URL.revokeObjectURL(url);
}
