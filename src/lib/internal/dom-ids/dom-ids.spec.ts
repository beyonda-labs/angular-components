import { nextDomId } from './dom-ids';

describe('dom ids', () => {
    it('builds the id from the prefix and a number', () => {
        expect(nextDomId('bey-tabs')).toMatch(/^bey-tabs-\d+$/u);
    });

    it('never returns the same id twice for one prefix', () => {
        const ids = [nextDomId('bey-tabs'), nextDomId('bey-tabs'), nextDomId('bey-tabs')];

        expect(new Set(ids).size).toBe(ids.length);
    });
});
