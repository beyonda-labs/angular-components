import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { PageStyleGuideComponent } from './page-style-guide.component';

describe('PageStyleGuideComponent', () => {
    let fixture: ComponentFixture<PageStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PageStyleGuideComponent],
            providers: [provideBeyTesting()]
        }).compileComponents();

        fixture = await renderComponent(PageStyleGuideComponent);
        TestBed.inject(HttpTestingController)
            .expectOne(request => request.url === 'https://api.test/api/products')
            .flush({
                globalActions: ['create'],
                results: [{ id: 1, name: 'Keyboard', category: 'Hardware', price: 49.9 }],
                search: { filters: [], page: 1, size: 25, total: 1 }
            });
        await settle(fixture);
    });

    it('lists the products from the demo backend', () => {
        expect(fixture.nativeElement.textContent).toContain('Keyboard');
        expect(fixture.nativeElement.textContent).toContain('49.90 €');
    });
});
