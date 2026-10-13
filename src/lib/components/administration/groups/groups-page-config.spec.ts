import { signal } from '@angular/core';

import { PageActionZone } from '../../page/models/page-action.model';
import { PageFormConfig } from '../../page/models/page-form.model';
import { PageColumnContext } from '../../page/models/page-table.model';
import { buildOrganizationFoldersConfig } from '../functions/organization-folders';
import { buildGroupsPageConfig } from './groups-page-config';
import { GroupFormValue, GroupRow, GroupsConfig, GroupsPageConfigOptions, GroupsPageMode } from './models/groups.model';

const BROWSING: PageColumnContext = { isSearching: false };
const FOLDER_ACTIONS = new Set(['create-category', 'delete-category', 'edit-category', 'move', 'share']);

describe('buildGroupsPageConfig', () => {
    const organizations = [
        { id: 'o1', name: 'Acme' },
        { id: 'o2', name: 'Globex' }
    ];

    function build(overrides: Partial<GroupsPageConfigOptions> = {}): ReturnType<typeof buildGroupsPageConfig> {
        return buildGroupsPageConfig({
            config: new GroupsConfig({ baseUrl: '/teams', prefix: 'demo.teams', storageKey: 'teams' }),
            formConfig: new PageFormConfig<GroupFormValue, GroupRow>({
                buildSections: () => [],
                prefix: 'demo.teams.form'
            }),
            isOrganizationShown: false,
            loadRow: () => [],
            mode: signal(GroupsPageMode.Manage),
            onDataLoaded: jest.fn(),
            onEdit: jest.fn(),
            onReady: jest.fn(),
            onView: jest.fn(),
            organizations: [],
            ...overrides
        });
    }

    function shownKeys(config: ReturnType<typeof buildGroupsPageConfig>, context = BROWSING): string[] {
        const { columns = [], isColumnShown } = config.tableConfig ?? {};

        return columns.filter(column => isColumnShown?.(column, context) ?? true).map(({ key }) => key);
    }

    it('lists the groups of the address of the config, by name, remembering the hidden columns', () => {
        const config = build();

        expect(config.baseUrl).toBe('/teams');
        expect(config.prefix).toBe('demo.teams');
        expect(config.headerConfig?.title).toBe('demo.teams.title');
        expect(config.tableConfig?.order).toEqual({ direction: 'asc', field: 'name' });
        expect(config.tableConfig?.storageKey).toBe('teams');
    });

    it('declares the name, the member count, the extra and the base role counts and the creation, sortable as the server sorts them', () => {
        const columns = build().tableConfig?.columns ?? [];

        expect(columns.map(({ isHideable, isSortable, key }) => [key, isSortable, isHideable])).toEqual([
            ['name', true, false],
            ['memberCount', true, true],
            ['extraRoleCount', true, true],
            ['roleCount', false, true],
            ['createdAt', true, true]
        ]);
    });

    it('adds the organization after the extra role count when it is shown, sorted by its name', () => {
        const columns = build({ isOrganizationShown: true }).tableConfig?.columns ?? [];

        expect(columns.map(({ key, sortField }) => [key, sortField])).toEqual([
            ['name', 'name'],
            ['memberCount', 'memberCount'],
            ['extraRoleCount', 'extraRoleCount'],
            ['organization', 'organizationName'],
            ['roleCount', 'roleCount'],
            ['createdAt', 'createdAt']
        ]);
    });

    it('shows a manager the extra role count and the organization, and a member the roles only with their count', () => {
        const keysOf = (mode: GroupsPageMode): string[] =>
            shownKeys(build({ isOrganizationShown: true, mode: signal(mode) }));

        expect(keysOf(GroupsPageMode.Manage)).toEqual([
            'name',
            'memberCount',
            'extraRoleCount',
            'organization',
            'createdAt'
        ]);
        expect(keysOf(GroupsPageMode.Read)).toEqual(['name', 'memberCount', 'createdAt']);
        expect(keysOf(GroupsPageMode.ReadWithRoles)).toEqual(['name', 'memberCount', 'roleCount', 'createdAt']);
    });

    it('shows the columns of the mode the page turns to without being built again', () => {
        const mode = signal(GroupsPageMode.Manage);
        const config = build({ mode });

        mode.set(GroupsPageMode.ReadWithRoles);

        expect(shownKeys(config)).toEqual(['name', 'memberCount', 'roleCount', 'createdAt']);
    });

    it('hands what each load answers to the page', () => {
        const onDataLoaded = jest.fn();
        const response = { globalActions: [], results: [] };

        build({ onDataLoaded }).onDataLoaded?.(response);

        expect(onDataLoaded).toHaveBeenCalledWith(response);
    });

    it('searches the name with the text of the search', () => {
        const search = build().tableConfig?.search;

        expect(search?.mainField).toBe('text');
        expect(search?.textField).toBe('text');
        expect(search?.fields.map(field => field.key)).toEqual(['text']);
    });

    it('filters by organization, with equals, when there are two organizations or more', () => {
        const [, organization] = build({ organizations }).tableConfig?.search?.fields ?? [];

        expect(organization.key).toBe('organizationId');
        expect(organization.operators).toEqual(['equals']);
        expect(organization.options).toEqual([
            { label: 'Acme', value: 'o1' },
            { label: 'Globex', value: 'o2' }
        ]);
        expect(build({ organizations: [organizations[0]] }).tableConfig?.search?.fields).toHaveLength(1);
    });

    it('offers to create, edit, view and delete a group, the edit opening the form of the group with everything in it', () => {
        const onEdit = jest.fn();
        const actions = build({ onEdit }).headerConfig?.actions ?? [];
        const group: GroupRow = { actions: [], createdAt: 0, id: 'g1', memberCount: 0, name: 'Sales' };

        expect(actions.map(action => action.key)).toEqual(['create', 'edit', 'view', 'delete']);
        expect(actions[1].zone).toBe(PageActionZone.Left);

        actions[1].handler?.([group]);

        expect(onEdit).toHaveBeenCalledWith(group);
    });

    it('views a group from the header next to the edit, as its name does, with the tooltip of the page', () => {
        const onView = jest.fn();
        const view = (build({ onView }).headerConfig?.actions ?? [])[2];
        const group: GroupRow = { actions: ['view'], createdAt: 0, id: 'g1', memberCount: 0, name: 'Sales' };

        view.handler?.([group]);

        expect(view.zone).toBe(PageActionZone.Left);
        expect(view.tooltip).toBe('demo.teams.actions.view.tooltip');
        expect(onView).toHaveBeenCalledWith(group);
    });

    it('browses the folders it is given, with no folder action, and is flat without them', () => {
        const categoriesConfig = buildOrganizationFoldersConfig(() => []);
        const config = build({ categoriesConfig });
        const keys = config.headerConfig?.actions.map(({ key }) => key) ?? [];

        expect(config.tableConfig?.categoriesConfig).toBe(categoriesConfig);
        expect(keys.filter(key => FOLDER_ACTIONS.has(key))).toEqual([]);
        expect(build().tableConfig?.categoriesConfig).toBeUndefined();
    });

    it('gives the table the folders height with the folders and the plain height without them', () => {
        expect(build({ categoriesConfig: buildOrganizationFoldersConfig(() => []) }).tableConfig?.height).toBe(
            'calc(100vh - 255px)'
        );
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
