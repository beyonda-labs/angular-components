import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { TableStyleGuideComponent } from './table-style-guide.component';

describe('TableStyleGuideComponent', () => {
    let component: TableStyleGuideComponent;
    let fixture: ComponentFixture<TableStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TableStyleGuideComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(TableStyleGuideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});