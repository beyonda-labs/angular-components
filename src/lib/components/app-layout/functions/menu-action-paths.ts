import { LeftMenuAction } from '../../left-menu/models/left-menu.model';

export function findPathByKey(
    actions: LeftMenuAction[],
    key: string,
    parents: LeftMenuAction[] = []
): LeftMenuAction[] | null {
    for (const action of actions) {
        if (action.key === key) {
            return [...parents, action];
        }

        const nested = findPathByKey(action.subActions, key, [...parents, action]);

        if (nested) {
            return nested;
        }
    }

    return null;
}

export function findPathByUrl(
    actions: LeftMenuAction[],
    path: string,
    parents: LeftMenuAction[] = []
): LeftMenuAction[] | null {
    let best: LeftMenuAction[] | null = null;

    for (const action of actions) {
        const current = [...parents, action];
        const matches = Boolean(action.route) && (path === action.route || path.startsWith(`${action.route}/`));
        const nested = findPathByUrl(action.subActions, path, current);
        const candidate = nested ?? (matches ? current : null);

        if (candidate && (!best || candidate.length > best.length)) {
            best = candidate;
        }
    }

    return best;
}

export function hasRoutes(actions: LeftMenuAction[]): boolean {
    return actions.some(action => Boolean(action.route) || hasRoutes(action.subActions));
}
