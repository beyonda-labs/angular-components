import { contentCountLines, contentLabel, sumContentCounts } from './content-counts';

describe('content counts', () => {
    const translations: Record<string, string> = { 'my-app.content.templates': 'Templates' };
    const translate = (key: string, parameters?: Record<string, unknown>): string =>
        key === 'demo.count'
            ? `${String(parameters?.['label'])}: ${String(parameters?.['count'])}`
            : (translations[key] ?? key);
    const contentLabels = { templates: 'my-app.content.templates' };

    describe('contentCountLines', () => {
        it('writes a line per kind of content held, labelled from the labels of the app or by its key', () => {
            expect(
                contentCountLines(
                    { documents: 2, folders: 0, templates: 3 },
                    { contentLabels, countKey: 'demo.count' },
                    translate
                )
            ).toEqual(['documents: 2', 'Templates: 3']);
        });
    });

    describe('contentLabel', () => {
        it('labels a kind of content from its key of the app, or by the key itself', () => {
            expect(contentLabel('templates', contentLabels, translate)).toBe('Templates');
            expect(contentLabel('attachments', contentLabels, translate)).toBe('attachments');
        });
    });

    describe('sumContentCounts', () => {
        it('adds the counts of every kind of content up, in the order the kinds first come', () => {
            expect(sumContentCounts([{ templates: 1 }, { documents: 2, templates: 3 }, {}])).toEqual({
                documents: 2,
                templates: 4
            });
            expect(Object.keys(sumContentCounts([{ templates: 1 }, { documents: 2 }]))).toEqual([
                'templates',
                'documents'
            ]);
        });
    });
});
