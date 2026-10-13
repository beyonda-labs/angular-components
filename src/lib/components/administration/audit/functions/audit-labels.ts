import { userNameOrUnknown } from '../../../../internal/user-name/user-name';
import {
    AUDIT_ACTION_LABEL_PREFIX,
    AUDIT_ACTION_SEPARATOR,
    AUDIT_ENTITY_LABEL_PREFIX,
    AUDIT_LIBRARY_ACTIONS,
    AUDIT_LIBRARY_ENTITIES,
    AuditEventRow,
    AuditLabels
} from '../models/audit.model';

export function auditActionKey(action: string, { actionLabels }: Pick<AuditLabels, 'actionLabels'>): string {
    return labelKey(action, actionLabels, AUDIT_LIBRARY_ACTIONS, AUDIT_ACTION_LABEL_PREFIX);
}

export function auditEntityKey(entity: string, { entityLabels }: Pick<AuditLabels, 'entityLabels'>): string {
    return labelKey(entity, entityLabels, AUDIT_LIBRARY_ENTITIES, AUDIT_ENTITY_LABEL_PREFIX);
}

export function auditEventLabel(
    { action, entity }: Pick<AuditEventRow, 'action' | 'entity'>,
    labels: AuditLabels,
    translate: (key: string) => string
): string {
    return [translate(auditEntityKey(entity, labels)), translate(auditActionKey(action, labels))].join(
        AUDIT_ACTION_SEPARATOR
    );
}

export function auditOrganizationName(
    { organizationId, organizationName }: Pick<AuditEventRow, 'organizationId' | 'organizationName'>,
    translate: (key: string) => string
): string {
    return organizationId ? userNameOrUnknown(organizationName, translate) : '';
}

export function auditRowName(
    { entityId, entityName }: Pick<AuditEventRow, 'entityId' | 'entityName'>,
    translate: (key: string) => string
): string {
    return entityId || entityName ? userNameOrUnknown(entityName, translate) : '';
}

export function auditTime(timestamp: number, language: string): string {
    return new Intl.DateTimeFormat(language || undefined, { dateStyle: 'medium', timeStyle: 'medium' }).format(
        new Date(timestamp)
    );
}

export function auditUserLabel(
    { userEmail, userName }: Pick<AuditEventRow, 'userEmail' | 'userName'>,
    translate: (key: string) => string
): string {
    const name = userName?.trim() ?? '';
    const email = userEmail?.trim() ?? '';

    if (name && email && name !== email) {
        return `${name} (${email})`;
    }

    return name || email || userNameOrUnknown(null, translate);
}

function labelKey(
    name: string,
    appLabels: Readonly<Record<string, string>>,
    libraryNames: readonly string[],
    libraryPrefix: string
): string {
    return appLabels[name] ?? (libraryNames.includes(name) ? `${libraryPrefix}.${name}` : name);
}
