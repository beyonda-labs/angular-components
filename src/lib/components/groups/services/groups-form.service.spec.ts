import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { ModalFormSize } from '../../form/components/modal/models/modal-form.model';
import { FormCheckboxGroupField } from '../../form/models/fields/form-checkbox-group-field.model';
import { FormSection } from '../../form/models/form.model';
import { FormField } from '../../form/models/form-field.model';
import { FormFieldValidatorType } from '../../form/models/form-field-validator.model';
import { GroupDetail, GroupEditOptions, GroupMember, GroupsFormOptions } from '../models/groups.model';
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
            memberOptions: [ada, grace],
            prefix: 'demo.teams',
            roleOptions: [reviewers, writers],
            ...overrides
        };
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
        expect(members.key).toBe('userIds');
        expect((members as FormCheckboxGroupField).options).toEqual([
            { label: 'Ada Lovelace (ada@example.test)', value: 'u1' },
            { label: 'grace@example.test', value: 'u2' }
        ]);
        expect(members.hint).toBeUndefined();
        expect(extraRoles.key).toBe('extraRoleIds');
        expect((extraRoles as FormCheckboxGroupField).options).toEqual([
            { label: 'Reviewers', value: 'r1' },
            { label: 'Writers', value: 'r2' }
        ]);
        expect(form.initialValue).toEqual({ main: { extraRoleIds: ['r1'], name: 'Sales', userIds: ['u1'] } });
    });

    it('still offers a member or an extra role the options leave out, so it can be unchecked', () => {
        const form = service.buildEditFormConfig(buildEditOptions({ memberOptions: [grace], roleOptions: [writers] }));
        const [, members, extraRoles] = fieldsOf(form.sections);

        expect((members as FormCheckboxGroupField).options).toEqual([
            { label: 'grace@example.test', value: 'u2' },
            { label: 'Ada Lovelace (ada@example.test)', value: 'u1' }
        ]);
        expect((extraRoles as FormCheckboxGroupField).options).toEqual([
            { label: 'Writers', value: 'r2' },
            { label: 'Reviewers', value: 'r1' }
        ]);
    });

    it('says there is nobody to offer, and offers no extra roles, when the organization has none', () => {
        const form = service.buildEditFormConfig(
            buildEditOptions({
                detail: { ...detail, extraRoles: [], members: [] },
                memberOptions: [],
                roleOptions: []
            })
        );
        const [, members, ...rest] = fieldsOf(form.sections);

        expect(members.hint).toBe('demo.teams.form.main.user-ids.empty');
        expect(rest).toEqual([]);
        expect(form.initialValue).toEqual({ main: { name: 'Sales', userIds: [] } });
    });
});
