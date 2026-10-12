import { TestBed } from '@angular/core/testing';
import { queryAll, renderComponent, visibleText } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { CardStatsComponent } from './card-stats.component';
import { CardStat, CardStatsConfig } from './models/card-stats.model';

const TEXTS = { demo: { groups: 'Group', members: 'Members', roles: 'of {{count}} roles' } };

describe('CardStatsComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CardStatsComponent],
            providers: [provideBeyTesting({ translations: { en: TEXTS } })]
        }).compileComponents();
    });

    it('shows each figure with its label, translated with the figure as its count', async () => {
        const fixture = await renderComponent(CardStatsComponent, {
            config: new CardStatsConfig({
                items: [
                    new CardStat({ key: 'members', label: 'demo.members', value: 4 }),
                    new CardStat({ key: 'groups', label: 'demo.groups', value: 1 }),
                    new CardStat({ key: 'roles', label: 'demo.roles', value: 3 })
                ]
            })
        });

        expect(queryAll(fixture, 'li').map(item => visibleText(item))).toEqual([
            '4 Members',
            '1 Group',
            '3 of 3 roles'
        ]);
    });
});
