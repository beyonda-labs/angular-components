import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { StyleGuideComponent } from './style-guide.component';

describe('StyleGuideComponent', () => {
    let fixture: ComponentFixture<StyleGuideComponent>;
    let httpTesting: HttpTestingController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StyleGuideComponent],
            providers: [provideBeyTesting()]
        }).compileComponents();

        httpTesting = TestBed.inject(HttpTestingController);
        fixture = await renderComponent(StyleGuideComponent);
    });

    afterEach(() => {
        httpTesting.verify();
    });

    it('renders the demos once its own translations are merged', async () => {
        expect(fixture.nativeElement.textContent.trim()).toBe('');

        httpTesting
            .expectOne('assets/angular-components/i18n-style-guide/angular-components-style-guide.en.json')
            .flush({ 'angular-components-style-guide': { title: 'Style guide' } });
        await settle(fixture);
        httpTesting.expectOne('https://api.test/auth/providers').flush([]);
        httpTesting.expectOne('https://api.test/auth/register/fields').flush([]);
        httpTesting
            .expectOne(request => request.url === 'https://api.test/api/products')
            .flush({ globalActions: [], results: [] });

        expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Style guide');
    });
});
