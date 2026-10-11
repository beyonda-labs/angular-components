import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { FormCheckboxGroupField } from '../../form/models/fields/form-checkbox-group-field.model';
import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { FormSection } from '../../form/models/form.model';
import { FormField } from '../../form/models/form-field.model';
import { FormFieldValidatorType } from '../../form/models/form-field-validator.model';
import { GroupMember, GroupRow, GroupsFormOptions } from '../models/groups.model';
import { GroupsFormService } from './groups-form.service';

describe('GroupsFormService', () => {
    let service: GroupsFormService;

    const ada: GroupMember = { email: 'ada@example.test', id: 'u1', name: 'Ada Lovelace' };
    const grace: GroupMember = { email: 'grace@example.test', id: 'u2', name: 'grace@example.test' };
    const group: GroupRow = { actions: ['edit'], createdAt: 0, id: 'g1', memberCount: 1, name: 'Sales' };
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

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });

        service = TestBed.inject(GroupsFormService);
    });

    it('asks for a required name of at most 100 characters, filled in with the current one to rename', () => {
        const form = service.buildFormConfig(buildOptions());
        const [name, ...rest] = fieldsOf(form.buildSections());

        expect(form.prefix).toBe('demo.teams.form');
        expect(name).toMatchObject({ isRequired: true, key: 'name' });
        expect(name.validators).toEqual([
            expect.objectContaining({ args: 100, type: FormFieldValidatorType.MaxLength })
        ]);
        expect(rest).toEqual([]);
        expect(form.toFormValue()).toBeUndefined();
        expect(form.toFormValue(group)).toEqual({ main: { name: 'Sales' } });
    });

    it('sends the name trimmed, with no organization when none is asked', () => {
        expect(service.buildFormConfig(buildOptions()).toItem({ main: { name: '  Sales ' } })).toEqual({
            name: 'Sales'
        });
    });

    it('asks a superadmin for the organization to create in, required, but not to rename', () => {
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
        expect(fieldsOf(form.buildSections(group)).map(field => field.key)).toEqual(['name']);
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

    it('offers the users of the organization labelled with their email, the members checked, under the group', () => {
        const form = service.buildMembersFormConfig('demo.teams', group, [ada, grace], [ada]);
        const [info, members] = fieldsOf(form.sections);

        expect(form.prefix).toBe('demo.teams.members');
        expect(form.title).toBe('demo.teams.members.title');
        expect((info as FormInfoField).items).toEqual([{ label: 'Sales' }]);
        expect(members.key).toBe('userIds');
        expect((members as FormCheckboxGroupField).options).toEqual([
            { label: 'Ada Lovelace (ada@example.test)', value: 'u1' },
            { label: 'grace@example.test', value: 'u2' }
        ]);
        expect(members.hint).toBeUndefined();
        expect(form.initialValue).toEqual({ main: { userIds: ['u1'] } });
    });

    it('still offers a member the options leave out, so it can be unchecked', () => {
        const form = service.buildMembersFormConfig('demo.teams', group, [ada], [grace]);
        const [, members] = fieldsOf(form.sections);

        expect((members as FormCheckboxGroupField).options).toEqual([
            { label: 'Ada Lovelace (ada@example.test)', value: 'u1' },
            { label: 'grace@example.test', value: 'u2' }
        ]);
    });

    it('says there is nobody to offer when the organization has no users', () => {
        const [, members] = fieldsOf(service.buildMembersFormConfig('demo.teams', group, [], []).sections);

        expect(members.hint).toBe('demo.teams.members.main.user-ids.empty');
    });
});
