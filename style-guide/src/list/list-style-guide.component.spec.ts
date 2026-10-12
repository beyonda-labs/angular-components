import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { queryAll, renderComponent, visibleText } from '@testing/dom';

import { ListStyleGuideComponent } from './list-style-guide.component';

describe('ListStyleGuideComponent', () => {
    let fixture: ComponentFixture<ListStyleGuideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ListStyleGuideComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = await renderComponent(ListStyleGuideComponent);
    });

    it('shows every employee with the initials of their name', () => {
        expect(queryAll(fixture, '[role="button"]').map(employee => visibleText(employee))).toEqual([
            'AL Ada Lovelace Engineering',
            'LT Linus Torvalds Platform',
            'GH Grace Hopper Research'
        ]);
    });
});
