import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { queryButton, renderComponent } from '@testing/dom';

import { PaginationStyleGuideComponent } from './pagination-style-guide.component';

describe('PaginationStyleGuideComponent', () => {
    let fixture: ComponentFixture<PaginationStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PaginationStyleGuideComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = await renderComponent(PaginationStyleGuideComponent);
    });

    it('shows the full and the compact examples with their page controls', () => {
        const text = fixture.nativeElement.textContent;

        expect(text).toContain('angular-components-style-guide.pagination.examples.full');
        expect(text).toContain('angular-components-style-guide.pagination.examples.compact');
        expect(queryButton(fixture, 'angular-components.pagination.previous-page')).not.toBeNull();
    });
});
