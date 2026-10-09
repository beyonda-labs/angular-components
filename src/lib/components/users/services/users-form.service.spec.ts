import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { FormCheckboxGroupField } from '../../form/models/fields/form-checkbox-group-field.model';
import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { FormField } from '../../form/models/form-field.model';
import { PageFormConfig } from '../../page/models/page-form.model';
import { UserFormValue, UserRow, UserStatus } from '../models/users.model';
import { UsersFormService } from './users-form.service';

describe('UsersFormService', () => {
    let form: PageFormConfig<UserFormValue, UserRow>;
    let service: UsersFormService;

    const user: UserRow = {
        actions: ['edit'],
        createdAt: 0,
        email: 'ada@example.test',
        id: 'u1',
        name: 'Ada',
        roles: ['owner'],
        status: UserStatus.Active
    };

    function fieldsFor(row?: UserRow): FormField[] {
        return form.buildSections(row).flatMap(section => section.rows.flatMap(row => row.fields));
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                provideBeyTesting({ translations: { en: { demo: { roles: { admin: 'Administrator' } } } } })
            ]
        });

        service = TestBed.inject(UsersFormService);
        form = service.buildFormConfig({ prefix: 'demo.users', rolePrefix: 'demo.roles', roles: ['admin', 'editor'] });
    });

    it('asks for the email, the names, the roles and the language of a new user', () => {
        const fields = fieldsFor();

        expect(form.prefix).toBe('demo.users.form');
        expect(fields.map(field => field.key)).toEqual(['email', 'name', 'surname', 'roles', 'language']);
        expect((fields[3] as FormCheckboxGroupField).options).toEqual([
            { label: 'Administrator', value: 'admin' },
            { label: 'editor', value: 'editor' }
        ]);
        expect(form.toFormValue()).toBeUndefined();
    });

    it('shows the email of a user it edits, and offers the roles the user already has', () => {
        const fields = fieldsFor(user);

        expect(fields.map(field => field.key)).toEqual(['email', 'name', 'surname', 'roles']);
        expect((fields[0] as FormInfoField).items).toEqual([{ label: 'ada@example.test' }]);
        expect(
            ((fields[3] as FormCheckboxGroupField).options as { value: string }[]).map(({ value }) => value)
        ).toEqual(['admin', 'editor', 'owner']);
        expect(form.toFormValue(user)).toEqual({ main: { name: 'Ada', roles: ['owner'], surname: '' } });
    });

    it('sends the roles and only the texts that were filled in, trimmed', () => {
        expect(
            form.toItem({
                main: { email: ' grace@example.test ', language: '', name: 'Grace ', roles: ['admin'], surname: ' ' }
            })
        ).toEqual({ email: 'grace@example.test', name: 'Grace', roles: ['admin'] });
    });
});
