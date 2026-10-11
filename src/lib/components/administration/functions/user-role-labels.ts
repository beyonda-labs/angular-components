import { toKeySegment } from '../../../utilities/key-segment';

export function userRoleLabel(role: string, rolePrefix: string, translate: (key: string) => string): string {
    const key = `${rolePrefix}.${toKeySegment(role)}`;
    const label = translate(key);

    return label && label !== key ? label : role;
}
