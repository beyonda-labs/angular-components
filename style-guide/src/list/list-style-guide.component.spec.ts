import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { renderComponent } from '@testing/dom';

import { ListStyleGuideComponent } from './list-style-guide.component';

describe('ListStyleGuideComponent', () => {
    let component: ListStyleGuideComponent;
    let fixture: ComponentFixture<ListStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ListStyleGuideComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = await renderComponent(ListStyleGuideComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should build initials from the employee name', () => {
        expect(component.getInitials('Ada Lovelace')).toBe('AL');
    });
});
