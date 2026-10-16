import { TestBed } from '@angular/core/testing';
import { faRectangleList, faUser } from '@fortawesome/free-regular-svg-icons';
import { fieldsOf } from '@testing/form-fields';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { FormCheckboxSectionsField } from '../../form/models/fields/form-checkbox-sections-field.model';
import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { FormButtonType, FormSection } from '../../form/models/form.model';
import { RolePermissionEntry, RoleViewOptions, ViewedRole } from '../models/role-permissions.model';
import { RoleViewFormService } from './role-view-form.service';

describe('RoleViewFormService', () => {
    let service: RoleViewFormService;

    const permissions: RolePermissionEntry[] = [
        { group: 'templates', key: 'templates.edit' },
        { group: 'documents', key: 'documents.read' },
        { group: 'templates', key: 'templates.publish' }
    ];
    const reviewers: ViewedRole = {
        description: 'Review the templates',
        isBase: false,
        name: 'Reviewers',
        permissions: ['templates.edit']
    };

    function buildOptions(overrides: Partial<RoleViewOptions> = {}): RoleViewOptions {
        return {
            actionOrder: [],
            groupIcons: {},
            groupOrder: [],
            permissionPrefix: 'demo.permissions',
            permissions,
            prefix: 'demo.roles',
            rolePrefix: 'demo.roles',
            ...overrides
        };
    }

    function checklistOf(sections: FormSection[]): FormCheckboxSectionsField {
        const [checklist] = fieldsOf(sections, 'permissions');

        return checklist as FormCheckboxSectionsField;
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideBeyTesting({
                    translations: { en: { demo: { roles: { adminuser: 'Administrator' } } } }
                })
            ]
        });

        service = TestBed.inject(RoleViewFormService);
    });

    it('shows a role read-only, labelled from the role prefix, with the same checklist disabled', () => {
        const view = service.buildViewConfig(buildOptions(), {
            isBase: true,
            name: 'adminuser',
            permissions: ['templates.edit', 'users.read']
        });
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
            ['templates', faRectangleList],
            ['documents', faRectangleList],
            ['users', faUser]
        ]);
        expect(view.initialValue?.permissions).toEqual({ permissions: ['templates.edit', 'users.read'] });
        expect(view.buttons.filter(({ isHidden }) => !isHidden).map(({ label, type }) => [label, type])).toEqual([
            ['demo.roles.view.buttons.close', FormButtonType.Cancel]
        ]);
    });

    it('orders the sections by groupOrder and their permissions by actionOrder', () => {
        const view = service.buildViewConfig(buildOptions({ actionOrder: ['publish'], groupOrder: ['users'] }), {
            ...reviewers,
            permissions: ['templates.edit', 'users.read']
        });

        expect(
            checklistOf(view.sections).sections.map(({ key, options }) => [key, options.map(({ value }) => value)])
        ).toEqual([
            ['users', ['users.read']],
            ['templates', ['templates.publish', 'templates.edit']],
            ['documents', ['documents.read']]
        ]);
    });

    it('shows only the permissions a role holds when there is no list to show them in', () => {
        const view = service.buildViewConfig(buildOptions({ permissions: [] }), reviewers);

        expect(
            checklistOf(view.sections).sections.map(({ key, options }) => [key, options.map(({ value }) => value)])
        ).toEqual([['templates', ['templates.edit']]]);
    });

    it('shows the description of a role it views when the role has one', () => {
        const view = service.buildViewConfig(buildOptions(), reviewers);

        expect((fieldsOf(view.sections, 'main') as FormInfoField[]).map(({ items, key }) => [key, items])).toEqual([
            ['name', [{ label: 'Reviewers' }]],
            ['description', [{ label: 'Review the templates' }]]
        ]);
    });

    it('says a role it views gives no permissions when there is none to show', () => {
        const view = service.buildViewConfig(buildOptions({ permissions: [] }), { ...reviewers, permissions: [] });
        const [empty] = fieldsOf(view.sections, 'permissions');

        expect((empty as FormInfoField).items).toEqual([{ label: 'demo.roles.view.permissions.empty' }]);
    });
});
