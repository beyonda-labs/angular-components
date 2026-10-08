import { ConfirmationModalConfig } from '../../modal/models/modal.model';
import { PageItem } from '../models/page-item.model';
import {
    InUseConfirmationOptions,
    PAGE_MORE_USERS,
    PAGE_USAGE_COUNT_FIELD,
    PAGE_USED_BY_FIELD,
    PAGE_USERS_SEPARATOR,
    PageUser,
    PageUserList
} from '../models/page-usages.model';
import { readRowField } from './page-row';

export function buildInUseConfirmation({
    confirmation,
    inUseModal,
    listedUsers,
    selectedIds,
    suffixes,
    usages
}: InUseConfirmationOptions): ConfirmationModalConfig {
    const selected = new Set(selectedIds.map(String));
    const users = uniqueUsers(usages.flatMap(usage => usage.users)).filter(user => !selected.has(user.id));
    const unlisted = usages.reduce((count, usage) => count + Math.max(usage.total - usage.users.length, 0), 0);
    const usageCount = users.length + unlisted;

    if (usageCount === 0) {
        return confirmation;
    }

    return {
        ...confirmation,
        message: `${inUseModal}.message`,
        messageParameters: {
            ...confirmation.messageParameters,
            usageCount,
            users: describeUsers(users.slice(0, listedUsers), usageCount, suffixes).join(PAGE_USERS_SEPARATOR)
        },
        title: `${inUseModal}.title`
    };
}

export function describeUsers(users: PageUser[], total: number, suffixes: Record<string, string>): string[] {
    const names = users.map(user => {
        const suffix = suffixes[user.kind ?? user.resource] ?? suffixes[user.resource];

        return suffix ? `${user.name} (${suffix})` : user.name;
    });

    return total > users.length ? [...names, PAGE_MORE_USERS] : names;
}

export function readRowUsers(item: PageItem): PageUserList {
    const total = readRowField(item, PAGE_USAGE_COUNT_FIELD);
    const users = readRowField(item, PAGE_USED_BY_FIELD);

    return {
        total: typeof total === 'number' ? total : 0,
        users: Array.isArray(users) ? (users as PageUser[]) : []
    };
}

function uniqueUsers(users: PageUser[]): PageUser[] {
    return [...new Map(users.map(user => [`${user.resource}:${user.id}`, user])).values()];
}
