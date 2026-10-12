import { ContentCountOptions, ContentTranslate } from '../models/content-counts.model';

export function contentCountLines(
    counts: Readonly<Record<string, number>>,
    { contentLabels, countKey }: ContentCountOptions,
    translate: ContentTranslate
): string[] {
    return Object.entries(counts)
        .filter(([, count]) => count > 0)
        .map(([key, count]) => translate(countKey, { count, label: contentLabel(key, contentLabels, translate) }));
}

export function contentLabel(
    key: string,
    contentLabels: Readonly<Record<string, string>>,
    translate: ContentTranslate
): string {
    const labelKey = contentLabels[key];

    return labelKey ? translate(labelKey) : key;
}

export function sumContentCounts(counts: Readonly<Record<string, number>>[]): Record<string, number> {
    return counts.reduce<Record<string, number>>(
        (sums, current) =>
            Object.entries(current).reduce(
                (summed, [key, count]) => ({ ...summed, [key]: (summed[key] ?? 0) + count }),
                sums
            ),
        {}
    );
}
