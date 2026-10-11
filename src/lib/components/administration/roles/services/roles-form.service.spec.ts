import { TestBed } from '@angular/core/testing';
import { faFileLines, faRectangleList, faUser } from '@fortawesome/free-regular-svg-icons';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { FormCheckboxSectionsField } from '../../../form/models/fields/form-checkbox-sections-field.model';
import { FormInfoField } from '../../../form/models/fields/form-info-field.model';
import { FormButtonType, FormSection } from '../../../form/models/form.model';
import { FormField } from '../../../form/models/form-field.model';
import { FormFieldValidatorType } from '../../../form/models/form-field-validator.model';
import { RolePermissionEntry, RoleRow, RolesFormOptions, RolesViewOptions } from '../models/roles.model';
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

    function buildOptions(overrides: Partial<RolesFormOptions> = {}): RolesFormOptions {
        return {
            groupIcons: { templates: faFileLines },
            isOrganizationAsked: false,
            organizations: [],
            permissionPrefix: 'demo.permissions',
            permissions,
            prefix: 'demo.roles',
            ...overrides
        };
    }

    function buildViewOptions(overrides: Partial<RolesViewOptions> = {}): RolesViewOptions {
        return {
            groupIcons: {},
            permissionPrefix: 'demo.permissions',
            permissions,
            prefix: 'demo.roles',
            rolePrefix: 'demo.roles',
            ...overrides
        };
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
                                roles: { adminuser: 'Administrator' }
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
                icon: faRectangleList,
                key: 'documents',
                label: 'Documents',
                options: [{ description: undefined, label: 'Read', value: 'documents.read' }]
            },
            {
                icon: faFileLines,
                key: 'templates',
                label: 'Templates',
                options: [
                    { description: 'Can change the templates.', label: 'Edit templates', value: 'templates.edit' },
                    { description: undefined, label: 'Publish', value: 'templates.publish' }
                ]
            }
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
            'audit',
            'documents',
            'templates'
        ]);
        expect(form.toFormValue(role)?.permissions).toEqual({ permissions: ['audit.read', 'templates.edit'] });
    });

    it('says there is nothing to give when the caller can give no permission', () => {
        const [empty] = fieldsOf(
            service.buildFormConfig(buildOptions({ permissions: [] })).buildSections(),
            'permissions'
        );

        expect(empty).toMatchObject({ label: 'demo.roles.form.permissions.label' });
        expect((empty as FormInfoField).items).toEqual([{ label: 'demo.roles.form.permissions.empty' }]);
    });

    it('asks a superadmin for the organization to create in, required, but not to edit', () => {
        const organizations = [
            { id: 'o1', name: 'Acme' },
            { id: 'o2', name: 'Globex' }
        ];
        const form = service.buildFormConfig(buildOptions({ isOrganizationAsked: true, organizations }));

        expect(fieldsOf(form.buildSections(), 'main').at(-1)).toMatchObject({
            isRequired: true,
            key: 'organizationId',
            options: [
                { label: 'Acme', value: 'o1' },
                { label: 'Globex', value: 'o2' }
            ]
        });
        expect(form.toFormValue()).toBeUndefined();
        expect(fieldsOf(form.buildSections(reviewers), 'main').map(({ key }) => key)).toEqual(['name', 'description']);
        expect(
            form.toItem({
                main: { name: 'Reviewers', organizationId: 'o2' },
                permissions: { permissions: ['documents.read'] }
            })
        ).toEqual({ description: '', name: 'Reviewers', organizationId: 'o2', permissions: ['documents.read'] });
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

    it('shows a role read-only, labelled from the role prefix, with the same checklist disabled', () => {
        const adminuser: RoleRow = {
            actions: [],
            id: 'adminuser',
            isBase: true,
            memberCount: 1,
            name: 'adminuser',
            permissions: ['templates.edit', 'users.read']
        };
        const view = service.buildViewConfig(buildViewOptions(), adminuser);
        const checklist = checklistOf(view.sections);

        expect(view.title).toBe('demo.roles.view.title');
        expect((fieldsOf(view.sections, 'main') as FormInfoField[]).map(({ items }) => items)).toEqual([
            [{ label: 'Administrator' }]
        ]);
        expect(checklist).toMatchObject({
            isDisabled: true,
            isRequired: false,
            label: 'demo.roles.view.permissions.label'
        });
        expect(checklist.sections.map(({ icon, key }) => [key, icon])).toEqual([
            ['documents', faRectangleList],
            ['templates', faRectangleList],
            ['users', faUser]
        ]);
        expect(view.initialValue?.permissions).toEqual({ permissions: ['templates.edit', 'users.read'] });
        expect(view.buttons.filter(({ isHidden }) => !isHidden).map(({ label, type }) => [label, type])).toEqual([
            ['demo.roles.view.buttons.close', FormButtonType.Cancel]
        ]);
    });

    it('shows the description of a role it views when the role has one', () => {
        const view = service.buildViewConfig(buildViewOptions(), reviewers);

        expect((fieldsOf(view.sections, 'main') as FormInfoField[]).map(({ items, key }) => [key, items])).toEqual([
            ['name', [{ label: 'Reviewers' }]],
            ['description', [{ label: 'Review the templates' }]]
        ]);
    });

    it('says a role it views gives no permissions when there is none to show', () => {
        const view = service.buildViewConfig(buildViewOptions({ permissions: [] }), { ...reviewers, permissions: [] });
        const [empty] = fieldsOf(view.sections, 'permissions');

        expect((empty as FormInfoField).items).toEqual([{ label: 'demo.roles.view.permissions.empty' }]);
    });
});
