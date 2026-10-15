import { TestBed } from '@angular/core/testing';
import { fieldsOf } from '@testing/form-fields';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeToastService } from '@testing/services/fake-toast.service';
import { firstValueFrom, Observable, of } from 'rxjs';

import { ModalFormConfig } from '../../form/components/modal/models/modal-form.model';
import {
    FormAutocompleteField,
    FormAutocompleteSearchResult
} from '../../form/models/fields/form-autocomplete-field.model';
import { FormInfoField } from '../../form/models/fields/form-info-field.model';
import { PageConfig, PageConfigParameters } from '../models/page.model';
import { PageCategoriesConfig, PageItemType } from '../models/page-categories.model';
import { PageItem } from '../models/page-item.model';
import { PageTableConfig } from '../models/page-table.model';
import { PageTransferConfig, PageTransferFormValue } from '../models/page-transfer.model';
import { PageFormService } from './page-form.service';
import { PageHttpService } from './page-http.service';
import { PageTransferActionsService } from './page-transfer-actions.service';

const ADA = { ownerId: 'u1', ownerName: 'Ada Lovelace' };
const CLIENTS = { ...ADA, id: 'clients', name: 'Clients', type: PageItemType.Category };
const OFFER = { ...ADA, id: 7, name: 'Offer', type: PageItemType.Item };
const SELECTION = [
    { id: 'clients', type: PageItemType.Category },
    { id: 7, type: PageItemType.Item }
];

describe('PageTransferActionsService', () => {
    const onTransferred = jest.fn();
    const openWithRequest = jest.fn();
    const searchTransferTargets = jest.fn();
    const transfer = jest.fn();
    let service: PageTransferActionsService;

    function buildConfig(overrides: Partial<PageConfigParameters> = {}): PageConfig {
        return new PageConfig({
            baseUrl: '/templates',
            prefix: 'docs.templates',
            tableConfig: new PageTableConfig({
                categoriesConfig: new PageCategoriesConfig({}),
                columns: [],
                loadRow: () => []
            }),
            ...overrides
        });
    }

    function openedForm(): ModalFormConfig<PageTransferFormValue> {
        return openWithRequest.mock.calls[0][0] as ModalFormConfig<PageTransferFormValue>;
    }

    function open(items: PageItem[] = [CLIENTS, OFFER], config: PageConfig = buildConfig()): void {
        service.transfer(config, items, onTransferred);
    }

    function submit(targetUserId: string): Promise<unknown> {
        const send = openWithRequest.mock.calls[0][1] as (value: PageTransferFormValue) => Observable<unknown>;

        return firstValueFrom(send({ main: { targetUserId } }));
    }

    beforeEach(() => {
        jest.clearAllMocks();
        searchTransferTargets.mockReturnValue(of({ hasMore: false, options: [] }));
        transfer.mockReturnValue(of({ transferred: 5 }));

        TestBed.configureTestingModule({
            providers: [
                provideBeyTesting(),
                { provide: PageFormService, useValue: { openWithRequest } },
                { provide: PageHttpService, useValue: { searchTransferTargets, transfer } }
            ]
        });

        service = TestBed.inject(PageTransferActionsService);
    });

    it('opens the form for the whole selection, with its owner and the default notice, and reloads once sent', () => {
        open();
        const notice = fieldsOf<FormInfoField>(openedForm()).find(field => field.key === 'notice');
        const owner = fieldsOf<FormInfoField>(openedForm()).find(field => field.key === 'owner');

        expect(openedForm().title).toBe('angular-components.page.transfer.title.other');
        expect(notice?.items[0].label).toBe('angular-components.page.transfer.notice');
        expect(owner?.items[0].label).toBe('Ada Lovelace');
        expect(openWithRequest.mock.calls[0][2]).toBe(onTransferred);
    });

    it('explains the transfer with the notice of the transfer config', () => {
        open([OFFER], buildConfig({ transferConfig: new PageTransferConfig({ notice: 'docs.transfer.notice' }) }));
        const notice = fieldsOf<FormInfoField>(openedForm()).find(field => field.key === 'notice');

        expect(notice?.items[0].label).toBe('docs.transfer.notice');
    });

    it('searches the transfer targets of the selection, its items and its folders typed', async () => {
        open();
        const picker = fieldsOf(openedForm()).find(field => field.key === 'targetUserId') as FormAutocompleteField;

        await firstValueFrom(picker.search?.('gra', []) as Observable<FormAutocompleteSearchResult>);

        expect(searchTransferTargets).toHaveBeenCalledWith('/templates', SELECTION, 'gra', 20);
    });

    it('sends the selection to the user chosen and confirms how many rows changed owner', async () => {
        open();

        await submit('u2');

        expect(transfer).toHaveBeenCalledWith('/templates', SELECTION, 'u2');
        expect(TestBed.inject(FakeToastService).successes()).toEqual([
            { message: 'angular-components.page.toast.transferred.other' }
        ]);
    });

    it('confirms a single row in the singular', async () => {
        transfer.mockReturnValue(of({ transferred: 1 }));
        open([OFFER]);

        await submit('u2');

        expect(TestBed.inject(FakeToastService).successes()).toEqual([
            { message: 'angular-components.page.toast.transferred.one' }
        ]);
    });

    it('opens nothing on a page without baseUrl or with nothing selected', () => {
        open([OFFER], buildConfig({ baseUrl: undefined }));
        open([]);

        expect(openWithRequest).not.toHaveBeenCalled();
    });
});
