import { PageActionScope, PageActionZone } from '../page/models/page-action.model';
import { PageFormConfig } from '../page/models/page-form.model';
import { UserFormValue, UserRow, UsersConfig, UserStatus } from './models/users.model';
import { buildUsersPageConfig, UsersPageConfigOptions } from './users-page-config';

describe('buildUsersPageConfig', () => {
    function build(overrides: Partial<UsersPageConfigOptions> = {}): ReturnType<typeof buildUsersPageConfig> {
        return buildUsersPageConfig({
            config: new UsersConfig({ baseUrl: '/staff', prefix: 'demo.users', storageKey: 'staff' }),
            formConfig: new PageFormConfig<UserFormValue, UserRow>({
                buildSections: () => [],
                prefix: 'demo.users.form'
            }),
            loadRow: () => [],
            onReady: jest.fn(),
            onResendInvitation: jest.fn(),
            roleOptions: [{ label: 'Editor', value: 'editor' }],
            ...overrides
        });
    }

    it('lists the users of the address of the config, by email, remembering the hidden columns', () => {
        const config = build();

        expect(config.baseUrl).toBe('/staff');
        expect(config.prefix).toBe('demo.users');
        expect(config.headerConfig?.title).toBe('demo.users.title');
        expect(config.tableConfig?.order).toEqual({ direction: 'asc', field: 'email' });
        expect(config.tableConfig?.storageKey).toBe('staff');
    });

    it('declares the columns, with the creation hidden at first and the roles not sortable', () => {
        const columns = build().tableConfig?.columns ?? [];

        expect(columns.map(({ isSortable, isVisible, key }) => [key, isSortable, isVisible])).toEqual([
            ['name', true, true],
            ['email', true, true],
            ['roles', false, true],
            ['status', true, true],
            ['lastLoginAt', true, true],
            ['createdAt', true, false]
        ]);
    });

    it('searches the text over names and emails, and filters by status and role', () => {
        const search = build().tableConfig?.search;

        expect(search?.mainField).toBe('text');
        expect(search?.textField).toBe('text');
        expect(search?.fields.map(field => [field.key, field.options?.map(option => option.value)])).toEqual([
            ['text', undefined],
            ['status', Object.values(UserStatus)],
            ['role', ['editor']]
        ]);
    });

    it('offers to invite, edit, change the status and resend the invitation of a user', () => {
        const onResendInvitation = jest.fn();
        const actions = build({ onResendInvitation }).headerConfig?.actions ?? [];
        const user = { actions: [], createdAt: 0, email: 'a@b.c', id: 'u1', roles: [], status: UserStatus.Invited };

        expect(actions.map(action => action.key)).toEqual(['create', 'edit', 'change-status', 'resend-invitation']);
        expect(actions[3]).toEqual(
            expect.objectContaining({ scope: PageActionScope.Single, zone: PageActionZone.Menu })
        );

        actions[3].handler?.([user]);

        expect(onResendInvitation).toHaveBeenCalledWith(user);
    });

    it('changes the status through the transitions of the users module', () => {
        expect(build().statusConfig?.transitions).toEqual({
            active: ['inactive'],
            inactive: ['active'],
            invited: ['inactive'],
            unverified: ['inactive']
        });
    });
});
