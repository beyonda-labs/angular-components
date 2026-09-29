import { toKeySegment } from '../../../utilities/key-segment';
export function resolvePropertyLabelKey(prefix: string, segment: string, id: string, label: string): string {
    const defaultValue = `${id}.label`;

    return label === defaultValue ? `${prefix}.${segment}.${toKeySegment(id)}.label` : label;
}
