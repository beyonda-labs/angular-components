import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { accessibleName, queryAll, renderComponent, visibleText } from '@testing/dom';
import { provideBeyTesting } from '@testing/providers/testing.providers';

import { CardComponent } from './card.component';
import { CardConfig } from './models/card.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CardComponent],
    standalone: true,
    template: `
        <bey-card [config]="config()">
            <p>Projected content</p>
        </bey-card>
    `
})
class CardHostComponent {
    readonly config = input.required<CardConfig>();
}

describe('CardComponent', () => {
    let fixture: ComponentFixture<CardHostComponent>;

    function section(): HTMLElement {
        return queryAll(fixture, 'section')[0];
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CardHostComponent],
            providers: [provideBeyTesting({ translations: { en: { demo: { card: { title: 'Recent' } } } } })]
        }).compileComponents();
    });

    it('names the card after its title, with its count next to it, over what it holds', async () => {
        fixture = await renderComponent(CardHostComponent, {
            config: new CardConfig({ count: 3, title: 'demo.card.title' })
        });

        expect(accessibleName(section())).toBe('Recent');
        expect(visibleText(section())).toBe('Recent 3 Projected content');
    });

    it('holds only what it is given when it has no title', async () => {
        fixture = await renderComponent(CardHostComponent, { config: new CardConfig() });

        expect(accessibleName(section())).toBe('');
        expect(visibleText(section())).toBe('Projected content');
    });
});
