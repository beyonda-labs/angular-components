import { ROLE_COPY_SEPARATOR } from '../models/roles.model';

export function roleCopyName(name: string, copySuffix: string, maxLength: number): string {
    const suffix = `${ROLE_COPY_SEPARATOR}${copySuffix}`;
    const room = Math.max(0, maxLength - suffix.length);

    return `${name.trim().slice(0, room).trimEnd()}${suffix}`;
}
