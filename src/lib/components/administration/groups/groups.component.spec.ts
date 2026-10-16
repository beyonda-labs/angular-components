import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { buttonByName, cellsOf, queryButton, renderComponent, rowWith, settle } from '@testing/dom';
import { fieldsOf } from '@testing/form-fields';
import { FakeFormHandle } from '@testing/handles/fake-form-handle';
import { searchOf } from '@testing/page-search';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';
import { FakeToastService } from '@testing/services/fake-toast.service';

import { SessionUser } from '../../../services/session/models/session.model';
import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { FormListField } from '../../form/models/fields/form-list-field.model';
import { GroupsComponent } from './groups.component';
import { GroupRow, GroupsConfig } from './models/groups.model';

const GROUPS_URL = 'https://api.test/api/groups';
const MANAGER: SessionUser = {
    allowedPaths: ['/groups'],
    email: 'manager@example.test',
    organizationId: 'o2',
    redirectPath: '/groups',
    roles: ['adminuser']
};
const PREFIX = 'angular-components.groups';

describe('GroupsComponent', () => {
    let fixture: ComponentFixture<GroupsComponent>;
    let httpTesting: HttpTestingController;
    let modalForms: FakeModalFormService;

    function buildGroup(overrides: Partial<GroupRow> = {}): GroupRow {
        return {
            actions: ['edit', 'delete'],
            createdAt: Date.UTC(2026, 0, 2),
            extraRoleCount: 2,
            id: 'g1',
            memberCount: 3,
            name: 'Sales',
            ...overrides
        };
    }

    async function render(
        groups: GroupRow[] = [buildGroup()],
        globalActions: string[] = ['create'],
        config = new GroupsConfig()
    ): Promise<void> {
        fixture = await renderComponent(GroupsComponent, { config });
        reload().flush({
            globalActions,
            results: groups,
            search: { filters: [], page: 1, size: 25, total: groups.length }
        });
        await settle(fixture);
    }

    function reload(url = GROUPS_URL): TestRequest {
        return httpTesting.expectOne(request => request.url === url && request.method === 'GET');
    }

    async function openMenu(rowText: string): Promise<void> {
        rowWith(fixture, rowText).click();
        await settle(fixture);
        buttonByName(fixture, 'angular-components.header.menu').click();
        await settle(fixture);
    }

    async function answerEdit(): Promise<void> {
        httpTesting.expectOne(`${GROUPS_URL}/g1`).flush({
            ...buildGroup(),
            extraRoles: [{ id: 'r1', name: 'Reviewers' }],
            members: [{ email: 'ada@example.test', id: 'u1', name: 'Ada Lovelace' }]
        });
        await settle(fixture);
    }

    async function editFromName(): Promise<ModalFormConfig | undefined> {
        buttonByName(fixture, 'Sales').click();
        await settle(fixture);
        await answerEdit();

        return modalForms.forms().at(-1);
    }

    async function useMenuAction(rowText: string, action: string): Promise<void> {
        await openMenu(rowText);
        buttonByName(fixture, `${PREFIX}.actions.${action}.label`).click();
        await settle(fixture);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GroupsComponent],
            providers: [provideRouter([]), provideBeyTesting({ user: MANAGER })]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        modalForms = TestBed.inject(FakeModalFormService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('lists the groups by name, with how many members and extra roles they have', async () => {
        await render([buildGroup(), buildGroup({ extraRoleCount: 1, id: 'g2', memberCount: 0, name: 'Support' })]);

        expect(cellsOf(fixture, 'Sales')).toEqual(expect.arrayContaining(['Sales', '3', '2']));
        expect(cellsOf(fixture, 'Support')).toEqual(expect.arrayContaining(['Support', '0', '1']));
        expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.table.columns.extra-role-count`);
    });

    it('sorts the groups by name at first, from the address of the config', async () => {
        fixture = await renderComponent(GroupsComponent, { config: new GroupsConfig({ baseUrl: '/teams' }) });
        const request = reload('https://api.test/api/teams');
        request.flush({ globalActions: [], results: [] });
        await settle(fixture);

        expect(searchOf(request)).toEqual(expect.objectContaining({ sort: { direction: 'asc', field: 'name' } }));
    });

    it('creates a group with the name typed, trimmed, in the organization of the manager', async () => {
        await render();

        buttonByName(fixture, `${PREFIX}.actions.create.label`).click();
        await settle(fixture);
        const form = modalForms.forms().at(-1);
        form?.onSubmit?.({ main: { name: '  Support ' } }, new FakeFormHandle());
        const request = httpTesting.expectOne(current => current.url === GROUPS_URL && current.method === 'POST');
        request.flush(buildGroup({ id: 'g2', name: 'Support' }));
        await settle(fixture);
        reload().flush({ globalActions: [], results: [] });

        expect(form?.title).toBe(`${PREFIX}.form.create.title`);
        expect(fieldsOf(form).map(field => field.key)).toEqual(['name']);
        expect(request.request.body).toEqual({ name: 'Support' });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: `${PREFIX}.toast.create-success` }]);
    });

    it('edits the name, the members and the extra roles of a group from its name, read from the server first', async () => {
        await render();

        const form = await editFromName();
        form?.onSubmit?.({ main: { extraRoleIds: ['r2'], name: 'Sales team', userIds: ['u2'] } }, new FakeFormHandle());
        const request = httpTesting.expectOne(`${GROUPS_URL}/g1`);
        request.flush(buildGroup({ name: 'Sales team' }));
        await settle(fixture);
        reload().flush({ globalActions: [], results: [] });

        expect(form?.title).toBe(`${PREFIX}.form.edit.title`);
        expect(fieldsOf(form).map(({ key }) => key)).toEqual(['name', 'userIds', 'extraRoleIds']);
        expect((fieldsOf(form)[1] as FormListField).options).toEqual([
            { label: 'Ada Lovelace (ada@example.test)', value: 'u1' }
        ]);
        expect((fieldsOf(form)[2] as FormListField).options).toEqual([{ label: 'Reviewers', value: 'r1' }]);
        expect(form?.initialValue).toEqual({ main: { extraRoleIds: ['r1'], name: 'Sales', userIds: ['u1'] } });
        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({ extraRoleIds: ['r2'], name: 'Sales team', userIds: ['u2'] });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: `${PREFIX}.toast.edit-success` }]);
    });

    it('edits a group from the edit action of the header, and offers no separate members action', async () => {
        await render();

        await openMenu('Sales');

        expect(queryButton(fixture, `${PREFIX}.actions.members.label`)).toBeNull();

        buttonByName(fixture, `${PREFIX}.actions.edit.label`).click();
        await settle(fixture);
        await answerEdit();

        expect(modalForms.forms().at(-1)?.title).toBe(`${PREFIX}.form.edit.title`);
    });

    it('shows the reason the server gives for a name taken in the organization', async () => {
        await render();

        const form = await editFromName();
        form?.onSubmit?.({ main: { extraRoleIds: [], name: 'Support', userIds: [] } }, new FakeFormHandle());
        httpTesting
            .expectOne(`${GROUPS_URL}/g1`)
            .flush(
                { errorCode: 'conflict', messageKey: 'groups.existing-name', messageParameters: { name: 'Support' } },
                { status: 409, statusText: 'Conflict' }
            );
        await settle(fixture);

        expect(TestBed.inject(FakeModalService).errors()).toEqual([
            expect.objectContaining({
                message: 'angular-components.http.error.groups.existing-name',
                messageParameters: { name: 'Support' }
            })
        ]);
    });

    it('deletes the groups selected once the user confirms that their members lose the folders shared', async () => {
        const modal = TestBed.inject(FakeModalService);
        modal.setConfirmationAnswer(true);
        await render([buildGroup(), buildGroup({ id: 'g2', name: 'Support' })]);

        await useMenuAction('Sales', 'delete');
        const request = httpTesting.expectOne(current => current.url === GROUPS_URL && current.method === 'DELETE');
        request.flush(null);
        await settle(fixture);
        reload().flush({ globalActions: [], results: [] });

        expect(modal.confirmations()).toEqual([
            expect.objectContaining({
                message: `${PREFIX}.modal.delete.message`,
                messageParameters: { count: 1 },
                title: `${PREFIX}.modal.delete.title`
            })
        ]);
        expect(request.request.body).toEqual({ ids: ['g1'] });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: `${PREFIX}.toast.delete-success` }]);
    });

    it('deletes nothing when the user does not confirm', async () => {
        await render();

        await useMenuAction('Sales', 'delete');

        httpTesting.expectNone(current => current.method === 'DELETE');
        expect(TestBed.inject(FakeModalService).confirmations()).toHaveLength(1);
    });

    it('shows the reason the server gives for refusing the members', async () => {
        await render();

        const form = await editFromName();
        form?.onSubmit?.({ main: { extraRoleIds: [], name: 'Sales', userIds: ['u9'] } }, new FakeFormHandle());
        httpTesting
            .expectOne(current => current.url === `${GROUPS_URL}/g1` && current.method === 'PUT')
            .flush(
                { errorCode: 'invalid', messageKey: 'groups.invalid-members', messageParameters: { userIds: ['u9'] } },
                { status: 400, statusText: 'Bad Request' }
            );
        await settle(fixture);

        expect(TestBed.inject(FakeModalService).errors()).toEqual([
            expect.objectContaining({ message: 'angular-components.http.error.groups.invalid-members' })
        ]);
    });

    describe('for a member who reads their own groups', () => {
        async function renderMember(member: GroupRow): Promise<void> {
            await render([member], []);
        }

        async function openView(detail: Record<string, unknown>): Promise<ModalFormConfig | undefined> {
            buttonByName(fixture, 'Sales').click();
            await settle(fixture);
            httpTesting.expectOne(`${GROUPS_URL}/g1`).flush({ id: 'g1', name: 'Sales', ...detail });
            await settle(fixture);

            return modalForms.forms().at(-1);
        }

        it('asks for the groups once, though what the server answers turns the page read-only', async () => {
            await renderMember(buildGroup({ actions: [], extraRoleCount: undefined, roleCount: 1 }));

            expect(httpTesting.match(request => request.url === GROUPS_URL && request.method === 'GET')).toEqual([]);
            expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.table.columns.role-count`);
            expect(fixture.nativeElement.textContent).not.toContain(`${PREFIX}.table.columns.extra-role-count`);
        });

        it('offers no action, and opens a group from its name with its members to read', async () => {
            await renderMember(buildGroup({ actions: [], extraRoleCount: undefined }));

            expect(queryButton(fixture, `${PREFIX}.actions.create.label`)).toBeNull();
            expect(queryButton(fixture, `${PREFIX}.actions.edit.label`)).toBeNull();
            expect(fixture.nativeElement.textContent).not.toContain(`${PREFIX}.table.columns.extra-role-count`);

            const view = await openView({
                members: [{ email: 'ada@example.test', id: 'u1', name: 'Ada', surname: 'Lovelace' }]
            });

            expect(view?.title).toBe(`${PREFIX}.view.title`);
            expect(view?.isSubmitHidden).toBe(true);
            expect(fieldsOf(view).map(({ key }) => key)).toEqual(['name', 'members']);
            expect((fieldsOf(view)[1] as FormListField).items).toEqual(['Ada Lovelace (ada@example.test)']);
        });

        it('opens the selected group from the view action of the header when its row lists view', async () => {
            await renderMember(buildGroup({ actions: ['view'], extraRoleCount: undefined }));

            expect(fixture.nativeElement.textContent).not.toContain(`${PREFIX}.table.columns.extra-role-count`);

            rowWith(fixture, 'Sales').click();
            await settle(fixture);

            expect(queryButton(fixture, `${PREFIX}.actions.edit.label`)).toBeNull();
            expect(queryButton(fixture, 'angular-components.header.menu')).toBeNull();

            buttonByName(fixture, 'angular-components.page.actions.view.label').click();
            await settle(fixture);
            httpTesting.expectOne(`${GROUPS_URL}/g1`).flush({ id: 'g1', members: [], name: 'Sales' });
            await settle(fixture);

            expect(modalForms.forms().at(-1)?.title).toBe(`${PREFIX}.view.title`);
        });

        it('counts and lists the roles of the groups when the rows count them, each opening its permissions', async () => {
            await renderMember(buildGroup({ actions: [], extraRoleCount: undefined, roleCount: 1 }));

            expect(fixture.nativeElement.textContent).toContain(`${PREFIX}.table.columns.role-count`);

            const view = await openView({
                extraRoles: [{ id: 'r1', name: 'Reviewers', permissions: ['templates.edit'] }],
                members: []
            });
            const roles = fieldsOf(view).find(({ key }) => key === 'extraRoles') as FormListField;

            expect(roles.items).toEqual(['Reviewers']);

            roles.onItemClick?.('Reviewers', 0);

            expect(modalForms.forms().at(-1)?.title).toBe('angular-components.roles.view.title');
            expect(modalForms.forms().at(-1)?.initialValue).toEqual({
                main: { description: '', name: 'Reviewers' },
                permissions: { permissions: ['templates.edit'] }
            });
        });
    });
});
