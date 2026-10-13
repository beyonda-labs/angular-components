import { TestBed } from '@angular/core/testing';
import { faFileLines, faRectangleList } from '@fortawesome/free-regular-svg-icons';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { FormCheckboxSectionsField } from '../../../form/models/fields/form-checkbox-sections-field.model';
import { FormInfoField } from '../../../form/models/fields/form-info-field.model';
import { FormSection } from '../../../form/models/form.model';
import { FormField } from '../../../form/models/form-field.model';
import { FormFieldValidatorType } from '../../../form/models/form-field-validator.model';
import { RolePermissionEntry } from '../../models/role-permissions.model';
import { RoleRow, RolesDuplicateFormOptions, RolesFormOptions } from '../models/roles.model';
import { RolesFormService } from './roles-form.service';

describe('RolesFormService', () => {
    let service: RolesFormService;

    const permissions: RolePermissionEntry[] = [
        { group: 'templates', key: 'templates.edit' },
        { group: 'documents', key: 'documents.read' },
        { group: 'templates', key: 'templates.publish' }
    ];
    const reviewers: RoleRow = {
        actions: ['edit', 'delete'],
        description: 'Review the templates',
        groupCount: 1,
        id: 'r1',
        isBase: false,
        memberCount: 2,
        name: 'Reviewers',
        permissions: ['templates.edit']
    };
    const organizations = [
        { id: 'o1', name: 'Acme' },
        { id: 'o2', name: 'Globex' }
    ];

    function buildOptions(overrides: Partial<RolesFormOptions> = {}): RolesFormOptions {
        return {
            actionOrder: [],
            groupIcons: { templates: faFileLines },
            groupOrder: [],
            isOrganizationAsked: false,
            organizations: [],
            permissionPrefix: 'demo.permissions',
            permissions,
            prefix: 'demo.roles',
            ...overrides
        };
    }

    function buildDuplicateOptions(overrides: Partial<RolesDuplicateFormOptions> = {}): RolesDuplicateFormOptions {
        return { ...buildOptions(), rolePrefix: 'demo.roles', ...overrides };
    }

    function fieldsOf(sections: FormSection[], key: string): FormField[] {
        return sections
            .filter(section => section.key === key)
            .flatMap(section => section.rows.flatMap(row => row.fields));
    }

    function checklistOf(sections: FormSection[]): FormCheckboxSectionsField {
        const [checklist] = fieldsOf(sections, 'permissions');

        return checklist as FormCheckboxSectionsField;
    }

    function optionsBySection(sections: FormSection[]): [string, string[]][] {
        return checklistOf(sections).sections.map(({ key, options }) => [key, options.map(({ value }) => value)]);
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideBeyTesting({
                    translations: {
                        en: {
                            demo: {
                                permissions: {
                                    templates: {
                                        edit: { description: 'Can change the templates.', label: 'Edit templates' },
                                        label: 'Templates'
                                    }
                                },
                                roles: { adminuser: 'Administrator', duplicate: { 'copy-suffix': '(copy)' } }
                            }
                        }
                    }
                })
            ]
        });

        service = TestBed.inject(RolesFormService);
    });

    it('asks for a required name of at most 60 characters and a description, filled in with the current ones', () => {
        const form = service.buildFormConfig(buildOptions());
        const [name, description, ...rest] = fieldsOf(form.buildSections(), 'main');

        expect(form.prefix).toBe('demo.roles.form');
        expect(name).toMatchObject({ isRequired: true, key: 'name' });
        expect(name.validators).toEqual([
            expect.objectContaining({ args: 60, type: FormFieldValidatorType.MaxLength })
        ]);
        expect(description).toMatchObject({ isRequired: false, key: 'description' });
        expect(rest).toEqual([]);
        expect(form.toFormValue()).toBeUndefined();
        expect(form.toFormValue(reviewers)).toEqual({
            main: { description: 'Review the templates', name: 'Reviewers' },
            permissions: { permissions: ['templates.edit'] }
        });
    });

    it('offers the permissions in one required checklist, a section per group, labelled and described from the prefix', () => {
        const checklist = checklistOf(service.buildFormConfig(buildOptions()).buildSections());

        expect(checklist).toMatchObject({
            isDisabled: false,
            isRequired: true,
            key: 'permissions',
            label: 'demo.roles.form.permissions.label'
        });
        expect(checklist.sections).toEqual([
            {
                icon: faFileLines,
                key: 'templates',
                label: 'Templates',
                options: [
                    { description: 'Can change the templates.', label: 'Edit templates', value: 'templates.edit' },
                    { description: undefined, label: 'Publish', value: 'templates.publish' }
                ]
            },
            {
                icon: faRectangleList,
                key: 'documents',
                label: 'Documents',
                options: [{ description: undefined, label: 'Read', value: 'documents.read' }]
            }
        ]);
    });

    it('orders the sections of the form by groupOrder and their permissions by actionOrder', () => {
        const order = { actionOrder: ['publish'], groupOrder: ['users', 'documents'] };
        const form = service.buildFormConfig(buildOptions(order));

        expect(optionsBySection(form.buildSections())).toEqual([
            ['documents', ['documents.read']],
            ['templates', ['templates.publish', 'templates.edit']]
        ]);
    });

    it('sends the name and the description trimmed and every permission checked, once each', () => {
        const form = service.buildFormConfig(buildOptions());

        expect(
            form.toItem({
                main: { description: '  Review  ', name: ' Reviewers ' },
                permissions: { permissions: ['documents.read', 'templates.edit', 'documents.read'] }
            })
        ).toEqual({
            description: 'Review',
            name: 'Reviewers',
            permissions: ['documents.read', 'templates.edit']
        });
    });

    it('still offers a permission the role holds that the caller cannot give, so it can be unchecked', () => {
        const form = service.buildFormConfig(buildOptions());
        const role = { ...reviewers, permissions: ['templates.edit', 'audit.read'] };

        expect(checklistOf(form.buildSections(role)).sections.map(({ key }) => key)).toEqual([
            'templates',
            'documents',
            'audit'
        ]);
        expect(form.toFormValue(role)?.permissions).toEqual({ permissions: ['templates.edit', 'audit.read'] });
    });

    it('says there is nothing to give when the caller can give no permission', () => {
        const [empty] = fieldsOf(
            service.buildFormConfig(buildOptions({ permissions: [] })).buildSections(),
            'permissions'
        );

        expect(empty).toMatchObject({ label: 'demo.roles.form.permissions.label' });
        expect((empty as FormInfoField).items).toEqual([{ label: 'demo.roles.form.permissions.empty' }]);
    });

    it('asks a superadmin for the organization to create in, required', () => {
        const form = service.buildFormConfig(buildOptions({ isOrganizationAsked: true, organizations }));

        expect(fieldsOf(form.buildSections(), 'main').at(-1)).toMatchObject({
            isDisabled: false,
            isRequired: true,
            key: 'organizationId',
            options: [
                { label: 'Acme', value: 'o1' },
                { label: 'Globex', value: 'o2' }
            ]
        });
        expect(form.toFormValue()).toBeUndefined();
        expect(
            form.toItem({
                main: { name: 'Reviewers', organizationId: 'o2' },
                permissions: { permissions: ['documents.read'] }
            })
        ).toEqual({ description: '', name: 'Reviewers', organizationId: 'o2', permissions: ['documents.read'] });
    });

    it('shows a superadmin the organization of the role it edits, disabled, and never sends it', () => {
        const form = service.buildFormConfig(buildOptions({ isOrganizationAsked: true, organizations }));
        const role = { ...reviewers, organizationId: 'o2', organizationName: 'Globex' };

        expect(fieldsOf(form.buildSections(role), 'main').map(({ isDisabled, key }) => [key, isDisabled])).toEqual([
            ['name', false],
            ['description', false],
            ['organizationId', true]
        ]);
        expect(fieldsOf(form.buildSections(role), 'main').at(-1)).toMatchObject({
            options: [{ label: 'Globex', value: 'o2' }]
        });
        expect(form.toFormValue(role)?.main).toEqual({
            description: 'Review the templates',
            name: 'Reviewers',
            organizationId: 'o2'
        });
        expect(
            form.toItem({ main: { name: 'Reviewers', organizationId: 'o2' }, permissions: { permissions: [] } }, role)
        ).toEqual({ description: '', name: 'Reviewers', permissions: [] });
    });

    it('shows a manager no organization of the role it edits', () => {
        const form = service.buildFormConfig(buildOptions());
        const role = { ...reviewers, organizationId: 'o2', organizationName: 'Globex' };

        expect(fieldsOf(form.buildSections(role), 'main').map(({ key }) => key)).toEqual(['name', 'description']);
        expect(form.toFormValue(role)?.main).toEqual({ description: 'Review the templates', name: 'Reviewers' });
    });

    it('duplicates a role in the create form, filled in with its name and the copy suffix, its description and permissions', () => {
        const form = service.buildDuplicateConfig(buildDuplicateOptions(), reviewers);

        expect(form.title).toBe('demo.roles.duplicate.title');
        expect(form.prefix).toBe('demo.roles.form');
        expect(form.allowSubmitWithoutChanges).toBe(true);
        expect(form.buttons.map(({ label }) => label)).toEqual([
            'angular-components.page.form.cancel',
            'demo.roles.duplicate.buttons.submit'
        ]);
        expect(fieldsOf(form.sections, 'main').map(({ key }) => key)).toEqual(['name', 'description']);
        expect(optionsBySection(form.sections)).toEqual([
            ['templates', ['templates.edit', 'templates.publish']],
            ['documents', ['documents.read']]
        ]);
        expect(form.initialValue).toEqual({
            main: { description: 'Review the templates', name: 'Reviewers (copy)' },
            permissions: { permissions: ['templates.edit'] }
        });
    });

    it('duplicates a base role under its translated name, dropping the permissions no extra role can hold', () => {
        const adminuser: RoleRow = {
            actions: ['duplicate'],
            id: 'adminuser',
            isBase: true,
            memberCount: 1,
            name: 'adminuser',
            permissions: ['users.read', 'templates.publish', 'roles.manage', 'documents.read']
        };
        const form = service.buildDuplicateConfig(buildDuplicateOptions(), adminuser);

        expect(form.initialValue).toEqual({
            main: { description: '', name: 'Administrator (copy)' },
            permissions: { permissions: ['templates.publish', 'documents.read'] }
        });
        expect(checklistOf(form.sections).sections.map(({ key }) => key)).toEqual(['templates', 'documents']);
    });

    it('cuts the name of the copy so it fits the 60 characters of a name', () => {
        const form = service.buildDuplicateConfig(buildDuplicateOptions(), { ...reviewers, name: 'R'.repeat(60) });

        expect(form.initialValue?.main.name).toBe(`${'R'.repeat(53)} (copy)`);
    });

    it('duplicates an extra role for a superadmin in its own organization, in the required select of the create form', () => {
        const form = service.buildDuplicateConfig(buildDuplicateOptions({ isOrganizationAsked: true, organizations }), {
            ...reviewers,
            organizationId: 'o2',
            organizationName: 'Globex'
        });

        expect(fieldsOf(form.sections, 'main').at(-1)).toMatchObject({
            isDisabled: false,
            isRequired: true,
            key: 'organizationId',
            options: [
                { label: 'Acme', value: 'o1' },
                { label: 'Globex', value: 'o2' }
            ]
        });
        expect(form.initialValue?.main.organizationId).toBe('o2');
    });

    it.each([
        ['chooses none among several', organizations, undefined],
        ['chooses the only one', [{ id: 'o2', name: 'Globex' }], 'o2']
    ])('duplicates a base role for a superadmin as it creates one: %s', (_, active, chosen) => {
        const base = { ...reviewers, isBase: true, organizationId: null, organizationName: null };
        const form = service.buildDuplicateConfig(
            buildDuplicateOptions({ isOrganizationAsked: true, organizations: active }),
            base
        );

        expect(form.initialValue?.main.organizationId).toBe(chosen);
    });

    it('chooses the organization already when only one is active', () => {
        const form = service.buildFormConfig(
            buildOptions({ isOrganizationAsked: true, organizations: [{ id: 'o2', name: 'Globex' }] })
        );

        expect(form.toFormValue()).toEqual({
            main: { description: '', name: '', organizationId: 'o2' },
            permissions: { permissions: [] }
        });
    });

    it('chooses the organization of the folder it opens in', () => {
        const form = service.buildFormConfig(buildOptions({ isOrganizationAsked: true, organizations }));

        expect(form.toFormValue(undefined, { id: 'o1', label: 'Acme' })?.main.organizationId).toBe('o1');
    });
});
