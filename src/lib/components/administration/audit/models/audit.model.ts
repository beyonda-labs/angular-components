import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

import { PageBackendResponse, PageHandle } from '../../../page/models/page.model';
import { PageOrganization, PageOrganizationItem } from '../../../page/models/page-organization.model';
import { SearchFieldOptionsResult } from '../../../search/models/search.model';
import { TableCell } from '../../../table/models/table-cell.model';

export interface AuditDetailEntry {
    key: string;
    value: string;
}

export interface AuditEventRow extends PageOrganizationItem {
    action: string;
    actions: string[];
    entity: string;
    entityId: string | null;
    entityName: string | null;
    id: string;
    ip: string | null;
    occurredAt: number;
    organizationId: string | null;
    requestId: string | null;
    userEmail: string | null;
    userId: string | null;
    userName: string | null;

    details?: Record<string, unknown>;
    organizationName?: string | null;
}

export interface AuditLabels {
    actionLabels: Readonly<Record<string, string>>;
    entityLabels: Readonly<Record<string, string>>;
}

export interface AuditPageConfigOptions {
    config: AuditConfig;
    hasSeveralOrganizations: Signal<boolean>;
    isOrganizationShown: boolean;
    loadRow: (event: AuditEventRow) => TableCell[];
    onDataLoaded: (response: PageBackendResponse<AuditEventRow>) => void;
    onExport: () => void;
    onReady: (handle: PageHandle<AuditEventRow>) => void;
    onView: (event: AuditEventRow) => void;
    organizations: PageOrganization[];
    searchUsers: (text: string) => Observable<SearchFieldOptionsResult>;
}

export interface AuditRowOptions extends AuditLabels {
    isOrganizationShown: boolean;
    onView: (event: AuditEventRow) => void;
}

export interface AuditViewOptions extends AuditLabels {
    event: AuditEventRow;
    prefix: string;
}

export class AuditConfig {
    actionLabels: Readonly<Record<string, string>>;
    baseUrl: string;
    entityLabels: Readonly<Record<string, string>>;
    prefix: string;
    storageKey: string;
    usersUrl: string;

    height?: string;

    constructor({
        actionLabels = {},
        baseUrl = '/audit',
        entityLabels = {},
        height,
        prefix = 'angular-components.audit',
        storageKey = 'audit',
        usersUrl = '/users'
    }: AuditConfigParameters = {}) {
        this.actionLabels = actionLabels;
        this.baseUrl = baseUrl;
        this.entityLabels = entityLabels;
        this.height = height;
        this.prefix = prefix;
        this.storageKey = storageKey;
        this.usersUrl = usersUrl;
    }
}

export interface AuditConfigParameters {
    actionLabels?: Readonly<Record<string, string>>;
    baseUrl?: string;
    entityLabels?: Readonly<Record<string, string>>;
    height?: string;
    prefix?: string;
    storageKey?: string;
    usersUrl?: string;
}

export const AUDIT_ACTION_LABEL_PREFIX = 'angular-components.audit.verbs';

export const AUDIT_ACTION_SEPARATOR = ' · ';

export const AUDIT_ENTITY_LABEL_PREFIX = 'angular-components.audit.entities';

export const AUDIT_EXPORT_ACTION = 'export';

export const AUDIT_EXPORT_FILE_PREFIX = 'audit-';

export const AUDIT_EXPORT_FILE_SUFFIX = '.csv';

export const AUDIT_EXPORT_PATH = '/export';

export const AUDIT_FORM_SECTION = 'main';

export const AUDIT_LIBRARY_ACTIONS: readonly string[] = [
    'create',
    'edit',
    'delete',
    'duplicate',
    'change-status',
    'move',
    'restore',
    'delete-trash-item',
    'empty-trash',
    'share',
    'unshare',
    'create-category',
    'edit-category',
    'delete-category',
    'import',
    'sign-in',
    'sign-in-failed',
    'sign-out',
    'locked',
    'register',
    'accept-invitation',
    'verify-email',
    'change-password',
    'reset-password',
    'invite',
    'resend-invitation',
    'transfer-content'
];

export const AUDIT_LIBRARY_ENTITIES: readonly string[] = [
    'auth',
    'account',
    'users',
    'groups',
    'roles',
    'organizations'
];

export const AUDIT_READ_PERMISSION = 'audit.read';

export const AUDIT_USER_OPTIONS_LIMIT = 20;

export const AUDIT_USER_OPTIONS_PATH = '/user-options';
