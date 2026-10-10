import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { queryAll, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { PageStyleGuideComponent } from './page-style-guide.component';

const FOLDERS_URL = 'https://api.test/api/product-categories';

describe('PageStyleGuideComponent', () => {
    let fixture: ComponentFixture<PageStyleGuideComponent>;
    let http: HttpTestingController;

    function dispatchOnRow(name: string, type: string): void {
        queryAll(queryAll(fixture, 'bey-page')[1], '[role="row"]')
            .find(row => row.textContent?.includes(name))
            ?.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PageStyleGuideComponent],
            providers: [provideBeyTesting()]
        }).compileComponents();

        fixture = await renderComponent(PageStyleGuideComponent);
        http = TestBed.inject(HttpTestingController);
        http.expectOne(request => request.url === 'https://api.test/api/products').flush({
            globalActions: ['create'],
            results: [
                { id: 1, name: 'Keyboard', category: 'Hardware', ownerId: 'u1', ownerName: 'Ada Lovelace', price: 49.9 }
            ],
            search: { filters: [], page: 1, size: 25, total: 1 }
        });
        http.expectOne(request => request.url === FOLDERS_URL).flush({
            globalActions: [],
            results: [
                { actions: ['move'], id: 'folder-1', name: 'Desks', parentId: null, type: 'category' },
                { actions: ['move'], id: 'item-1', name: 'Lamp', parentId: null, price: 19.5, type: 'item' }
            ],
            search: { filters: [], page: 1, size: 25, total: 2 }
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

    it('offers the available view and counts the rows of the folder in the folders example', () => {
        expect(fixture.nativeElement.textContent).toContain('angular-components-style-guide.page.tabs.available.label');
        expect(fixture.nativeElement.textContent).toContain('angular-components.page.count.many');
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
});
