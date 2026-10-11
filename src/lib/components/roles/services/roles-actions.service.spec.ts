import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';

import { RoleRow } from '../models/roles.model';
import { RolesActionsService } from './roles-actions.service';

describe('RolesActionsService', () => {
    const normaluser: RoleRow = {
        actions: [],
        id: 'normaluser',
        isBase: true,
        memberCount: 3,
        name: 'normaluser',
        permissions: ['documents.read']
    };

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });
    });

    it('opens the permissions of a role in a form that only shows them', () => {
        TestBed.inject(RolesActionsService).viewPermissions(
            {
                permissionPrefix: 'demo.permissions',
                permissions: [{ group: 'documents', key: 'documents.read' }],
                prefix: 'demo.roles',
                rolePrefix: 'demo.roles'
            },
            normaluser
        );
        const [form] = TestBed.inject(FakeModalFormService).forms();

        expect(form.title).toBe('demo.roles.view.title');
        expect(form.isSubmitHidden).toBe(true);
        expect(form.initialValue).toEqual(expect.objectContaining({ permissions: { documents: ['documents.read'] } }));
    });
});
