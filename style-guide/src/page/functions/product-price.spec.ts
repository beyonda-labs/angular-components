import { toPrice } from './product-price';

describe('toPrice', () => {
    it('shows a price with two decimals, in euros', () => {
        expect(toPrice(12)).toBe('12.00 €');
        expect(toPrice(3.456)).toBe('3.46 €');
    });

    it('shows nothing for a row whose price is missing', () => {
        expect(toPrice(undefined as unknown as number)).toBe('');
    });
});
