import { PageActionScope, PageActionZone } from '../page/models/page-action.model';
import { PageFormConfig } from '../page/models/page-form.model';
import {
    OrganizationFormValue,
    OrganizationRow,
    OrganizationsConfig,
    OrganizationStatus
} from './models/organizations.model';
import { buildOrganizationsPageConfig, OrganizationsPageConfigOptions } from './organizations-page-config';

describe('buildOrganizationsPageConfig', () => {
    function build(
        overrides: Partial<OrganizationsPageConfigOptions> = {}
    ): ReturnType<typeof buildOrganizationsPageConfig> {
        return buildOrganizationsPageConfig({
            config: new OrganizationsConfig({ baseUrl: '/tenants', prefix: 'demo.tenants', storageKey: 'tenants' }),
            formConfig: new PageFormConfig<OrganizationFormValue, OrganizationRow>({
                buildSections: () => [],
                prefix: 'demo.tenants.form'
            }),
            loadRow: () => [],
            onInviteAdmin: jest.fn(),
            onReady: jest.fn(),
            ...overrides
        });
    }

    it('lists the organizations of the address of the config, by name, remembering the hidden columns', () => {
        const config = build();

        expect(config.baseUrl).toBe('/tenants');
        expect(config.prefix).toBe('demo.tenants');
        expect(config.headerConfig?.title).toBe('demo.tenants.title');
        expect(config.tableConfig?.order).toEqual({ direction: 'asc', field: 'name' });
        expect(config.tableConfig?.storageKey).toBe('tenants');
    });

    it('declares the name, the status, the user count and the creation, sortable as the server sorts them', () => {
        const columns = build().tableConfig?.columns ?? [];

        expect(columns.map(({ isHideable, isSortable, key }) => [key, isSortable, isHideable])).toEqual([
            ['name', true, false],
            ['status', false, true],
            ['userCount', true, true],
            ['createdAt', true, true]
        ]);
    });

    it('searches the name with the text of the search, and filters by status', () => {
        const search = build().tableConfig?.search;

        expect(search?.mainField).toBe('text');
        expect(search?.textField).toBe('text');
        expect(search?.fields.map(field => [field.key, field.options?.map(option => option.value)])).toEqual([
            ['text', undefined],
            ['status', Object.values(OrganizationStatus)]
        ]);
    });

    it('offers to create, rename, change the status and invite the admin of an organization', () => {
        const onInviteAdmin = jest.fn();
        const actions = build({ onInviteAdmin }).headerConfig?.actions ?? [];
        const organization: OrganizationRow = {
            actions: [],
            createdAt: 0,
            id: 'o1',
            name: 'Acme',
            status: OrganizationStatus.Active,
            userCount: 0
        };

        expect(actions.map(action => action.key)).toEqual(['create', 'edit', 'change-status', 'invite-admin']);
        expect(actions[3]).toEqual(
            expect.objectContaining({ scope: PageActionScope.Single, zone: PageActionZone.Menu })
        );

        actions[3].handler?.([organization]);

        expect(onInviteAdmin).toHaveBeenCalledWith(organization);
    });

    it('deactivates an active organization and reactivates an inactive one, never deleting', () => {
        const config = build();

        expect(config.statusConfig?.transitions).toEqual({ active: ['inactive'], inactive: ['active'] });
        expect(config.headerConfig?.actions.map(action => action.key)).not.toContain('delete');
    });
});
