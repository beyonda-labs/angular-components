import { ComponentFixture, TestBed } from '@angular/core/testing';
import { accessibleDescription, accessibleName, queryAll, renderComponent, settle, visibleText } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import cardsEn from '../assets/cards.en.json';
import { AvatarConfig } from '../avatar/models/avatar.model';
import { CardListComponent } from './card-list.component';
import { CardListConfig, CardListConfigParameters, CardListItem } from './models/card-list.model';

const TEXTS = {
    ...cardsEn,
    demo: { list: { members: { other: '{{count}} members' }, title: 'People', ungrouped: 'No group' } }
};

describe('CardListComponent', () => {
    let fixture: ComponentFixture<CardListComponent>;

    function buildConfig(overrides: Partial<CardListConfigParameters> = {}): CardListConfig {
        return new CardListConfig({
            items: [
                new CardListItem({
                    avatar: new AvatarConfig({ name: 'Ada', surname: 'Lovelace' }),
                    key: 'u1',
                    subtitle: 'ada@example.test',
                    title: 'Ada Lovelace'
                }),
                new CardListItem({
                    key: 'ungrouped',
                    subtitle: 'demo.list.members.other',
                    subtitleParameters: { count: 2 },
                    title: 'demo.list.ungrouped'
                })
            ],
            ...overrides
        });
    }

    async function render(config: CardListConfig = buildConfig()): Promise<void> {
        fixture = await renderComponent(CardListComponent, { config });
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CardListComponent],
            providers: [provideBeyTesting({ translations: { en: TEXTS } })]
        }).compileComponents();
    });

    it('lists every item with its title and its subtitle, translating the keys with their parameters', async () => {
        await render();

        expect(queryAll(fixture, 'li').map(item => visibleText(item))).toEqual([
            'AL Ada Lovelace ada@example.test',
            'No group 2 members'
        ]);
        expect(queryAll(fixture, 'button')).toEqual([]);
    });

    it('names the list after its title, with its count next to it', async () => {
        await render(buildConfig({ count: 7, items: [], title: 'demo.list.title' }));
        const [section] = queryAll(fixture, 'section');

        expect(accessibleName(section)).toBe('People');
        expect(visibleText(section)).toBe('People 7 Nothing here yet.');
    });

    it('says there is nothing to show when it has no items, with the label of the config or its own', async () => {
        await render(buildConfig({ items: [] }));

        expect(visibleText(fixture)).toBe('Nothing here yet.');

        await render(buildConfig({ emptyLabel: 'demo.list.ungrouped', items: [] }));

        expect(visibleText(fixture)).toBe('No group');
    });

    it('turns an item with onClick into a button named by its title and described by its subtitle', async () => {
        const onClick = jest.fn();
        await render(
            buildConfig({
                items: [new CardListItem({ key: 'r1', onClick, subtitle: 'Review the templates', title: 'Reviewers' })]
            })
        );
        const [button] = queryAll<HTMLButtonElement>(fixture, 'button');

        expect(accessibleName(button)).toBe('Reviewers');
        expect(accessibleDescription(button)).toBe('Review the templates');

        button.click();
        await settle(fixture);

        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
