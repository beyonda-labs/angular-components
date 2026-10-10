import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { FormSelectField } from '../../form/models/fields/form-select-field.model';
import { FormSection } from '../../form/models/form.model';
import { FormField } from '../../form/models/form-field.model';
import { FormFieldValidatorType } from '../../form/models/form-field-validator.model';
import { OrganizationRow, OrganizationStatus } from '../models/organizations.model';
import { OrganizationsFormService } from './organizations-form.service';

describe('OrganizationsFormService', () => {
    let service: OrganizationsFormService;

    const organization: OrganizationRow = {
        actions: ['edit'],
        createdAt: 0,
        id: 'o2',
        name: 'Globex',
        status: OrganizationStatus.Active,
        userCount: 3
    };

    function fieldsOf(sections: FormSection[]): FormField[] {
        return sections.flatMap(section => section.rows.flatMap(row => row.fields));
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideRouter([]), provideBeyTesting()] });

        service = TestBed.inject(OrganizationsFormService);
    });

    it('asks for a required name of at most 100 characters, filled in with the current one to rename', () => {
        const form = service.buildFormConfig('demo.tenants');
        const [name] = fieldsOf(form.buildSections());

        expect(form.prefix).toBe('demo.tenants.form');
        expect(name).toMatchObject({ isRequired: true, key: 'name' });
        expect(name.validators).toEqual([
            expect.objectContaining({ args: 100, type: FormFieldValidatorType.MaxLength })
        ]);
        expect(form.toFormValue()).toBeUndefined();
        expect(form.toFormValue(organization)).toEqual({ main: { name: 'Globex' } });
    });

    it('sends the name trimmed', () => {
        expect(service.buildFormConfig('demo').toItem({ main: { name: '  Initech ' } })).toEqual({ name: 'Initech' });
    });

    it('asks for the email, the names and the language of the admin, under the name of the organization', () => {
        const form = service.buildInviteAdminFormConfig('demo.tenants', organization);
        const fields = fieldsOf(form.sections);

        expect(form.prefix).toBe('demo.tenants.invite-admin');
        expect(form.title).toBe('demo.tenants.invite-admin.title');
        expect(fields.map(field => field.key)).toEqual(['organization', 'email', 'name', 'surname', 'language']);
        expect((fields[0] as FormInfoField).items).toEqual([{ label: 'Globex' }]);
        expect(fields[1]).toMatchObject({ isRequired: true });
        expect((fields[4] as FormSelectField).options).toEqual([
            { label: 'English', value: 'en' },
            { label: 'Español', value: 'es' }
        ]);
    });
});
