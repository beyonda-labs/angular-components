const ACCENTS = /[\u0300-\u036F]/gu;
const WHITESPACE = /\s+/gu;

export function matchesOptionText(label: string, text: string): boolean {
    return foldText(label).includes(foldText(text));
}

function foldText(text: string): string {
    return text.normalize('NFD').replaceAll(ACCENTS, '').toLowerCase().replaceAll(WHITESPACE, ' ').trim();
}
