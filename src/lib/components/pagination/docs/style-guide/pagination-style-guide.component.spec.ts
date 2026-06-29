import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { PaginationStyleGuideComponent } from './pagination-style-guide.component';

describe('PaginationStyleGuideComponent', () => {
    let component: PaginationStyleGuideComponent;
    let fixture: ComponentFixture<PaginationStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PaginationStyleGuideComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(PaginationStyleGuideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});