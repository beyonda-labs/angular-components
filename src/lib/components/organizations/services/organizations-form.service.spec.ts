import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { ModalFormSize } from '../../form/components/modal/models/modal-form.model';
import { FormListField } from '../../form/models/fields/form-list-field.model';
import { FormSelectField } from '../../form/models/fields/form-select-field.model';
import { FormSection } from '../../form/models/form.model';
import { FormField } from '../../form/models/form-field.model';
import { FormFieldValidatorType } from '../../form/models/form-field-validator.model';
import { OrganizationDetail, OrganizationStatus } from '../models/organizations.model';
import { OrganizationsFormService } from './organizations-form.service';

describe('OrganizationsFormService', () => {
    let service: OrganizationsFormService;

    const organization: OrganizationDetail = {
        actions: ['edit'],
        createdAt: 0,
        groups: [
            {
                id: 'g1',
                members: [
                    { email: 'ada@example.test', id: 'u1', name: 'Ada Lovelace' },
                    { email: 'grace@example.test', id: 'u2', name: 'grace@example.test' }
                ],
                name: 'Sales'
            },
            { id: 'g2', members: [], name: 'Support' }
        ],
        id: 'o2',
        name: 'Globex',
        status: OrganizationStatus.Inactive,
        userCount: 3
    };

    function fieldsOf(sections: FormSection[], key: string): FormField[] {
        return sections
            .filter(section => section.key === key)
            .flatMap(section => section.rows.flatMap(row => row.fields));
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideRouter([]), provideBeyTesting()] });

        service = TestBed.inject(OrganizationsFormService);
    });

    it('asks for a required name of at most 100 characters to create an organization', () => {
        const form = service.buildFormConfig('demo.tenants');
        const [name] = fieldsOf(form.buildSections(), 'main');

        expect(form.prefix).toBe('demo.tenants.form');
        expect(name).toMatchObject({ isRequired: true, key: 'name' });
        expect(name.validators).toEqual([
            expect.objectContaining({ args: 100, type: FormFieldValidatorType.MaxLength })
        ]);
        expect(form.toFormValue()).toBeUndefined();
    });

    it('sends the name trimmed', () => {
        expect(service.buildFormConfig('demo').toItem({ main: { name: '  Initech ' } })).toEqual({ name: 'Initech' });
    });

    it('edits the name and the status of an organization, filled in with the current ones', () => {
        const form = service.buildEditFormConfig('demo.tenants', organization);
        const [name, status] = fieldsOf(form.sections, 'main');

        expect(form.title).toBe('demo.tenants.form.edit.title');
        expect(form.prefix).toBe('demo.tenants.form');
        expect(form.size).toBe(ModalFormSize.Medium);
        expect(name).toMatchObject({ isRequired: true, key: 'name' });
        expect(status).toMatchObject({ isRequired: true, key: 'status' });
        expect((status as FormSelectField).options).toEqual([
            { label: 'demo.tenants.status.active', value: 'active' },
            { label: 'demo.tenants.status.inactive', value: 'inactive' }
        ]);
        expect(form.initialValue).toEqual({ main: { name: 'Globex', status: 'inactive' } });
    });

    it('shows each group of the organization with its members, read-only, under a titled section', () => {
        const form = service.buildEditFormConfig('demo.tenants', organization);
        const groups = fieldsOf(form.sections, 'groups') as FormListField[];

        expect(form.sections.find(({ key }) => key === 'groups')?.isTitleVisible).toBe(true);
        expect(groups.map(({ items, label, placeholder }) => [label, items, placeholder])).toEqual([
            ['Sales', ['Ada Lovelace (ada@example.test)', 'grace@example.test'], 'demo.tenants.form.groups.no-members'],
            ['Support', [], 'demo.tenants.form.groups.no-members']
        ]);
    });

    it('says when the organization has no groups yet', () => {
        const [empty, ...rest] = fieldsOf(
            service.buildEditFormConfig('demo.tenants', { ...organization, groups: [] }).sections,
            'groups'
        ) as FormListField[];

        expect(empty).toMatchObject({
            isLabelVisible: false,
            items: [],
            placeholder: 'demo.tenants.form.groups.empty'
        });
        expect(rest).toEqual([]);
    });
});
