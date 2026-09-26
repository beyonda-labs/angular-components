import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { renderComponent } from '@testing/dom';

import { PaginationStyleGuideComponent } from './pagination-style-guide.component';

describe('PaginationStyleGuideComponent', () => {
    let component: PaginationStyleGuideComponent;
    let fixture: ComponentFixture<PaginationStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PaginationStyleGuideComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = await renderComponent(PaginationStyleGuideComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
