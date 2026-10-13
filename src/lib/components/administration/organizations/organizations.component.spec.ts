import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { buttonByName, queryAll, queryButton, renderComponent, settle, textsOf } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';
import { FakeToastService } from '@testing/services/fake-toast.service';

import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { FormListField } from '../../form/models/fields/form-list-field.model';
import { FormHandle } from '../../form/models/form.model';
import { FormField } from '../../form/models/form-field.model';
import { FormFieldCustomValidator } from '../../form/models/form-field-validator.model';
import organizationsEn from './assets/organizations.en.json';
import { OrganizationRow, OrganizationsConfig, OrganizationStatus } from './models/organizations.model';
import { OrganizationsComponent } from './organizations.component';

const ORGANIZATIONS_URL = 'https://api.test/api/organizations';
const PREFIX = 'angular-components.organizations';

describe('OrganizationsComponent', () => {
    let fixture: ComponentFixture<OrganizationsComponent>;
    let httpTesting: HttpTestingController;
    let modalForms: FakeModalFormService;

    function buildOrganization(overrides: Partial<OrganizationRow> = {}): OrganizationRow {
        return {
            actions: ['edit'],
            createdAt: Date.UTC(2026, 0, 2),
            id: 'o2',
            name: 'Globex',
            status: OrganizationStatus.Active,
            userCount: 7,
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
        organizations: OrganizationRow[] = [buildOrganization()],
        globalActions: string[] = ['create'],
        config = new OrganizationsConfig()
    ): Promise<void> {
        fixture = await renderComponent(OrganizationsComponent, { config });
        reload().flush({
            globalActions,
            results: organizations,
            search: { filters: [], page: 1, size: 25, total: organizations.length }
        });
        await settle(fixture);
    }

    function reload(url = ORGANIZATIONS_URL): TestRequest {
        return httpTesting.expectOne(request => request.url === url && request.method === 'GET');
    }

    function rowWith(text: string): HTMLElement {
        const row = queryAll(fixture, '[role="row"]').find(candidate => candidate.textContent?.includes(text));

        if (!row) {
            throw new Error(`No row with ${text}`);
        }

        return row;
    }

    function cellsOf(rowText: string): string[] {
        return textsOf(queryAll(rowWith(rowText), '[role="cell"]'));
    }

    function fieldsOf(form: ModalFormConfig | undefined): FormField[] {
        return form?.sections.flatMap(section => section.rows.flatMap(row => row.fields)) ?? [];
    }

    function answerDetail(): void {
        httpTesting.expectOne(`${ORGANIZATIONS_URL}/o2`).flush({
            ...buildOrganization(),
            administrators: [{ email: 'rita@example.test', id: 'u9', name: 'Rita Root' }],
            groups: [
                {
                    id: 'g1',
                    members: [{ email: 'ada@example.test', id: 'u1', name: 'Ada Lovelace' }],
                    name: 'Sales'
                }
            ],
            ungroupedMembers: [{ email: 'nora@example.test', id: 'u3', name: 'nora@example.test' }]
        });
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [OrganizationsComponent],
            providers: [provideRouter([]), provideBeyTesting()]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        modalForms = TestBed.inject(FakeModalFormService);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('lists the organizations by name, with their status and how many users they have', async () => {
        await render([
            buildOrganization(),
            buildOrganization({ id: 'o3', name: 'Initech', status: OrganizationStatus.Inactive, userCount: 0 })
        ]);

        expect(cellsOf('Globex')).toEqual(expect.arrayContaining(['Globex', `${PREFIX}.status.active`, '7']));
        expect(cellsOf('Initech')).toEqual(expect.arrayContaining(['Initech', `${PREFIX}.status.inactive`, '0']));
    });

    it('sorts the organizations by name at first', async () => {
        fixture = await renderComponent(OrganizationsComponent, { config: new OrganizationsConfig() });
        const request = reload();
        request.flush({ globalActions: [], results: [] });
        await settle(fixture);

        expect(JSON.parse(atob(request.request.params.get('search') ?? ''))).toEqual(
            expect.objectContaining({ sort: { direction: 'asc', field: 'name' } })
        );
    });

    it('creates an organization with the name typed, trimmed', async () => {
        await render();

        buttonByName(fixture, `${PREFIX}.actions.create.label`).click();
        await settle(fixture);
        const form = modalForms.forms().at(-1);
        form?.onSubmit?.({ main: { name: '  Initech ' } }, buildHandle());
        const request = httpTesting.expectOne(
            current => current.url === ORGANIZATIONS_URL && current.method === 'POST'
        );
        request.flush(buildOrganization({ id: 'o3', name: 'Initech' }));
        await settle(fixture);
        reload().flush({ globalActions: [], results: [] });

        expect(form?.title).toBe(`${PREFIX}.form.create.title`);
        expect(fieldsOf(form).map(field => field.key)).toEqual(['name']);
        expect(request.request.body).toEqual({ name: 'Initech' });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: `${PREFIX}.toast.create-success` }]);
    });

    it('edits the name and the status of an organization from its name, showing its people read-only', async () => {
        await render();

        buttonByName(fixture, 'Globex').click();
        await settle(fixture);
        answerDetail();
        await settle(fixture);
        const form = modalForms.forms().at(-1);
        form?.onSubmit?.({ main: { name: 'Globex Corporation', status: OrganizationStatus.Inactive } }, buildHandle());
        const request = httpTesting.expectOne(`${ORGANIZATIONS_URL}/o2`);
        request.flush(buildOrganization({ name: 'Globex Corporation', status: OrganizationStatus.Inactive }));
        await settle(fixture);
        reload().flush({ globalActions: [], results: [] });

        expect(form?.title).toBe(`${PREFIX}.form.edit.title`);
        expect(form?.initialValue).toEqual({ main: { name: 'Globex', status: 'active' } });
        expect(fieldsOf(form).map(({ key, label }) => [key, label])).toEqual([
            ['name', undefined],
            ['status', undefined],
            ['administrators', `${PREFIX}.form.administrators.label`],
            ['g1', 'Sales'],
            ['ungrouped', `${PREFIX}.form.groups.ungrouped`]
        ]);
        expect(
            fieldsOf(form)
                .slice(2)
                .map(field => (field as FormListField).items)
        ).toEqual([['Rita Root (rita@example.test)'], ['Ada Lovelace (ada@example.test)'], ['nora@example.test']]);
        expect(request.request.method).toBe('PUT');
        expect(request.request.body).toEqual({ name: 'Globex Corporation', status: 'inactive' });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([{ message: `${PREFIX}.toast.edit-success` }]);
    });

    it('edits an organization from the edit action of the header, with no status change nor invitation of its own', async () => {
        await render();

        rowWith('Globex').click();
        await settle(fixture);

        expect(queryButton(fixture, 'angular-components.header.menu')).toBeNull();

        buttonByName(fixture, `${PREFIX}.actions.edit.label`).click();
        await settle(fixture);
        answerDetail();
        await settle(fixture);

        expect(modalForms.forms().at(-1)?.title).toBe(`${PREFIX}.form.edit.title`);
    });

    it('shows the reason the server gives for an organization it cannot read', async () => {
        await render();

        buttonByName(fixture, 'Globex').click();
        await settle(fixture);
        httpTesting
            .expectOne(`${ORGANIZATIONS_URL}/o2`)
            .flush({ errorCode: 'not-found', messageKey: 'organizations.not-found' }, { status: 404, statusText: '' });
        await settle(fixture);

        expect(modalForms.forms()).toEqual([]);
        expect(TestBed.inject(FakeModalService).errors()).toEqual([
            expect.objectContaining({ message: 'angular-components.http.error.organizations.not-found' })
        ]);
    });

    it('offers only the actions the backend lists', async () => {
        await render([buildOrganization({ actions: [] })], []);

        rowWith('Globex').click();
        await settle(fixture);

        expect(queryButton(fixture, `${PREFIX}.actions.create.label`)).toBeNull();
        expect(queryButton(fixture, `${PREFIX}.actions.edit.label`)).toBeNull();
        expect(queryButton(fixture, 'Globex')).toBeNull();
    });

    describe('deleting a deactivated organization', () => {
        const inactive = buildOrganization({
            actions: ['delete'],
            name: 'Globex',
            status: OrganizationStatus.Inactive
        });

        function fieldOf<T extends FormField>(form: ModalFormConfig | undefined, key: string): T {
            return fieldsOf(form).find(field => field.key === key) as T;
        }

        async function openDelete(): Promise<ModalFormConfig | undefined> {
            rowWith('Globex').click();
            await settle(fixture);
            buttonByName(fixture, 'angular-components.header.menu').click();
            await settle(fixture);
            buttonByName(fixture, 'Delete').click();
            await settle(fixture);
            httpTesting.expectOne(`${ORGANIZATIONS_URL}/o2/content`).flush({
                counts: { documents: 4, groups: 2, roles: 0, users: 3 }
            });
            await settle(fixture);

            return modalForms.forms().at(-1);
        }

        beforeEach(() => {
            TestBed.inject(TranslateService).setTranslation(
                'en',
                { ...organizationsEn, 'my-app': { content: { documents: 'Documents' } } },
                true
            );
        });

        it('shows what goes with it and deletes it once its exact name is typed', async () => {
            await render(
                [inactive],
                [],
                new OrganizationsConfig({ contentLabels: { documents: 'my-app.content.documents' } })
            );

            const form = await openDelete();
            const name = fieldOf(form, 'name');
            const [validator] = name.validators as FormFieldCustomValidator[];
            form?.onSubmit?.({ main: { name: 'Globex' } }, buildHandle());
            const request = httpTesting.expectOne(
                current => current.url === `${ORGANIZATIONS_URL}/o2` && current.method === 'DELETE'
            );
            request.flush(null, { status: 204, statusText: 'No Content' });
            await settle(fixture);
            reload().flush({ globalActions: [], results: [] });

            expect(form?.title).toBe(`${PREFIX}.delete.title`);
            expect(form?.isSubmitDanger).toBe(true);
            expect(fieldOf<FormInfoField>(form, 'message').items[0].label).toContain('«Globex»');
            expect(fieldOf<FormListField>(form, 'content').items).toEqual(['Documents: 4', 'Groups: 2', 'Users: 3']);
            expect(name).toMatchObject({ isRequired: true, label: 'Type «Globex» to confirm' });
            expect(validator.validatorFn(new FormControl('globex'))).toEqual({
                nameMismatch: { messageKey: `${PREFIX}.delete.name-mismatch` }
            });
            expect(validator.validatorFn(new FormControl('Globex'))).toBeNull();
            expect(request.request.body).toEqual({ name: 'Globex' });
            expect(TestBed.inject(FakeToastService).successes()).toEqual([
                { message: `${PREFIX}.toast.delete-success` }
            ]);
        });

        it('shows the reason the server gives for an organization still active', async () => {
            await render([inactive], []);

            const form = await openDelete();
            form?.onSubmit?.({ main: { name: 'Globex' } }, buildHandle());
            httpTesting
                .expectOne(current => current.url === `${ORGANIZATIONS_URL}/o2` && current.method === 'DELETE')
                .flush(
                    { errorCode: 'conflict', messageKey: 'organizations.active' },
                    { status: 409, statusText: 'Conflict' }
                );
            await settle(fixture);

            expect(TestBed.inject(FakeModalService).errors()).toEqual([
                expect.objectContaining({ message: 'angular-components.http.error.organizations.active' })
            ]);
        });
    });
});
