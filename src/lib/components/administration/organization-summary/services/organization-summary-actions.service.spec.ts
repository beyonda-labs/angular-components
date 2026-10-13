import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';

import { ROLE_VIEW_DEFAULTS } from '../../models/role-permissions.model';
import { OrganizationSummaryActionsService } from './organization-summary-actions.service';

describe('OrganizationSummaryActionsService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideBeyTesting()] });
    });

    it('opens the read-only view of the permissions of a role, under the prefix of the role settings', () => {
        TestBed.inject(OrganizationSummaryActionsService).viewRole(
            { ...ROLE_VIEW_DEFAULTS, prefix: 'demo.roles' },
            { description: null, id: 'r1', name: 'Signers', permissions: ['documents.complete'] }
        );
        const [view] = TestBed.inject(FakeModalFormService).forms();

        expect(view.prefix).toBe('demo.roles.view');
        expect(view.initialValue).toEqual({
            main: { description: '', name: 'Signers' },
            permissions: { permissions: ['documents.complete'] }
        });
    });
});
