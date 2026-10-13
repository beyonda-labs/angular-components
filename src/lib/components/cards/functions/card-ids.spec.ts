import { nextCardIds } from './card-ids';

describe('card ids', () => {
    it('gives the title, the subtitle and the fold of one card the same base', () => {
        const { fold, subtitle, title } = nextCardIds();
        const base = title.replace(/-title$/u, '');

        expect(base).toMatch(/^bey-cards-\d+$/u);
        expect(subtitle).toBe(`${base}-subtitle`);
        expect(fold).toBe(`${base}-fold`);
    });

    it('gives every card ids of its own', () => {
        expect(nextCardIds().title).not.toBe(nextCardIds().title);
    });
});
