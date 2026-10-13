import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { buttonByName, controlByName, queryAll, renderComponent, settle, textsOf } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { of } from 'rxjs';

import formEn from '../../../form/assets/form.en.json';
import { ModalFormConfig, ModalFormSize } from '../../../form/components/modal/models/modal-form.model';
import { FormComponent } from '../../../form/form.component';
import { FormAutocompleteSearchResult } from '../../../form/models/fields/form-autocomplete-field.model';
import { FormListField } from '../../../form/models/fields/form-list-field.model';
import { FormSection } from '../../../form/models/form.model';
import { FormField } from '../../../form/models/form-field.model';
import { FormFieldValidatorType } from '../../../form/models/form-field-validator.model';
import groupsEn from '../assets/groups.en.json';
import {
    GroupDetail,
    GroupEditFormValue,
    GroupEditOptions,
    GroupMember,
    GroupsFormOptions
} from '../models/groups.model';
import { GroupsFormService } from './groups-form.service';

describe('GroupsFormService', () => {
    let service: GroupsFormService;

    const ada: GroupMember = { email: 'ada@example.test', id: 'u1', name: 'Ada Lovelace' };
    const grace: GroupMember = { email: 'grace@example.test', id: 'u2', name: 'grace@example.test' };
    const reviewers = { id: 'r1', name: 'Reviewers' };
    const writers = { id: 'r2', name: 'Writers' };
    const detail: GroupDetail = {
        actions: ['edit'],
        createdAt: 0,
        extraRoleCount: 1,
        extraRoles: [reviewers],
        id: 'g1',
        memberCount: 1,
        members: [ada],
        name: 'Sales'
    };
    const organizations = [
        { id: 'o1', name: 'Acme' },
        { id: 'o2', name: 'Globex' }
    ];

    function fieldsOf(sections: FormSection[]): FormField[] {
        return sections.flatMap(section => section.rows.flatMap(row => row.fields));
    }

    function buildOptions(overrides: Partial<GroupsFormOptions> = {}): GroupsFormOptions {
        return { isOrganizationAsked: false, organizations: [], prefix: 'demo.teams', ...overrides };
    }

    function buildEditOptions(overrides: Partial<GroupEditOptions> = {}): GroupEditOptions {
        return {
            detail,
            isOrganizationShown: false,
            prefix: 'demo.teams',
            searchExtraRoles: jest.fn(() => of([reviewers, writers])),
            searchMembers: jest.fn(() => of([ada, grace])),
            ...overrides
        };
    }

    function buildPeople(count: number): GroupMember[] {
        return Array.from({ length: count }, (_, index) => ({
            email: `user${index}@example.test`,
            id: `p${index}`,
            name: `User ${index}`
        }));
    }

    function renderInEnglish(config: ModalFormConfig<GroupEditFormValue>): Promise<ComponentFixture<FormComponent>> {
        const translate = TestBed.inject(TranslateService);

        translate.setTranslation('en', formEn);
        translate.setTranslation('en', groupsEn, true);
        translate.use('en');

        return renderComponent(FormComponent, { config });
    }

    function search(list: FormField, text: string, chosenIds: string[]): FormAutocompleteSearchResult {
        const answers: unknown[] = [];

        (list as FormListField).picker?.search?.(text, chosenIds).subscribe(answer => answers.push(answer));

        return answers[0] as FormAutocompleteSearchResult;
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        service = TestBed.inject(GroupsFormService);
    });

    it('asks for a required name of at most 100 characters to create a group', () => {
        const form = service.buildFormConfig(buildOptions());
        const [name, ...rest] = fieldsOf(form.buildSections());

        expect(form.prefix).toBe('demo.teams.form');
        expect(name).toMatchObject({ isRequired: true, key: 'name' });
        expect(name.validators).toEqual([
            expect.objectContaining({ args: 100, type: FormFieldValidatorType.MaxLength })
        ]);
        expect(rest).toEqual([]);
        expect(form.toFormValue()).toBeUndefined();
    });

    it('sends the name trimmed, with no organization when none is asked', () => {
        expect(service.buildFormConfig(buildOptions()).toItem({ main: { name: '  Sales ' } })).toEqual({
            name: 'Sales'
        });
    });

    it('asks a superadmin for the organization to create in, required', () => {
        const form = service.buildFormConfig(buildOptions({ isOrganizationAsked: true, organizations }));
        const [, organization] = fieldsOf(form.buildSections());

        expect(organization).toMatchObject({
            isRequired: true,
            key: 'organizationId',
            options: [
                { label: 'Acme', value: 'o1' },
                { label: 'Globex', value: 'o2' }
            ]
        });
        expect(form.toFormValue()).toBeUndefined();
        expect(form.toItem({ main: { name: ' Sales ', organizationId: 'o2' } })).toEqual({
            name: 'Sales',
            organizationId: 'o2'
        });
    });

    it('chooses the organization already when only one is active', () => {
        const form = service.buildFormConfig(
            buildOptions({ isOrganizationAsked: true, organizations: [organizations[1]] })
        );

        expect(form.toFormValue()).toEqual({ main: { name: '', organizationId: 'o2' } });
    });

    it('chooses the organization of the folder it opens in', () => {
        const form = service.buildFormConfig(buildOptions({ isOrganizationAsked: true, organizations }));

        expect(form.toFormValue(undefined, { id: 'o1', label: 'Acme' })).toEqual({
            main: { name: '', organizationId: 'o1' }
        });
    });

    it('edits the name, the members and the extra roles of a group in one form, filled in with what it holds', () => {
        const form = service.buildEditFormConfig(buildEditOptions());
        const [name, members, extraRoles] = fieldsOf(form.sections);

        expect(form.title).toBe('demo.teams.form.edit.title');
        expect(form.prefix).toBe('demo.teams.form');
        expect(form.size).toBe(ModalFormSize.Medium);
        expect(form.buttons.map(({ label }) => label)).toEqual([
            'angular-components.page.form.cancel',
            'angular-components.page.form.submit'
        ]);
        expect(name).toMatchObject({ isRequired: true, key: 'name' });
        expect(members).toMatchObject({
            emptyKey: 'demo.teams.form.main.user-ids.empty',
            isRemovable: true,
            key: 'userIds',
            options: [{ label: 'Ada Lovelace (ada@example.test)', value: 'u1' }]
        });
        expect(extraRoles).toMatchObject({
            emptyKey: 'demo.teams.form.main.extra-role-ids.empty',
            isRemovable: true,
            key: 'extraRoleIds',
            options: [{ label: 'Reviewers', value: 'r1' }]
        });
        expect(form.initialValue).toEqual({ main: { extraRoleIds: ['r1'], name: 'Sales', userIds: ['u1'] } });
    });

    it('shows a superadmin the organization of the group it edits after the name, in a disabled select', async () => {
        const form = service.buildEditFormConfig(
            buildEditOptions({
                detail: { ...detail, organizationId: 'o2', organizationName: 'Globex' },
                isOrganizationShown: true,
                prefix: 'angular-components.groups'
            })
        );
        const fixture = await renderInEnglish(form);
        const organization = controlByName<HTMLSelectElement>(fixture, 'Organization');

        expect(fieldsOf(form.sections).map(({ key }) => key)).toEqual([
            'name',
            'organizationId',
            'userIds',
            'extraRoleIds'
        ]);
        expect(organization.disabled).toBe(true);
        expect(organization.selectedOptions[0]?.textContent?.trim()).toBe('Globex');
        expect(form.initialValue?.main.organizationId).toBe('o2');

        fixture.destroy();
    });

    it('shows a manager no organization of the group it edits', () => {
        const form = service.buildEditFormConfig(
            buildEditOptions({ detail: { ...detail, organizationId: 'o2', organizationName: 'Globex' } })
        );

        expect(fieldsOf(form.sections).map(({ key }) => key)).toEqual(['name', 'userIds', 'extraRoleIds']);
        expect(form.initialValue).toEqual({ main: { extraRoleIds: ['r1'], name: 'Sales', userIds: ['u1'] } });
    });

    it('searches the members by the text typed, labelled "name (email)" or the email, leaving out those chosen', () => {
        const options = buildEditOptions();
        const [, members] = fieldsOf(service.buildEditFormConfig(options).sections);

        expect(search(members, 'example', ['u1']).options).toEqual([{ label: 'grace@example.test', value: 'u2' }]);
        expect(options.searchMembers).toHaveBeenCalledWith('example', 21);
    });

    it('searches the extra roles by their name, leaving out those chosen', () => {
        const options = buildEditOptions();
        const extraRoles = fieldsOf(service.buildEditFormConfig(options).sections)[2];

        expect(search(extraRoles, '', [])).toEqual({
            hasMore: false,
            options: [
                { label: 'Reviewers', value: 'r1' },
                { label: 'Writers', value: 'r2' }
            ]
        });
        expect(options.searchExtraRoles).toHaveBeenCalledWith('', 20);
    });

    it('asks for at most 50 and offers at most 20, however many are chosen', () => {
        const options = buildEditOptions({ searchMembers: jest.fn(() => of(buildPeople(50))) });
        const [, members] = fieldsOf(service.buildEditFormConfig(options).sections);
        const chosen = Array.from({ length: 40 }, (_, index) => `c${index}`);

        expect(search(members, 'user', chosen).options).toHaveLength(20);
        expect(options.searchMembers).toHaveBeenCalledWith('user', 50);
    });

    it('says there are more matches when the server answers as many as it was asked for', () => {
        const options = buildEditOptions({ searchMembers: jest.fn(() => of(buildPeople(21))) });
        const [, members] = fieldsOf(service.buildEditFormConfig(options).sections);

        expect(search(members, 'user', ['p0']).hasMore).toBe(true);
        expect(options.searchMembers).toHaveBeenCalledWith('user', 21);
    });

    it('says there are more matches when more than 20 are left once those chosen are left out', () => {
        const options = buildEditOptions({ searchMembers: jest.fn(() => of(buildPeople(22))) });
        const [, members] = fieldsOf(service.buildEditFormConfig(options).sections);

        const { hasMore, options: suggested } = search(members, 'user', ['c1', 'c2', 'c3']);

        expect(hasMore).toBe(true);
        expect(suggested).toHaveLength(20);
        expect(options.searchMembers).toHaveBeenCalledWith('user', 23);
    });

    it('says nothing more when the server answers fewer than asked for and all of them show', () => {
        const [, members] = fieldsOf(service.buildEditFormConfig(buildEditOptions()).sections);

        expect(search(members, 'example', ['u1']).hasMore).toBe(false);
    });

    it('starts both lists empty, with their empty texts, when the group has neither members nor extra roles', () => {
        const form = service.buildEditFormConfig(
            buildEditOptions({ detail: { ...detail, extraRoles: [], members: [] } })
        );
        const [, members, extraRoles] = fieldsOf(form.sections);

        expect((members as FormListField).options).toEqual([]);
        expect((extraRoles as FormListField).options).toEqual([]);
        expect(form.initialValue).toEqual({ main: { extraRoleIds: [], name: 'Sales', userIds: [] } });
    });

    it('shows the members and the extra roles as lists to search, pick into and remove from', async () => {
        const fixture = await renderInEnglish(
            service.buildEditFormConfig(
                buildEditOptions({
                    detail: { ...detail, extraRoles: [] },
                    prefix: 'angular-components.groups'
                })
            )
        );
        const members = controlByName(fixture, 'Members');

        expect(fixture.nativeElement.textContent).toContain('This group has no additional roles yet.');

        members.dispatchEvent(new Event('focus'));
        await settle(fixture);
        queryAll(document.body, '[role="option"]')[0].dispatchEvent(new MouseEvent('mousedown'));
        await settle(fixture);
        buttonByName(fixture, 'Remove Ada Lovelace (ada@example.test)').click();
        await settle(fixture);

        expect(members.getAttribute('placeholder')).toBe('Search a person by name or email');
        expect(members.value).toBe('');
        expect(textsOf(queryAll(fixture, 'li'))).toEqual(['grace@example.test']);
        expect(buttonByName(fixture, 'angular-components.page.form.submit').disabled).toBe(false);

        fixture.destroy();
    });

    describe('buildViewConfig', () => {
        const view = {
            id: 'g1',
            members: [
                { email: 'ada@example.test', id: 'u1', name: 'Ada', surname: 'Lovelace' },
                { email: 'grace@example.test', id: 'u2', name: null, surname: null }
            ],
            name: 'Sales'
        };

        it('shows the name and the members of a group to read, closed with its only button', () => {
            const form = service.buildViewConfig({ group: view, onRoleClick: jest.fn(), prefix: 'demo.teams' });
            const [name, members, ...rest] = fieldsOf(form.sections);

            expect(form.title).toBe('demo.teams.view.title');
            expect(form.isSubmitHidden).toBe(true);
            expect(form.cancelLabel).toBe('demo.teams.view.buttons.close');
            expect(name).toMatchObject({ items: [{ label: 'Sales' }], key: 'name' });
            expect(members).toMatchObject({
                emptyKey: 'demo.teams.view.main.members.empty',
                items: ['Ada Lovelace (ada@example.test)', 'grace@example.test']
            });
            expect(rest).toEqual([]);
        });

        it('lists the roles the group gives when they came, each opening its permissions', () => {
            const onRoleClick = jest.fn();
            const role = { id: 'r1', name: 'Reviewers', permissions: ['templates.edit'] };
            const form = service.buildViewConfig({
                group: { ...view, extraRoles: [role] },
                onRoleClick,
                prefix: 'demo.teams'
            });
            const roles = fieldsOf(form.sections).at(-1) as FormListField;

            roles.onItemClick?.('Reviewers', 0);

            expect(roles).toMatchObject({ emptyKey: 'demo.teams.view.main.extra-roles.empty', items: ['Reviewers'] });
            expect(onRoleClick).toHaveBeenCalledWith(role);
        });
    });
});
