export function toPrice(price: number): string {
    return typeof price === 'number' ? `${price.toFixed(2)} €` : '';
}
