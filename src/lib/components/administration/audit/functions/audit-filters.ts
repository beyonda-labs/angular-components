import { SearchFieldOption } from '../../../search/models/search.model';
import { AUDIT_LIBRARY_ACTIONS, AUDIT_LIBRARY_ENTITIES, AuditLabels } from '../models/audit.model';
import { auditActionKey, auditEntityKey } from './audit-labels';

export function auditActionOptions(labels: Pick<AuditLabels, 'actionLabels'>): SearchFieldOption[] {
    return unique([...AUDIT_LIBRARY_ACTIONS, ...Object.keys(labels.actionLabels)]).map(action => ({
        label: auditActionKey(action, labels),
        value: action
    }));
}

export function auditEntityOptions(labels: Pick<AuditLabels, 'entityLabels'>): SearchFieldOption[] {
    return unique([...Object.keys(labels.entityLabels), ...AUDIT_LIBRARY_ENTITIES]).map(entity => ({
        label: auditEntityKey(entity, labels),
        value: entity
    }));
}

function unique(names: string[]): string[] {
    return [...new Set(names)];
}
