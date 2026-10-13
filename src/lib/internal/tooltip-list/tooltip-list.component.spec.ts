import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { queryAll, renderComponent, textsOf, visibleText } from '@testing/dom';

import { TooltipListComponent } from './tooltip-list.component';

describe('TooltipListComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TooltipListComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    it('shows its title over one list entry per item', async () => {
        const fixture = await renderComponent(TooltipListComponent, {
            items: ['Invoice', 'Offer'],
            title: 'Used in 2 templates'
        });

        expect(visibleText(fixture)).toBe('Used in 2 templates Invoice Offer');
        expect(textsOf(queryAll(fixture, 'li'))).toEqual(['Invoice', 'Offer']);
    });

    it('shows only the list without a title', async () => {
        const fixture = await renderComponent(TooltipListComponent, { items: ['Invoice'] });

        expect(visibleText(fixture)).toBe('Invoice');
    });
});
