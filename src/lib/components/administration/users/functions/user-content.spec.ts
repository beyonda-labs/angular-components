import { usedByOthersLines } from './user-content';

describe('usedByOthersLines', () => {
    const translations: Record<string, string> = {
        'angular-components.user-name.unknown': 'Unknown',
        'my-app.content.templates': 'Template'
    };
    const translate = (key: string, parameters?: Record<string, unknown>): string =>
        key === 'demo.users.content.used-by'
            ? `${String(parameters?.['entity'])} «${String(parameters?.['name'])}»: ${String(parameters?.['users'])}`
            : (translations[key] ?? key);

    it('names every row others use, with what uses it and its owner, an owner gone as unknown', () => {
        expect(
            usedByOthersLines(
                [
                    {
                        counts: { templates: 2 },
                        usedByOthers: {
                            templates: [
                                {
                                    id: 't1',
                                    name: 'Offer',
                                    users: [
                                        { id: 'd1', name: 'Offer for Acme', ownerName: 'Grace Hopper' },
                                        { id: 'd2', name: 'Offer for Globex', ownerName: null }
                                    ]
                                }
                            ]
                        }
                    },
                    { counts: {}, usedByOthers: { attachments: [{ id: 'a1', name: null, users: [] }] } }
                ],
                { contentLabels: { templates: 'my-app.content.templates' }, prefix: 'demo.users' },
                translate
            )
        ).toEqual([
            'Template «Offer»: Offer for Acme (Grace Hopper), Offer for Globex (Unknown)',
            'attachments «a1»: '
        ]);
    });
});
