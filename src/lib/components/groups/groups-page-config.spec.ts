import { PageActionScope, PageActionZone } from '../page/models/page-action.model';
import { PageFormConfig } from '../page/models/page-form.model';
import { buildGroupsPageConfig, GroupsPageConfigOptions } from './groups-page-config';
import { GroupFormValue, GroupRow, GroupsConfig } from './models/groups.model';

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
            onEditMembers: jest.fn(),
            onReady: jest.fn(),
            organizations: [],
            ...overrides
        });
    }

    it('lists the groups of the address of the config, by name, remembering the hidden columns', () => {
        const config = build();

        expect(config.baseUrl).toBe('/teams');
        expect(config.prefix).toBe('demo.teams');
        expect(config.headerConfig?.title).toBe('demo.teams.title');
        expect(config.tableConfig?.order).toEqual({ direction: 'asc', field: 'name' });
        expect(config.tableConfig?.storageKey).toBe('teams');
    });

    it('declares the name, the member count and the creation, sortable as the server sorts them', () => {
        const columns = build().tableConfig?.columns ?? [];

        expect(columns.map(({ isHideable, isSortable, key }) => [key, isSortable, isHideable])).toEqual([
            ['name', true, false],
            ['memberCount', true, true],
            ['createdAt', true, true]
        ]);
    });

    it('adds the organization after the member count when it is shown, sorted by its name', () => {
        const columns = build({ isOrganizationShown: true }).tableConfig?.columns ?? [];

        expect(columns.map(({ key, sortField }) => [key, sortField])).toEqual([
            ['name', 'name'],
            ['memberCount', 'memberCount'],
            ['organization', 'organizationName'],
            ['createdAt', 'createdAt']
        ]);
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

    it('offers to create, rename, set the members of and delete a group', () => {
        const onEditMembers = jest.fn();
        const actions = build({ onEditMembers }).headerConfig?.actions ?? [];
        const group: GroupRow = { actions: [], createdAt: 0, id: 'g1', memberCount: 0, name: 'Sales' };

        expect(actions.map(action => action.key)).toEqual(['create', 'edit', 'members', 'delete']);
        expect(actions[2]).toEqual(
            expect.objectContaining({ scope: PageActionScope.Single, zone: PageActionZone.Menu })
        );

        actions[2].handler?.([group]);

        expect(onEditMembers).toHaveBeenCalledWith(group);
    });
});
