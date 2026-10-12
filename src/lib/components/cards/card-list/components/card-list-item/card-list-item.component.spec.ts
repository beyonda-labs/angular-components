import { ComponentFixture, TestBed } from '@angular/core/testing';
import { accessibleDescription, accessibleName, buttonByName, queryAll, renderComponent, settle } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import cardsEn from '../../../assets/cards.en.json';
import { CardListFold, CardListFoldParameters, CardListItem } from '../../models/card-list.model';
import { CardListItemComponent } from './card-list-item.component';

const TEXTS = { ...cardsEn, demo: { fold: { hide: 'Hide members', show: 'Show members' } } };

describe('CardListItemComponent', () => {
    let fixture: ComponentFixture<CardListItemComponent>;

    function buildItem(overrides: Partial<CardListFoldParameters> = {}): CardListItem {
        return new CardListItem({
            fold: new CardListFold({
                hideLabel: 'demo.fold.hide',
                items: [
                    new CardListItem({ key: 'u1', title: 'Ada Lovelace' }),
                    new CardListItem({ key: 'u2', title: 'Grace Hopper' })
                ],
                showLabel: 'demo.fold.show',
                ...overrides
            }),
            key: 'g1',
            subtitle: '2 members',
            title: 'Sales'
        });
    }

    function nestedTitles(): string[] {
        return queryAll(fixture, 'li').map(item => item.textContent?.trim() ?? '');
    }

    async function render(item: CardListItem = buildItem()): Promise<void> {
        fixture = await renderComponent(CardListItemComponent, { item });
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CardListItemComponent],
            providers: [provideBeyTesting({ translations: { en: TEXTS } })]
        }).compileComponents();
    });

    it('starts folded, with a toggle that names what it shows and the item it belongs to', async () => {
        await render();
        const toggle = buttonByName(fixture, 'Show members');

        expect(toggle.getAttribute('aria-expanded')).toBe('false');
        expect(accessibleDescription(toggle)).toBe('Sales');
        expect(nestedTitles()).toEqual([]);
    });

    it('unfolds the items in place under the item, and folds them again', async () => {
        await render();

        buttonByName(fixture, 'Show members').click();
        await settle(fixture);
        const toggle = buttonByName(fixture, 'Hide members');
        const [list] = queryAll(fixture, 'ul');

        expect(toggle.getAttribute('aria-expanded')).toBe('true');
        expect(toggle.getAttribute('aria-controls')).toBe(list.id);
        expect(accessibleName(list)).toBe('Sales');
        expect(nestedTitles()).toEqual(['Ada Lovelace', 'Grace Hopper']);

        toggle.click();
        await settle(fixture);

        expect(buttonByName(fixture, 'Show members').getAttribute('aria-expanded')).toBe('false');
        expect(nestedTitles()).toEqual([]);
    });

    it('starts unfolded when the fold says so, and says so when it holds nothing', async () => {
        await render(buildItem({ isOpen: true, items: [] }));

        expect(buttonByName(fixture, 'Hide members').getAttribute('aria-expanded')).toBe('true');
        expect(fixture.nativeElement.textContent).toContain('Nothing here yet.');
    });

    it('offers the default toggle texts of the module when the fold gives none', async () => {
        await render(new CardListItem({ fold: new CardListFold({ items: [] }), key: 'g1', title: 'Sales' }));

        buttonByName(fixture, 'Show').click();
        await settle(fixture);

        expect(buttonByName(fixture, 'Hide').getAttribute('aria-expanded')).toBe('true');
    });
});
