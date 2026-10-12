import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { buttonByName, controlByName, queryAll, queryButton, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';
import { FakeToastService } from '@testing/services/fake-toast.service';

import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import {
    FormAutocompleteField,
    FormAutocompleteSearchResult
} from '../../form/models/fields/form-autocomplete-field.model';
import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { FormListField } from '../../form/models/fields/form-list-field.model';
import { FormNoticeField } from '../../form/models/fields/form-notice-field.model';
import { FormSelectField } from '../../form/models/fields/form-select-field.model';
import { FormHandle } from '../../form/models/form.model';
import { FormField } from '../../form/models/form-field.model';
import { PageSearch } from '../../page/models/page-search.model';
import usersEn from './assets/users.en.json';
import { UserEditableField, UserRolesResponse, UserRow, UsersConfig, UserStatus } from './models/users.model';
import { UsersComponent } from './users.component';

const BASE_ROLES: UserRolesResponse = { roles: ['admin', 'editor'] };
const PREFIX = 'angular-components.users';
const SEARCH_DEBOUNCE_MS = 350;
const USERS_URL = 'https://api.test/api/users';

describe('UsersComponent', () => {
    let fixture: ComponentFixture<UsersComponent>;
    let httpTesting: HttpTestingController;
    let modalForms: FakeModalFormService;

    function buildUser(overrides: Partial<UserRow> = {}): UserRow {
        return {
            actions: ['edit', 'resend-invitation'],
            createdAt: Date.UTC(2026, 0, 2),
            email: 'ada@example.test',
            id: 'u1',
            name: 'Ada',
            roles: ['editor'],
            status: UserStatus.Active,
            surname: 'Lovelace',
            ...overrides
        };
    }

    function buildHandle(): FormHandle<unknown> {
        return {
            close: jest.fn(),
            goToStep: jest.fn(),
            isDirty: jest.fn(() => true),
            patchValue: jest.fn(),
            requestClose: jest.fn(),
            reset: jest.fn(),
            value: jest.fn()
        };
    }

    async function render(
        users: UserRow[] = [buildUser()],
        globalActions: string[] = ['create'],
        config = new UsersConfig(),
        roles: UserRolesResponse = BASE_ROLES
    ): Promise<void> {
        fixture = await renderComponent(UsersComponent, { config });
        httpTesting.expectOne(`${USERS_URL}/roles`).flush(roles);
        await settle(fixture);
        httpTesting
            .expectOne(request => request.url === USERS_URL)
            .flush({ globalActions, results: users, search: { filters: [], page: 1, size: 25, total: users.length } });
        await settle(fixture);
    }

    function rowWith(text: string): HTMLElement {
        const row = queryAll(fixture, '[role="row"]').find(candidate => candidate.textContent?.includes(text));

        if (!row) {
            throw new Error(`No row with ${text}`);
        }

        return row;
    }

    function fieldsOf(form: ModalFormConfig | undefined): FormField[] {
        return form?.sections.flatMap(section => section.rows.flatMap(row => row.fields)) ?? [];
    }

    async function useMenuAction(rowText: string, action: string): Promise<void> {
        rowWith(rowText).click();
        await settle(fixture);
        buttonByName(fixture, 'angular-components.header.menu').click();
        await settle(fixture);
        buttonByName(fixture, `${PREFIX}.actions.${action}.label`).click();
        await settle(fixture);
    }

    function reload(): TestRequest {
        return httpTesting.expectOne(request => request.url === USERS_URL);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UsersComponent],
            providers: [
                provideRouter([]),
                provideBeyTesting({
                    translations: { en: { 'my-app': { roles: { editor: 'Editor' } } } }
                })
            ]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        modalForms = TestBed.inject(FakeModalFormService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('lists the users with their names, emails, roles and status', async () => {
        await render([
            buildUser(),
            buildUser({
                email: 'grace@example.test',
                id: 'u2',
                name: undefined,
                surname: undefined,
                status: UserStatus.Invited
            })
        ]);

        expect(rowWith('ada@example.test').textContent).toContain('Ada Lovelace');
        expect(rowWith('ada@example.test').textContent).toContain('editor');
        expect(rowWith('ada@example.test').textContent).toContain(`${PREFIX}.status.active`);
        expect(rowWith('grace@example.test').textContent).toContain(`${PREFIX}.table.no-name`);
        expect(rowWith('grace@example.test').textContent).toContain(`${PREFIX}.status.invited`);
    });

    it('labels the roles from the translations of the app, falling back to the name of the role', async () => {
        await render(
            [buildUser({ roles: ['editor', 'auditor'] })],
            [],
            new UsersConfig({ rolePrefix: 'my-app.roles' })
        );

        expect(rowWith('ada@example.test').textContent).toContain('Editor');
        expect(rowWith('ada@example.test').textContent).toContain('auditor');
    });

    it('sends the text of the search box as the text of the search, matching names and emails at once', async () => {
        await render();
        const box = fixture.nativeElement.querySelector('[role="searchbox"]') as HTMLInputElement;

        box.value = 'ada';
        box.dispatchEvent(new Event('input'));
        await new Promise(resolve => {
            setTimeout(resolve, SEARCH_DEBOUNCE_MS);
        });
        await settle(fixture);
        const request = reload();
        request.flush({ globalActions: [], results: [] });

        expect(JSON.parse(atob(request.request.params.get('search') ?? ''))).toEqual(
            expect.objectContaining({ filters: [], text: 'ada' })
        );
    });

    it('invites a user with the roles picked and the language of the invitation', async () => {
        await render();

        buttonByName(fixture, `${PREFIX}.actions.create.label`).click();
        await settle(fixture);
        const form = modalForms.forms().at(-1);
        form?.onSubmit?.(
            { main: { email: ' grace@example.test ', language: 'es', name: 'Grace', roles: ['admin'], surname: '' } },
            buildHandle()
        );
        const request = httpTesting.expectOne(USERS_URL);
        request.flush(buildUser({ email: 'grace@example.test', id: 'u2' }));
        await settle(fixture);
        reload().flush({ globalActions: [], results: [] });

        expect(form?.title).toBe(`${PREFIX}.form.create.title`);
        expect(fieldsOf(form).map(field => field.key)).toEqual(['email', 'name', 'surname', 'roles', 'language']);
        expect((fieldsOf(form).at(-1) as FormSelectField).options).toEqual([
            { label: 'English', value: 'en' },
            { label: 'Español', value: 'es' }
        ]);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({
            email: 'grace@example.test',
            language: 'es',
            name: 'Grace',
            roles: ['admin']
        });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: `${PREFIX}.toast.create-success` }]);
    });

    it('edits the roles and names of a user from its name, showing the email read-only', async () => {
        await render();

        buttonByName(fixture, 'Ada Lovelace').click();
        await settle(fixture);
        const form = modalForms.forms().at(-1);
        form?.onSubmit?.({ main: { name: 'Ada', roles: ['admin', 'editor'], surname: 'Byron' } }, buildHandle());
        const request = httpTesting.expectOne(`${USERS_URL}/u1`);
        request.flush(buildUser());
        await settle(fixture);
        reload().flush({ globalActions: [], results: [] });

        expect(form?.title).toBe(`${PREFIX}.form.edit.title`);
        expect(form?.initialValue).toEqual({ main: { name: 'Ada', roles: ['editor'], surname: 'Lovelace' } });
        expect((fieldsOf(form)[0] as FormInfoField).items).toEqual([{ label: 'ada@example.test' }]);
        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({ name: 'Ada', roles: ['admin', 'editor'], surname: 'Byron' });
    });

    it('changes the status of a user in the edit form, sending only what the row lets change', async () => {
        await render([buildUser({ editableFields: [UserEditableField.Name, UserEditableField.Status] })]);

        buttonByName(fixture, 'Ada Lovelace').click();
        await settle(fixture);
        const form = modalForms.forms().at(-1);
        form?.onSubmit?.(
            { main: { name: 'Ada', roles: ['admin'], status: 'inactive', surname: 'Lovelace' } },
            buildHandle()
        );
        const request = httpTesting.expectOne(`${USERS_URL}/u1`);
        request.flush(buildUser({ status: UserStatus.Inactive }));
        await settle(fixture);
        reload().flush({ globalActions: [], results: [] });

        expect(fieldsOf(form).find(({ key }) => key === 'status')).toMatchObject({
            isDisabled: false,
            options: [
                { label: `${PREFIX}.status.active`, value: 'active' },
                { label: `${PREFIX}.status.inactive`, value: 'inactive' }
            ]
        });
        expect(form?.initialValue).toEqual({
            main: { name: 'Ada', roles: ['editor'], status: 'active', surname: 'Lovelace' }
        });
        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({ name: 'Ada', status: 'inactive' });
    });

    it('offers no status change action of its own, the status being part of the edit', async () => {
        await render();

        rowWith('ada@example.test').click();
        await settle(fixture);
        buttonByName(fixture, 'angular-components.header.menu').click();
        await settle(fixture);

        expect(queryButton(fixture, `${PREFIX}.actions.change-status.label`)).toBeNull();
        expect(queryButton(fixture, `${PREFIX}.actions.resend-invitation.label`)).not.toBeNull();
    });

    it('sends the invitation again to an invited user', async () => {
        await render([buildUser({ actions: ['resend-invitation'], status: UserStatus.Invited })]);

        await useMenuAction('ada@example.test', 'resend-invitation');
        const request = httpTesting.expectOne(`${USERS_URL}/u1/invitation`);
        request.flush(null);

        expect(request.request.method).toBe('POST');
        expect(TestBed.inject(FakeToastService).successes()).toEqual([
            { message: `${PREFIX}.toast.resend-invitation-success` }
        ]);
    });

    it('offers only the actions the backend lists', async () => {
        await render([buildUser({ actions: [] })], []);

        rowWith('ada@example.test').click();
        await settle(fixture);

        expect(queryButton(fixture, `${PREFIX}.actions.create.label`)).toBeNull();
        expect(queryButton(fixture, `${PREFIX}.actions.edit.label`)).toBeNull();
        expect(queryButton(fixture, 'Ada Lovelace')).toBeNull();
    });

    describe('with extra roles', () => {
        const ROLES: UserRolesResponse = {
            extraRoles: [{ id: 'r1', name: 'Reviewers', organizationId: 'o2' }],
            roles: ['admin', 'editor']
        };

        async function choose(select: HTMLSelectElement, value: string): Promise<void> {
            select.value = value;
            select.dispatchEvent(new Event('change'));
            await settle(fixture);
        }

        async function click(button: HTMLElement): Promise<void> {
            button.click();
            await settle(fixture);
        }

        beforeEach(async () => {
            await render(
                [buildUser({ extraRoles: [{ id: 'r1', name: 'Reviewers' }] })],
                ['create'],
                new UsersConfig(),
                ROLES
            );
        });

        it('shows the extra roles of a user after its roles', () => {
            expect(rowWith('ada@example.test').textContent).toContain('editor');
            expect(rowWith('ada@example.test').textContent).toContain('Reviewers');
        });

        it('invites a user with the extra roles picked among those of the organization', async () => {
            await click(buttonByName(fixture, `${PREFIX}.actions.create.label`));
            const form = modalForms.forms().at(-1);
            form?.onSubmit?.(
                { main: { email: 'grace@example.test', extraRoleIds: ['r1'], roles: ['editor'] } },
                buildHandle()
            );
            const request = httpTesting.expectOne(current => current.url === USERS_URL && current.method === 'POST');
            request.flush(buildUser({ email: 'grace@example.test', id: 'u2' }));
            await settle(fixture);
            reload().flush({ globalActions: [], results: [] });

            expect(fieldsOf(form).map(field => field.key)).toContain('extraRoleIds');
            expect(request.request.body).toEqual({
                email: 'grace@example.test',
                extraRoleIds: ['r1'],
                roles: ['editor']
            });
        });

        it('edits the extra roles of a user, checked with those it holds', async () => {
            await click(buttonByName(fixture, 'Ada Lovelace'));
            const form = modalForms.forms().at(-1);
            form?.onSubmit?.({ main: { extraRoleIds: [], name: 'Ada', roles: ['editor'] } }, buildHandle());
            const request = httpTesting.expectOne(`${USERS_URL}/u1`);
            request.flush(buildUser());
            await settle(fixture);
            reload().flush({ globalActions: [], results: [] });

            expect(form?.initialValue).toEqual({
                main: { extraRoleIds: ['r1'], name: 'Ada', roles: ['editor'], surname: 'Lovelace' }
            });
            expect(request.request.body).toEqual({ extraRoleIds: [], name: 'Ada', roles: ['editor'] });
        });

        it('shows the reason the server gives for extra roles out of the organization of the user', async () => {
            await click(buttonByName(fixture, 'Ada Lovelace'));
            modalForms
                .forms()
                .at(-1)
                ?.onSubmit?.({ main: { extraRoleIds: ['r9'], name: 'Ada', roles: ['editor'] } }, buildHandle());
            httpTesting
                .expectOne(`${USERS_URL}/u1`)
                .flush(
                    { errorCode: 'invalid', messageKey: 'users.invalid-extra-roles' },
                    { status: 400, statusText: 'Bad Request' }
                );
            await settle(fixture);

            expect(TestBed.inject(FakeModalService).errors()).toEqual([
                expect.objectContaining({ message: 'angular-components.http.error.users.invalid-extra-roles' })
            ]);
        });

        it('filters by an extra role, sending its id as the role', async () => {
            await click(queryAll<HTMLButtonElement>(fixture, 'bey-search [aria-expanded]')[0]);
            await click(buttonByName(fixture, 'angular-components.search.add'));
            const selects = (): HTMLSelectElement[] =>
                queryAll<HTMLSelectElement>(queryAll(fixture, '[role="group"]')[0], 'select');
            await choose(selects()[0], 'role');
            await choose(selects()[2], 'r1');
            await click(buttonByName(fixture, 'angular-components.search.apply'));
            const search = JSON.parse(atob(reload().request.params.get('search') ?? '')) as PageSearch;

            expect(search.filters).toEqual([{ field: 'role', operator: 'equals', value: 'r1' }]);
        });
    });

    it('still lists the users when the roles cannot be read', async () => {
        fixture = await renderComponent(UsersComponent, { config: new UsersConfig({ baseUrl: '/staff' }) });
        httpTesting.expectOne('https://api.test/api/staff/roles').flush(null, { status: 403, statusText: 'Forbidden' });
        await settle(fixture);
        httpTesting
            .expectOne(request => request.url === 'https://api.test/api/staff')
            .flush({ globalActions: [], results: [buildUser()] });
        await settle(fixture);

        expect(rowWith('ada@example.test')).toBeTruthy();
    });

    describe('the content of a user', () => {
        const CONTENT_LABELS = { documents: 'my-app.content.documents' };

        function fieldOf<T extends FormField>(form: ModalFormConfig | undefined, key: string): T {
            return fieldsOf(form).find(field => field.key === key) as T;
        }

        async function useNamedAction(label: string): Promise<void> {
            rowWith('ada@example.test').click();
            await settle(fixture);
            buttonByName(fixture, 'angular-components.header.menu').click();
            await settle(fixture);
            buttonByName(fixture, label).click();
            await settle(fixture);
        }

        async function deleteSelected(): Promise<void> {
            controlByName(fixture, 'angular-components.table.select-all').click();
            await settle(fixture);
            buttonByName(fixture, 'angular-components.header.menu').click();
            await settle(fixture);
            buttonByName(fixture, 'Delete').click();
            await settle(fixture);
        }

        beforeEach(() => {
            TestBed.inject(TranslateService).setTranslation(
                'en',
                {
                    'angular-components': { ...usersEn['angular-components'], 'user-name': { unknown: 'Unknown' } },
                    'my-app': { content: { documents: 'Documents' } }
                },
                true
            );
        });

        it('transfers what an inactive user owns to the active user picked, into a folder named after them', async () => {
            await render(
                [buildUser({ actions: ['transfer'], status: UserStatus.Inactive })],
                [],
                new UsersConfig({ contentLabels: CONTENT_LABELS })
            );

            await useNamedAction('Transfer content');
            httpTesting
                .expectOne(`${USERS_URL}/u1/content`)
                .flush({ counts: { attachments: 1, documents: 2, templates: 0 }, usedByOthers: {} });
            await settle(fixture);
            const form = modalForms.forms().at(-1);
            let suggestions: FormAutocompleteSearchResult | undefined;
            fieldOf<FormAutocompleteField>(form, 'targetUserId')
                .search?.('gra', [])
                .subscribe(result => (suggestions = result as FormAutocompleteSearchResult));
            const search = httpTesting.expectOne(request => request.url === `${USERS_URL}/u1/transfer-targets`);
            search.flush({ options: [{ email: 'grace@example.test', id: 'u2', name: 'Grace', surname: 'Hopper' }] });
            form?.onSubmit?.({ main: { targetUserId: 'u2' } }, buildHandle());
            const request = httpTesting.expectOne(`${USERS_URL}/u1/transfer`);
            request.flush({ transferred: { documents: 2 } });
            await settle(fixture);
            reload().flush({ globalActions: [], results: [] });

            expect(form?.title).toBe("Transfer Ada Lovelace's content");
            expect(form?.footer?.note).toBe(
                'Everything moves into a folder «Ada Lovelace» at the root of the person you choose.'
            );
            expect(fieldOf<FormListField>(form, 'content').items).toEqual(['attachments: 1', 'Documents: 2']);
            expect(fieldOf(form, 'targetUserId').isRequired).toBe(true);
            expect([search.request.params.get('search'), search.request.params.get('limit')]).toEqual(['gra', '20']);
            expect(suggestions).toEqual({
                hasMore: false,
                options: [{ label: 'Grace Hopper (grace@example.test)', value: 'u2' }]
            });
            expect(request.request.method).toBe('POST');
            expect(request.request.body).toEqual({ targetUserId: 'u2' });
            expect(TestBed.inject(FakeToastService).successes()).toEqual([
                { message: `${PREFIX}.toast.transfer-success` }
            ]);
        });

        it('deletes the users selected, one request each, after a confirmation with what they own and what others use', async () => {
            await render(
                [
                    buildUser({ actions: ['delete'], status: UserStatus.Inactive }),
                    buildUser({
                        actions: ['delete'],
                        email: 'grace@example.test',
                        id: 'u2',
                        status: UserStatus.Invited
                    })
                ],
                [],
                new UsersConfig({ contentLabels: CONTENT_LABELS })
            );

            await deleteSelected();
            httpTesting.expectOne(`${USERS_URL}/u1/content`).flush({
                counts: { documents: 2 },
                usedByOthers: {
                    documents: [
                        { id: 'd1', name: 'Offer', users: [{ id: 'd9', name: 'Offer for Acme', ownerName: null }] }
                    ]
                }
            });
            httpTesting.expectOne(`${USERS_URL}/u2/content`).flush({ counts: { documents: 1 }, usedByOthers: {} });
            await settle(fixture);
            const form = modalForms.forms().at(-1);
            form?.onSubmit?.({}, buildHandle());
            const first = httpTesting.expectOne(`${USERS_URL}/u1`);
            first.flush(null, { status: 204, statusText: 'No Content' });
            const second = httpTesting.expectOne(`${USERS_URL}/u2`);
            second.flush(null, { status: 204, statusText: 'No Content' });
            await settle(fixture);
            reload().flush({ globalActions: [], results: [] });

            expect(form?.title).toBe('Delete users');
            expect(form?.isSubmitDanger).toBe(true);
            expect(form?.submitLabel).toBe(`${PREFIX}.delete.submit`);
            expect(fieldOf<FormInfoField>(form, 'message').items).toEqual([
                { label: '2 users will be deleted, together with everything they still own.' }
            ]);
            expect(fieldOf<FormInfoField>(form, 'invitation').items).toEqual([
                { label: 'The invitation will stop working.' }
            ]);
            expect(fieldOf<FormListField>(form, 'content').items).toEqual(['Documents: 3']);
            expect(fieldOf<FormNoticeField>(form, 'usedByOthersNotice').messageParameters).toEqual({
                unknown: 'Unknown'
            });
            expect(fieldOf<FormListField>(form, 'usedByOthers').items).toEqual([
                'Documents «Offer»: Offer for Acme (Unknown)'
            ]);
            expect([first.request.method, second.request.method]).toEqual(['DELETE', 'DELETE']);
            expect(TestBed.inject(FakeToastService).successes()).toEqual([
                { message: `${PREFIX}.toast.delete-success` }
            ]);
        });

        it('names the one user deleted and warns of nothing when nobody else uses what they own', async () => {
            await render([buildUser({ actions: ['delete'], status: UserStatus.Inactive })], []);

            await useNamedAction('Delete');
            httpTesting.expectOne(`${USERS_URL}/u1/content`).flush({ counts: { documents: 0 } });
            await settle(fixture);
            const form = modalForms.forms().at(-1);

            expect(form?.title).toBe('Delete user');
            expect(fieldOf<FormInfoField>(form, 'message').items).toEqual([
                { label: 'Ada Lovelace will be deleted, together with everything they still own.' }
            ]);
            expect(fieldsOf(form).map(({ key }) => key)).toEqual(['message', 'content']);
            expect(fieldOf<FormListField>(form, 'content')).toMatchObject({
                emptyKey: `${PREFIX}.content.empty`,
                items: []
            });
        });

        it('reloads when a deletion fails half-way, so the rows already deleted go', async () => {
            await render(
                [
                    buildUser({ actions: ['delete'], status: UserStatus.Inactive }),
                    buildUser({
                        actions: ['delete'],
                        email: 'grace@example.test',
                        id: 'u2',
                        status: UserStatus.Inactive
                    })
                ],
                []
            );

            await deleteSelected();
            httpTesting.expectOne(`${USERS_URL}/u1/content`).flush({ counts: {} });
            httpTesting.expectOne(`${USERS_URL}/u2/content`).flush({ counts: {} });
            await settle(fixture);
            modalForms.forms().at(-1)?.onSubmit?.({}, buildHandle());
            httpTesting.expectOne(`${USERS_URL}/u1`).flush(null, { status: 204, statusText: 'No Content' });
            httpTesting
                .expectOne(`${USERS_URL}/u2`)
                .flush(
                    { errorCode: 'conflict', messageKey: 'users.not-deletable' },
                    { status: 409, statusText: 'Conflict' }
                );
            await settle(fixture);
            reload().flush({ globalActions: [], results: [] });

            expect(TestBed.inject(FakeModalService).errors()).toEqual([
                expect.objectContaining({ message: 'angular-components.http.error.users.not-deletable' })
            ]);
            expect(TestBed.inject(FakeToastService).successes()).toEqual([]);
        });
    });
});
