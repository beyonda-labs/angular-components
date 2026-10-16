import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { buttonByName, queryAll, queryButton, renderComponent, rowWith, settle } from '@testing/dom';
import { fieldsOf } from '@testing/form-fields';
import { FakeFormHandle } from '@testing/handles/fake-form-handle';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';
import { FakeToastService } from '@testing/services/fake-toast.service';

import { FormAutocompleteField } from '../form/models/fields/form-autocomplete-field.model';
import { TableColumn } from '../table/models/table.model';
import { TextTableCell } from '../table/models/table-cell.model';
import { pageStandardAction } from './functions/page-standard-actions';
import { PageConfig } from './models/page.model';
import { PageStandardAction } from './models/page-action.model';
import { PageCategoriesConfig, PageItemType } from './models/page-categories.model';
import { PageHeaderConfig } from './models/page-header.model';
import { PageOwnedItem } from './models/page-owner.model';
import { PageTableConfig } from './models/page-table.model';
import { PageTransferFormValue } from './models/page-transfer.model';
import { PageComponent } from './page.component';

interface Contract extends PageOwnedItem {
    name: string;
    parentId: string | null;
    type: PageItemType;
}

const ADA = { ownerId: 'u1', ownerName: 'Ada Lovelace' };
const TRANSFERABLE = { ...ADA, actions: [PageStandardAction.Transfer], parentId: null };
const DRAFTS: Contract = { ...TRANSFERABLE, id: 'drafts', name: 'Drafts', type: PageItemType.Category };
const OFFER: Contract = { ...TRANSFERABLE, id: 'offer', name: 'Offer', type: PageItemType.Item };
const TERMS: Contract = { ...ADA, actions: [], id: 'terms', name: 'Terms', parentId: null, type: PageItemType.Item };
const LIST_URL = 'https://api.test/api/contracts';
const MENU = 'angular-components.header.menu';
const TRANSFER_LABEL = 'angular-components.page.actions.transfer.label';

describe('PageComponent — transfer', () => {
    let fixture: ComponentFixture<PageComponent>;
    let httpTesting: HttpTestingController;

    function buildConfig(): PageConfig<unknown, Contract> {
        return new PageConfig<unknown, Contract>({
            baseUrl: '/contracts',
            headerConfig: new PageHeaderConfig({ actions: [pageStandardAction(PageStandardAction.Transfer)] }),
            prefix: 'demo',
            tableConfig: new PageTableConfig<Contract>({
                categoriesConfig: new PageCategoriesConfig<Contract>({}),
                columns: [new TableColumn({ key: 'name' })],
                loadRow: contract => [new TextTableCell({ content: contract.name })]
            })
        });
    }

    async function answer(results: Contract[]): Promise<TestRequest> {
        await settle(fixture);
        const request = httpTesting.expectOne(current => current.url === LIST_URL);

        request.flush({
            globalActions: [],
            results,
            search: { filters: [], page: 1, size: 25, total: results.length }
        });
        await settle(fixture);

        return request;
    }

    async function click(element: HTMLElement): Promise<void> {
        element.click();
        await settle(fixture);
    }

    async function select(name: string): Promise<void> {
        await click(queryAll(rowWith(fixture, name), '[aria-label="angular-components.table.select-row"]')[0]);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PageComponent],
            providers: [provideBeyTesting()]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        fixture = await renderComponent(PageComponent, { config: buildConfig() });
        await answer([DRAFTS, OFFER, TERMS]);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('hands a folder and an item to the user chosen, found by a search, and confirms how many rows changed', async () => {
        await select('Drafts');
        await select('Offer');
        await click(buttonByName(fixture, MENU));
        await click(buttonByName(fixture, TRANSFER_LABEL));

        const [form] = TestBed.inject(FakeModalFormService).forms();
        const picker = fieldsOf(form).find(field => field.key === 'targetUserId') as FormAutocompleteField;
        let suggestions: string[] = [];
        picker.search?.('gra', []).subscribe(result => {
            suggestions = (Array.isArray(result) ? result : result.options).map(({ label }) => label);
        });
        const search = httpTesting.expectOne(current => current.url === `${LIST_URL}/transfer-targets`);
        search.flush({
            hasMore: false,
            options: [{ description: 'grace@test.com', label: 'Grace Hopper', value: 'u2' }]
        });

        form.onSubmit?.({ main: { targetUserId: 'u2' } } as PageTransferFormValue, new FakeFormHandle());
        const send = httpTesting.expectOne(`${LIST_URL}/transfer`);
        send.flush({ transferred: 4 });
        await answer([DRAFTS, OFFER, TERMS]);

        expect(search.request.params.toString()).toBe('ids=offer&categoryIds=drafts&search=gra&limit=20');
        expect(suggestions).toEqual(['Grace Hopper (grace@test.com)']);
        expect(send.request.method).toBe('POST');
        expect(send.request.body).toEqual({
            items: [
                { id: 'drafts', type: PageItemType.Category },
                { id: 'offer', type: PageItemType.Item }
            ],
            targetUserId: 'u2'
        });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([
            { message: 'angular-components.page.toast.transferred.other' }
        ]);
        expect(queryButton(fixture, MENU)).toBeNull();
    });

    it('offers no transfer while a selected row does not list it', async () => {
        await select('Offer');
        await select('Terms');

        expect(queryButton(fixture, MENU)).toBeNull();
    });
});
