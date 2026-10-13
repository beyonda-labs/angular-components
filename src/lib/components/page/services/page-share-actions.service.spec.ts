import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { firstValueFrom, Observable, of } from 'rxjs';

import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import { FormAutocompleteSearchResult } from '../../form/models/fields/form-autocomplete-field.model';
import { FormListField } from '../../form/models/fields/form-list-field.model';
import { PageConfig } from '../models/page.model';
import { PageCategoriesConfig, PageItemType } from '../models/page-categories.model';
import { PageShareAccess, PageShareFormValue, PageShareGranteeType } from '../models/page-sharing.model';
import { PageTableConfig } from '../models/page-table.model';
import { PageFormService } from './page-form.service';
import { PageHttpService } from './page-http.service';
import { PageShareActionsService } from './page-share-actions.service';

const CLIENTS = { id: 'clients', name: 'Clients', type: PageItemType.Category };
const GRACE_READS = {
    access: PageShareAccess.Read,
    granteeId: 'u2',
    granteeName: 'Grace Hopper',
    granteeType: PageShareGranteeType.User,
    id: 's1'
};
const SALES_WRITES = {
    access: PageShareAccess.Write,
    granteeId: 'g1',
    granteeName: 'Sales',
    granteeType: PageShareGranteeType.Group,
    id: 's2'
};
const TARGETS = {
    groups: [{ id: 'g1', memberCount: 2, name: 'Sales' }],
    hasMore: false,
    users: [{ email: 'grace@test.com', id: 'u2', name: 'Grace Hopper' }]
};

describe('PageShareActionsService', () => {
    const findShares = jest.fn();
    const onSaved = jest.fn();
    const openWithRequest = jest.fn();
    const saveShares = jest.fn();
    const searchShareTargets = jest.fn();
    let service: PageShareActionsService;

    function buildConfig(withCategories = true): PageConfig {
        return new PageConfig({
            baseUrl: '/templates',
            prefix: 'docs.templates',
            tableConfig: new PageTableConfig({
                categoriesConfig: withCategories ? new PageCategoriesConfig({}) : undefined,
                columns: [],
                loadRow: () => []
            })
        });
    }

    function openedForm(): ModalFormConfig<PageShareFormValue> {
        return openWithRequest.mock.calls[0][0] as ModalFormConfig<PageShareFormValue>;
    }

    function openedList(access: PageShareAccess): FormListField {
        return openedForm()
            .sections.flatMap(section => section.rows.flatMap(row => row.fields))
            .find(field => field.key === access) as FormListField;
    }

    function submit(value: PageShareFormValue): void {
        (openWithRequest.mock.calls[0][1] as (value: PageShareFormValue) => unknown)(value);
    }

    function savedShares(): unknown {
        return saveShares.mock.calls[0][2];
    }

    beforeEach(() => {
        jest.clearAllMocks();
        findShares.mockReturnValue(of({ inherited: [], shares: [GRACE_READS, SALES_WRITES] }));
        saveShares.mockReturnValue(of({ inherited: [], shares: [] }));
        searchShareTargets.mockReturnValue(of(TARGETS));

        TestBed.configureTestingModule({
            providers: [
                provideBeyTesting(),
                { provide: PageFormService, useValue: { openWithRequest } },
                { provide: PageHttpService, useValue: { findShares, saveShares, searchShareTargets } }
            ]
        });

        service = TestBed.inject(PageShareActionsService);
        service.share(buildConfig(), CLIENTS, onSaved);
    });

    it('asks for the shares of the folder and opens the form with each one in the list of its access', () => {
        expect(findShares).toHaveBeenCalledWith('/templates', 'clients');
        expect(searchShareTargets).not.toHaveBeenCalled();
        expect(openedForm().initialValue).toEqual({ grantees: { read: ['user:u2'], write: ['group:g1'] } });
        expect(openWithRequest.mock.calls[0][2]).toBe(onSaved);
    });

    it('searches the share targets of the folder with the typed text and the limit', async () => {
        const { picker } = openedList(PageShareAccess.Write);

        const result = await firstValueFrom(
            picker?.search?.('gra', ['user:u2']) as Observable<FormAutocompleteSearchResult>
        );

        expect(searchShareTargets).toHaveBeenCalledWith('/templates', 'clients', 'gra', 21);
        expect(result.options).toEqual([
            { label: 'angular-components.page.share.grantee.members.other', value: 'group:g1' }
        ]);
    });

    it('sends read for the rows of the view list and write for those of the edit list, with the share toast', () => {
        submit({ grantees: { read: ['group:g1'], write: ['user:u2', 'user:u3'] } });

        expect(saveShares).toHaveBeenCalledWith(
            '/templates',
            'clients',
            [
                { access: 'read', granteeId: 'g1', granteeType: 'group' },
                { access: 'write', granteeId: 'u2', granteeType: 'user' },
                { access: 'write', granteeId: 'u3', granteeType: 'user' }
            ],
            'docs.templates.toast.share-success'
        );
    });

    it('stops sharing with a grantee whose row was removed', () => {
        submit({ grantees: { read: [], write: ['group:g1'] } });

        expect(savedShares()).toEqual([{ access: 'write', granteeId: 'g1', granteeType: 'group' }]);
    });

    it('waits for a change before saving, and sends the shares back as they were when the lists did not move', () => {
        submit(openedForm().initialValue as PageShareFormValue);

        expect(openedForm().allowSubmitWithoutChanges).toBe(false);
        expect(savedShares()).toEqual([
            { access: 'read', granteeId: 'u2', granteeType: 'user' },
            { access: 'write', granteeId: 'g1', granteeType: 'group' }
        ]);
    });

    it('asks nothing on a page without categories', () => {
        jest.clearAllMocks();

        service.share(buildConfig(false), CLIENTS, onSaved);

        expect(findShares).not.toHaveBeenCalled();
        expect(openWithRequest).not.toHaveBeenCalled();
    });
});
