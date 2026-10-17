import { LeftMenuAction } from '../../left-menu/models/left-menu.model';
import { findPathByKey, findPathByUrl, hasRoutes } from './menu-action-paths';

const USERS = new LeftMenuAction({ key: 'users', route: '/admin/users' });
const ADMIN = new LeftMenuAction({ key: 'admin', route: '/admin', subActions: [USERS] });
const HELP = new LeftMenuAction({ action: () => {}, key: 'help' });
const TEMPLATES = new LeftMenuAction({ key: 'templates', route: '/templates' });
const ACTIONS = [TEMPLATES, ADMIN, HELP];

function keysOf(path: LeftMenuAction[] | null): string[] | null {
    return path?.map(action => action.key) ?? null;
}

describe('findPathByKey', () => {
    it('returns the actions from the top level down to the one with the key', () => {
        expect(keysOf(findPathByKey(ACTIONS, 'users'))).toEqual(['admin', 'users']);
        expect(keysOf(findPathByKey(ACTIONS, 'help'))).toEqual(['help']);
    });

    it('returns null for a key no action has', () => {
        expect(findPathByKey(ACTIONS, 'missing')).toBeNull();
    });
});

describe('findPathByUrl', () => {
    it('returns the deepest action whose route is the path or an ancestor of it', () => {
        expect(keysOf(findPathByUrl(ACTIONS, '/admin/users/7'))).toEqual(['admin', 'users']);
        expect(keysOf(findPathByUrl(ACTIONS, '/admin/settings'))).toEqual(['admin']);
        expect(keysOf(findPathByUrl(ACTIONS, '/templates'))).toEqual(['templates']);
    });

    it('returns null for a path no route leads to, a mere prefix of a segment included', () => {
        expect(findPathByUrl(ACTIONS, '/templates-archive')).toBeNull();
        expect(findPathByUrl(ACTIONS, '/other')).toBeNull();
    });
});

describe('hasRoutes', () => {
    it('says whether any action, at any depth, has a route', () => {
        expect(hasRoutes(ACTIONS)).toBe(true);
        expect(hasRoutes([new LeftMenuAction({ key: 'parent', subActions: [USERS] })])).toBe(true);
        expect(hasRoutes([HELP])).toBe(false);
    });
});
