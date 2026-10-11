import { toKeySegment } from '../../../utilities/key-segment';
import { FormCheckboxSection } from '../../form/models/fields/form-checkbox-sections-field.model';
import {
    RolePermissionEntry,
    RolePermissionGroup,
    RolePermissionSectionsOptions,
    ROLES_DEFAULT_GROUP_ICON,
    ROLES_LIBRARY_GROUP_ICONS,
    ROLES_LIBRARY_PERMISSION_PREFIX
} from '../models/roles.model';

const DESCRIPTION_KEY = 'description';
const LABEL_KEY = 'label';
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

export function rolePermissionDescription(
    entry: RolePermissionEntry,
    permissionPrefix: string,
    translate: (key: string) => unknown
): string | undefined {
    return translateFirst([...permissionSegments(entry), DESCRIPTION_KEY], permissionPrefix, translate);
}

export function rolePermissionGroupLabel(
    group: string,
    permissionPrefix: string,
    translate: (key: string) => unknown
): string {
    return translateFirst([toKeySegment(group), LABEL_KEY], permissionPrefix, translate) ?? toReadable(group);
}

export function rolePermissionLabel(
    entry: RolePermissionEntry,
    permissionPrefix: string,
    translate: (key: string) => unknown
): string {
    return (
        translateFirst([...permissionSegments(entry), LABEL_KEY], permissionPrefix, translate) ??
        toReadable(actionOf(entry))
    );
}

export function rolePermissionSections(
    groups: RolePermissionGroup[],
    { groupIcons, permissionPrefix, translate }: RolePermissionSectionsOptions
): FormCheckboxSection[] {
    return groups.map(({ entries, group }) => ({
        icon: groupIcons[group] ?? ROLES_LIBRARY_GROUP_ICONS[group] ?? ROLES_DEFAULT_GROUP_ICON,
        key: group,
        label: rolePermissionGroupLabel(group, permissionPrefix, translate),
        options: entries.map(entry => ({
            description: rolePermissionDescription(entry, permissionPrefix, translate),
            label: rolePermissionLabel(entry, permissionPrefix, translate),
            value: entry.key
        }))
    }));
}

function actionOf({ group, key }: RolePermissionEntry): string {
    return key.startsWith(`${group}${GROUP_SEPARATOR}`) ? key.slice(group.length + 1) : key;
}

function permissionGroupOf(key: string): string {
    return key.split(GROUP_SEPARATOR)[0];
}

function permissionSegments(entry: RolePermissionEntry): string[] {
    return [entry.group, ...actionOf(entry).split(GROUP_SEPARATOR)].map(toKeySegment);
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
