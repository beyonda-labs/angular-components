import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { firstValueFrom, of } from 'rxjs';

import { ModalFormConfig } from '../../../form/components/modal/models/modal-form.model';
import { FormAutocompleteField } from '../../../form/models/fields/form-autocomplete-field.model';
import { FormInfoField } from '../../../form/models/fields/form-info-field.model';
import { FormListField } from '../../../form/models/fields/form-list-field.model';
import { FormField } from '../../../form/models/form-field.model';
import { UserRow, UserStatus } from '../models/users.model';
import { UserContentFormService } from './user-content-form.service';

describe('UserContentFormService', () => {
    let service: UserContentFormService;

    const ada: UserRow = {
        actions: ['delete', 'transfer'],
        createdAt: 0,
        email: 'ada@example.test',
        id: 'u1',
        roles: [],
        status: UserStatus.Invited
    };

    function fieldsOf(form: Pick<ModalFormConfig, 'sections'>): FormField[] {
        return form.sections.flatMap(section => section.rows.flatMap(row => row.fields));
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideBeyTesting({
                    translations: {
                        en: {
                            demo: {
                                users: {
                                    content: { count: '{{label}}: {{count}}' },
                                    delete: {
                                        invitation: { other: 'The invitations will stop working.' },
                                        title: { other: 'Delete {{count}} users' }
                                    },
                                    transfer: { title: 'Transfer the content of {{name}}' }
                                }
                            }
                        }
                    }
                })
            ]
        });

        service = TestBed.inject(UserContentFormService);
    });

    it('names a user without a name by the email in the transfer, and asks for the person to receive it', () => {
        const form = service.buildTransferConfig({
            content: { counts: { documents: 1 }, usedByOthers: {} },
            contentLabels: {},
            prefix: 'demo.users',
            searchTargets: () => of([]),
            user: ada
        });

        expect(form.title).toBe('Transfer the content of ada@example.test');
        expect(form.initialValue).toEqual({ main: { targetUserId: '' } });
        expect(form.submitLabel).toBe('demo.users.transfer.submit');
        expect((fieldsOf(form)[0] as FormListField).items).toEqual(['documents: 1']);
        expect(fieldsOf(form)[1]).toMatchObject({ emptyKey: 'demo.users.transfer.no-targets', isRequired: true });
    });

    it('says there are more people to find when the search answers as many as it asks for', async () => {
        const many = Array.from({ length: 20 }, (_, index) => ({ email: `p${index}@example.test`, id: `p${index}` }));
        const form = service.buildTransferConfig({
            content: { counts: {}, usedByOthers: {} },
            contentLabels: {},
            prefix: 'demo.users',
            searchTargets: () => of(many),
            user: ada
        });
        const result = await firstValueFrom((fieldsOf(form)[1] as FormAutocompleteField).search?.('', []) ?? of(null));

        expect(result).toMatchObject({ hasMore: true });
    });

    it('counts the users deleted and says their pending invitations stop working', () => {
        const form = service.buildDeleteConfig({
            contentLabels: {},
            contents: [
                { counts: {}, usedByOthers: {} },
                { counts: {}, usedByOthers: {} }
            ],
            prefix: 'demo.users',
            users: [ada, { ...ada, id: 'u2' }]
        });
        const invitation = fieldsOf(form).find(({ key }) => key === 'invitation') as FormInfoField;

        expect(form.title).toBe('Delete 2 users');
        expect(form.isSubmitDanger).toBe(true);
        expect(invitation.items).toEqual([{ label: 'The invitations will stop working.' }]);
    });
});
