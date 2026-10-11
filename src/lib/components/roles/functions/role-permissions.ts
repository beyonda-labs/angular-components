import { toKeySegment } from '../../../utilities/key-segment';
import { RolePermissionEntry, RolePermissionGroup, ROLES_LIBRARY_PERMISSION_PREFIX } from '../models/roles.model';

const GROUP_LABEL_KEY = 'label';
const GROUP_SEPARATOR = '.';
const WORD_SEPARATORS = /[\s._-]+/u;

export function groupRolePermissions(entries: RolePermissionEntry[], held: string[] = []): RolePermissionGroup[] {
    const missing = held
        .filter(key => !entries.some(entry => entry.key === key))
        .map(key => ({ group: permissionGroupOf(key), key }));
    const groups = new Map<string, RolePermissionEntry[]>();

    for (const entry of [...entries, ...missing]) {
        groups.set(entry.group, [...(groups.get(entry.group) ?? []), entry]);
    }

    return [...groups.entries()]
        .map(([group, grouped]) => ({ entries: grouped, group }))
        .sort((first, second) => first.group.localeCompare(second.group));
}

export function rolePermissionGroupLabel(
    group: string,
    permissionPrefix: string,
    translate: (key: string) => unknown
): string {
    return translateFirst([toKeySegment(group), GROUP_LABEL_KEY], permissionPrefix, translate) ?? toReadable(group);
}

export function rolePermissionLabel(
    { group, key }: RolePermissionEntry,
    permissionPrefix: string,
    translate: (key: string) => unknown
): string {
    const action = key.startsWith(`${group}${GROUP_SEPARATOR}`) ? key.slice(group.length + 1) : key;
    const segments = [group, ...action.split(GROUP_SEPARATOR)].map(toKeySegment);

    return translateFirst(segments, permissionPrefix, translate) ?? toReadable(action);
}

export function toRolePermissions(groups: Record<string, unknown> | undefined): string[] {
    return [
        ...new Set(
            Object.values(groups ?? {}).flatMap(keys =>
                Array.isArray(keys) ? keys.filter((key): key is string => typeof key === 'string') : []
            )
        )
    ];
}

function permissionGroupOf(key: string): string {
    return key.split(GROUP_SEPARATOR)[0];
}

function toReadable(text: string): string {
    const words = toKeySegment(text).split(WORD_SEPARATORS).filter(Boolean).join(' ');

    return words ? `${words.charAt(0).toUpperCase()}${words.slice(1)}` : text;
}

function translateFirst(
    segments: string[],
    permissionPrefix: string,
    translate: (key: string) => unknown
): string | undefined {
    for (const prefix of new Set([permissionPrefix, ROLES_LIBRARY_PERMISSION_PREFIX])) {
        const key = [prefix, ...segments].join(GROUP_SEPARATOR);
        const label = translate(key);

        if (typeof label === 'string' && label !== '' && label !== key) {
            return label;
        }
    }

    return undefined;
}
