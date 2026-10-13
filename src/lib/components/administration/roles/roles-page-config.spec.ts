import { signal } from '@angular/core';

import { PageActionZone } from '../../page/models/page-action.model';
import { PageFormConfig } from '../../page/models/page-form.model';
import { PageColumnContext } from '../../page/models/page-table.model';
import { buildOrganizationFoldersConfig } from '../functions/organization-folders';
import { RoleFormValue, RoleRow, RolesConfig, RolesPageConfigOptions, RolesPageMode } from './models/roles.model';
import { buildRolesPageConfig } from './roles-page-config';

const BROWSING: PageColumnContext = { isSearching: false };
const FOLDER_ACTIONS = new Set(['create-category', 'delete-category', 'edit-category', 'move', 'share']);

describe('buildRolesPageConfig', () => {
    const organizations = [
        { id: 'o1', name: 'Acme' },
        { id: 'o2', name: 'Globex' }
    ];

    function build(overrides: Partial<RolesPageConfigOptions> = {}): ReturnType<typeof buildRolesPageConfig> {
        return buildRolesPageConfig({
            config: new RolesConfig({ baseUrl: '/staff-roles', prefix: 'demo.roles', storageKey: 'staff-roles' }),
            formConfig: new PageFormConfig<RoleFormValue, RoleRow>({
                buildSections: () => [],
                prefix: 'demo.roles.form'
            }),
            isOrganizationShown: false,
            loadRow: () => [],
            mode: signal(RolesPageMode.Manage),
            onDataLoaded: jest.fn(),
            onDuplicate: jest.fn(),
            onReady: jest.fn(),
            onView: jest.fn(),
            organizations: [],
            ...overrides
        });
    }

    function shownKeys(config: ReturnType<typeof buildRolesPageConfig>, context = BROWSING): string[] {
        const { columns = [], isColumnShown } = config.tableConfig ?? {};

        return columns.filter(column => isColumnShown?.(column, context) ?? true).map(({ key }) => key);
    }

    it('lists the roles of the address of the config in the order the server gives, remembering the hidden columns', () => {
        const config = build();

        expect(config.baseUrl).toBe('/staff-roles');
        expect(config.prefix).toBe('demo.roles');
        expect(config.headerConfig?.title).toBe('demo.roles.title');
        expect(config.tableConfig?.order).toBeUndefined();
        expect(config.tableConfig?.storageKey).toBe('staff-roles');
    });

    it('declares the name, the type, the counts, the origin and the description, none sortable', () => {
        const columns = build().tableConfig?.columns ?? [];

        expect(columns.map(({ isHideable, isSortable, key }) => [key, isSortable, isHideable])).toEqual([
            ['name', false, false],
            ['type', false, true],
            ['permissionCount', false, true],
            ['memberCount', false, true],
            ['groupCount', false, true],
            ['sources', false, true],
            ['description', false, true]
        ]);
    });

    it('shows a manager the user and group counts, with the organization after them when it is shown', () => {
        expect(shownKeys(build())).toEqual([
            'name',
            'type',
            'permissionCount',
            'memberCount',
            'groupCount',
            'description'
        ]);
        expect(shownKeys(build({ isOrganizationShown: true }))).toEqual([
            'name',
            'type',
            'permissionCount',
            'memberCount',
            'groupCount',
            'organization',
            'description'
        ]);
    });

    it('shows the origin instead of the user and group counts while it reads the roles of a member', () => {
        expect(shownKeys(build({ mode: signal(RolesPageMode.Read) }))).toEqual([
            'name',
            'type',
            'permissionCount',
            'sources',
            'description'
        ]);
    });

    it('shows the columns of the mode the page turns to without being built again', () => {
        const mode = signal(RolesPageMode.Manage);
        const config = build({ mode });

        mode.set(RolesPageMode.Read);

        expect(shownKeys(config)).toEqual(['name', 'type', 'permissionCount', 'sources', 'description']);
    });

    it('searches the name with the text of the search, and by organization with two organizations or more', () => {
        const search = build().tableConfig?.search;
        const [, organization] = build({ organizations }).tableConfig?.search?.fields ?? [];

        expect(search?.mainField).toBe('text');
        expect(search?.textField).toBe('text');
        expect(search?.fields.map(({ key }) => key)).toEqual(['text']);
        expect(organization).toMatchObject({ key: 'organizationId', operators: ['equals'] });
    });

    it('offers to create, edit, view, duplicate and delete a role', () => {
        expect(build().headerConfig?.actions.map(({ key }) => key)).toEqual([
            'create',
            'edit',
            'view',
            'duplicate',
            'delete'
        ]);
    });

    it('views the permissions of the role selected through onView, next to the edit, as its name does', () => {
        const onView = jest.fn();
        const role: RoleRow = { actions: ['view'], id: 'adminuser', isBase: true, name: 'adminuser', permissions: [] };
        const view = build({ onView }).headerConfig?.actions.find(({ key }) => key === 'view');

        view?.handler?.([role]);

        expect(view?.zone).toBe(PageActionZone.Left);
        expect(view?.tooltip).toBe('demo.roles.actions.view.tooltip');
        expect(onView).toHaveBeenCalledWith(role);
    });

    it('duplicates the role selected through onDuplicate, in the menu of the header', () => {
        const onDuplicate = jest.fn();
        const role: RoleRow = {
            actions: ['duplicate'],
            id: 'r1',
            isBase: false,
            memberCount: 0,
            name: 'Reviewers',
            permissions: []
        };
        const duplicate = build({ onDuplicate }).headerConfig?.actions.find(({ key }) => key === 'duplicate');

        duplicate?.handler?.([role]);

        expect(duplicate?.zone).toBe(PageActionZone.Menu);
        expect(onDuplicate).toHaveBeenCalledWith(role);
    });

    it('browses the folders it is given, with no folder action, and is flat without them', () => {
        const categoriesConfig = buildOrganizationFoldersConfig(() => []);
        const config = build({ categoriesConfig });
        const keys = config.headerConfig?.actions.map(({ key }) => key) ?? [];

        expect(config.tableConfig?.categoriesConfig).toBe(categoriesConfig);
        expect(keys.filter(key => FOLDER_ACTIONS.has(key))).toEqual([]);
        expect(build().tableConfig?.categoriesConfig).toBeUndefined();
        expect(config.tableConfig?.height).toBe('calc(100vh - 255px)');
        expect(build().tableConfig?.height).toBe('calc(100vh - 220px)');
    });

    it('shows the organization among the folders only in a search at the root, and always on a flat page', () => {
        const folders = build({
            categoriesConfig: buildOrganizationFoldersConfig(() => []),
            isOrganizationShown: true
        });
        const flat = build({ isOrganizationShown: true });
        const category = { id: 'o1', label: 'Acme' };
        const contexts: PageColumnContext[] = [
            { isSearching: true },
            { isSearching: false },
            { category, isSearching: true }
        ];
        const isOrganizationShown = (config: typeof flat): boolean[] =>
            contexts.map(context => shownKeys(config, context).includes('organization'));

        expect(isOrganizationShown(folders)).toEqual([true, false, false]);
        expect(isOrganizationShown(flat)).toEqual([true, true, true]);
    });
});
