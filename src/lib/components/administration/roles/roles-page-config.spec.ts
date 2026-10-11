import { PageFormConfig } from '../../page/models/page-form.model';
import { RoleFormValue, RoleRow, RolesConfig } from './models/roles.model';
import { buildRolesPageConfig, RolesPageConfigOptions } from './roles-page-config';

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
            onReady: jest.fn(),
            organizations: [],
            ...overrides
        });
    }

    it('lists the roles of the address of the config in the order the server gives, remembering the hidden columns', () => {
        const config = build();

        expect(config.baseUrl).toBe('/staff-roles');
        expect(config.prefix).toBe('demo.roles');
        expect(config.headerConfig?.title).toBe('demo.roles.title');
        expect(config.tableConfig?.order).toBeUndefined();
        expect(config.tableConfig?.storageKey).toBe('staff-roles');
    });

    it('declares the name, the type, the counts and the description, none sortable', () => {
        const columns = build().tableConfig?.columns ?? [];

        expect(columns.map(({ isHideable, isSortable, key }) => [key, isSortable, isHideable])).toEqual([
            ['name', false, false],
            ['type', false, true],
            ['permissionCount', false, true],
            ['memberCount', false, true],
            ['groupCount', false, true],
            ['description', false, true]
        ]);
    });

    it('adds the organization after the group count when it is shown', () => {
        const columns = build({ isOrganizationShown: true }).tableConfig?.columns ?? [];

        expect(columns.map(({ key }) => key)).toEqual([
            'name',
            'type',
            'permissionCount',
            'memberCount',
            'groupCount',
            'organization',
            'description'
        ]);
    });

    it('searches the name with the text of the search, and by organization with two organizations or more', () => {
        const search = build().tableConfig?.search;
        const [, organization] = build({ organizations }).tableConfig?.search?.fields ?? [];

        expect(search?.mainField).toBe('text');
        expect(search?.textField).toBe('text');
        expect(search?.fields.map(({ key }) => key)).toEqual(['text']);
        expect(organization).toMatchObject({ key: 'organizationId', operators: ['equals'] });
    });

    it('offers to create, edit and delete a role', () => {
        expect(build().headerConfig?.actions.map(({ key }) => key)).toEqual(['create', 'edit', 'delete']);
    });
});
