import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { ListStyleGuideComponent } from './list-style-guide.component';

describe('ListStyleGuideComponent', () => {
    let component: ListStyleGuideComponent;
    let fixture: ComponentFixture<ListStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ListStyleGuideComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ListStyleGuideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should build initials from the employee name', () => {
        expect(component.getInitials('Ada Lovelace')).toBe('AL');
    });
});
