import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { renderComponent, textsOf } from '@testing/dom';

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
        const element = fixture.nativeElement as HTMLElement;

        expect(element.querySelector('p')?.textContent?.trim()).toBe('Used in 2 templates');
        expect(textsOf([...element.querySelectorAll('li')])).toEqual(['Invoice', 'Offer']);
    });

    it('shows only the list without a title', async () => {
        const fixture = await renderComponent(TooltipListComponent, { items: ['Invoice'] });

        expect((fixture.nativeElement as HTMLElement).querySelector('p')).toBeNull();
    });
});
