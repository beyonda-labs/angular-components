import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { buttonByName, queryAll, renderComponent, rowWith, settle, textsOf } from '@testing/dom';
import { FakeFormHandle } from '@testing/handles/fake-form-handle';
import { provideBeyTesting } from '@testing/providers/testing.providers';
import { FakeModalService } from '@testing/services/fake-modal.service';
import { FakeModalFormService } from '@testing/services/fake-modal-form.service';
import { FakeToastService } from '@testing/services/fake-toast.service';

import { pageStyleGuideInterceptor } from './functions/page-backend';
import { PageStyleGuideComponent } from './page-style-guide.component';

const FOLDERS_URL = 'https://api.test/api/product-categories';

describe('PageStyleGuideComponent', () => {
    let fixture: ComponentFixture<PageStyleGuideComponent>;
    let http: HttpTestingController;

    function dispatchOnRow(name: string, type: string): void {
        rowWith(queryAll(fixture, 'bey-page')[1], name).dispatchEvent(
            new Event(type, { bubbles: true, cancelable: true })
        );
    }

    function sharingPage(): HTMLElement {
        return queryAll(fixture, 'bey-page')[2];
    }

    async function click(element: HTMLElement): Promise<void> {
        element.click();
        await settle(fixture);
    }

    async function select(name: string): Promise<void> {
        await click(queryAll(rowWith(sharingPage(), name), '[aria-label="angular-components.table.select-row"]')[0]);
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PageStyleGuideComponent],
            providers: [provideBeyTesting({ interceptors: [pageStyleGuideInterceptor] })]
        }).compileComponents();

        fixture = await renderComponent(PageStyleGuideComponent);
        http = TestBed.inject(HttpTestingController);
        http.expectOne(request => request.url === 'https://api.test/api/products').flush({
            globalActions: ['create'],
            results: [
                {
                    id: 1,
                    name: 'Keyboard',
                    category: 'Hardware',
                    organizationId: 'o1',
                    organizationName: 'Acme',
                    ownerId: 'u1',
                    ownerName: 'Ada Lovelace',
                    price: 49.9
                }
            ],
            search: { filters: [], page: 1, size: 25, total: 1 }
        });
        http.expectOne('https://api.test/api/products/organizations').flush({
            organizations: [
                { id: 'o1', name: 'Acme' },
                { id: 'o2', name: 'Globex' }
            ]
        });
        http.expectOne(request => request.url === FOLDERS_URL).flush({
            globalActions: [],
            results: [
                { actions: ['move'], id: 'folder-1', isShared: true, name: 'Desks', parentId: null, type: 'category' },
                { actions: ['move'], id: 'item-1', name: 'Lamp', parentId: null, price: 19.5, type: 'item' }
            ],
            search: { categoryTotal: 1, filters: [], page: 1, size: 25, total: 2 }
        });
        await settle(fixture);
    });

    it('lists the products from the demo backend', () => {
        expect(fixture.nativeElement.textContent).toContain('Keyboard');
        expect(fixture.nativeElement.textContent).toContain('49.90 €');
    });

    it('shows who owns each product, and asks for the owners once its filters panel opens', async () => {
        expect(fixture.nativeElement.textContent).toContain('Ada Lovelace');

        queryAll<HTMLButtonElement>(queryAll(fixture, 'bey-page')[0], 'bey-search [aria-expanded]')[0].click();
        await settle(fixture);

        http.expectOne('https://api.test/api/products/owners').flush({ owners: [{ id: 'u1', name: 'Ada Lovelace' }] });
    });

    it('shows the organization of each product, since its rows span two organizations', () => {
        expect(fixture.nativeElement.textContent).toContain('angular-components.page.table.columns.organization-name');
        expect(fixture.nativeElement.textContent).toContain('Acme');
    });

    it('offers the available view and counts the folders apart from the products in the folders example', () => {
        expect(fixture.nativeElement.textContent).toContain('angular-components-style-guide.page.tabs.available.label');
        expect(fixture.nativeElement.textContent).toContain('angular-components.page.count.mixed');
    });

    it('marks the shared folder of the folders example with the shared folder icon', () => {
        expect(
            queryAll(queryAll(fixture, 'bey-page')[1], '[role="img"]:not([aria-hidden="true"])').map(icon =>
                icon.getAttribute('aria-label')
            )
        ).toEqual(['angular-components.page.shared.folder']);
    });

    it('moves a product dropped onto a folder and lists the folder again', async () => {
        dispatchOnRow('Lamp', 'dragstart');
        await settle(fixture);
        dispatchOnRow('Desks', 'dragover');
        dispatchOnRow('Desks', 'drop');

        const move = http.expectOne(`${FOLDERS_URL}/move`);
        expect(move.request.body).toEqual({ items: [{ id: 'item-1', type: 'item' }], targetId: 'folder-1' });

        move.flush(null);
        await settle(fixture);

        expect(http.match(request => request.url === FOLDERS_URL)).toHaveLength(1);
    });

    it('lists in the sharing example what others shared with the user, with their owner, from a tab of its own', async () => {
        await click(buttonByName(sharingPage(), 'angular-components.page.shared.label'));

        expect(textsOf(queryAll(rowWith(sharingPage(), 'Clients'), '[role="cell"]'))).toContain('Grace Hopper');
    });

    it('shares a folder of the user from the sharing example, starting from who it is shared with', async () => {
        await select('Contracts');
        await click(buttonByName(sharingPage(), 'angular-components.header.menu'));
        await click(buttonByName(sharingPage(), 'angular-components-style-guide.page.sharing.actions.share.label'));
        const [form] = TestBed.inject(FakeModalFormService).forms();

        form.onSubmit?.({ grantees: { read: ['group:g1', 'user:u2'], write: [] } }, new FakeFormHandle());
        await settle(fixture);

        expect(form.initialValue).toEqual({ grantees: { read: ['group:g1'], write: [] } });
        expect(TestBed.inject(FakeToastService).successes()).toEqual([
            { message: 'angular-components-style-guide.page.sharing.toast.share-success' }
        ]);
    });

    it('changes the owner of a folder and a document of the sharing example, confirming how many rows changed', async () => {
        await select('Drafts');
        await select('Offer 2026');
        await click(buttonByName(sharingPage(), 'angular-components.header.menu'));
        await click(buttonByName(sharingPage(), 'angular-components.page.actions.transfer.label'));
        const [form] = TestBed.inject(FakeModalFormService).forms();

        form.onSubmit?.({ main: { targetUserId: 'u3' } }, new FakeFormHandle());
        await settle(fixture);

        expect(TestBed.inject(FakeToastService).successes()).toEqual([
            { message: 'angular-components.page.toast.transferred.other' }
        ]);
    });

    it('views a document of the sharing example from the View action next to its name', async () => {
        await select('Offer 2026');
        await click(buttonByName(sharingPage(), 'angular-components.page.actions.view.label'));

        expect(TestBed.inject(FakeModalService).infos()).toEqual([
            expect.objectContaining({ messageParameters: { name: 'Offer 2026' } })
        ]);
    });
});
