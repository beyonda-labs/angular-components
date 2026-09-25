import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { mock } from 'jest-mock-extended';
import { of } from 'rxjs';

import { PageActionsService } from '../../services/page-actions.service';
import { PageHttpService } from '../../services/page-http.service';
import { PageStyleGuideComponent } from './page-style-guide.component';

describe('PageStyleGuideComponent', () => {
    let fixture: ComponentFixture<PageStyleGuideComponent>;

    beforeEach(async () => {
        const pageActionsService = mock<PageActionsService>();
        pageActionsService.filterVisibleActions.mockReturnValue([]);
        pageActionsService.buildHeaderActions.mockReturnValue([]);
        const pageHttpService = mock<PageHttpService>();
        pageHttpService.load.mockReturnValue(
            of({
                globalActions: ['create'],
                results: [{ id: 1, name: 'Keyboard', category: 'Hardware', price: 49.9 }],
                search: { filters: [], page: 1, size: 25, total: 1 }
            })
        );

        await TestBed.configureTestingModule({
            imports: [PageStyleGuideComponent, TranslateModule.forRoot()],
            providers: [
                { provide: PageActionsService, useValue: pageActionsService },
                { provide: PageHttpService, useValue: pageHttpService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PageStyleGuideComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    });

    it('lists the products from the demo backend', () => {
        expect(fixture.nativeElement.textContent).toContain('Keyboard');
        expect(fixture.nativeElement.textContent).toContain('49.90 €');
    });
});
