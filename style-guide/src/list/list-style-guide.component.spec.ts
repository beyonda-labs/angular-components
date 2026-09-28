import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { queryAll, renderComponent, textsOf } from '@testing/dom';

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
        expect(textsOf(queryAll(fixture, '[role="button"]'))).toEqual([
            expect.stringMatching(/^AL\s+Ada Lovelace/u),
            expect.stringMatching(/^LT\s+Linus Torvalds/u),
            expect.stringMatching(/^GH\s+Grace Hopper/u)
        ]);
    });
});
