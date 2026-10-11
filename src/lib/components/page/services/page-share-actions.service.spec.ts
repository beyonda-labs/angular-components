import { TestBed } from '@angular/core/testing';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { of } from 'rxjs';

import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
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
const TARGETS = {
    groups: [{ id: 'g1', name: 'Sales' }],
    users: [{ id: 'u2', name: 'Grace Hopper' }]
};

describe('PageShareActionsService', () => {
    const findShares = jest.fn();
    const findShareTargets = jest.fn();
    const onSaved = jest.fn();
    const openWithRequest = jest.fn();
    const saveShares = jest.fn();
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

    function submit(value: PageShareFormValue): void {
        (openWithRequest.mock.calls[0][1] as (value: PageShareFormValue) => unknown)(value);
    }

    beforeEach(() => {
        jest.clearAllMocks();
        findShares.mockReturnValue(of({ inherited: [], shares: [GRACE_READS] }));
        findShareTargets.mockReturnValue(of(TARGETS));
        saveShares.mockReturnValue(of({ inherited: [], shares: [] }));

        TestBed.configureTestingModule({
            providers: [
                provideBeyTesting(),
                { provide: PageFormService, useValue: { openWithRequest } },
                { provide: PageHttpService, useValue: { findShares, findShareTargets, saveShares } }
            ]
        });

        service = TestBed.inject(PageShareActionsService);
    });

    it('asks for the shares and the targets of the folder and opens the form with the current shares chosen', () => {
        service.share(buildConfig(), CLIENTS, onSaved);

        expect(findShares).toHaveBeenCalledWith('/templates', 'clients');
        expect(findShareTargets).toHaveBeenCalledWith('/templates', 'clients');
        expect(openedForm().initialValue).toEqual({ groups: { 'group-0': '' }, users: { 'user-0': 'read' } });
        expect(openWithRequest.mock.calls[0][2]).toBe(onSaved);
    });

    it('replaces the shares of the folder with the choice, with the share toast of the page', () => {
        service.share(buildConfig(), CLIENTS, onSaved);

        submit({ groups: { 'group-0': 'write' }, users: { 'user-0': '' } });

        expect(saveShares).toHaveBeenCalledWith(
            '/templates',
            'clients',
            [{ access: 'write', granteeId: 'g1', granteeType: 'group' }],
            'docs.templates.toast.share-success'
        );
    });

    it('asks nothing on a page without categories', () => {
        service.share(buildConfig(false), CLIENTS, onSaved);

        expect(findShares).not.toHaveBeenCalled();
        expect(openWithRequest).not.toHaveBeenCalled();
    });
});
