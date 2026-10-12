import {
    BeyFormAutocompleteSearchResult,
    BeyFormFieldOption,
    BeyFormListField,
    BeyFormRow,
    BeyFormSection
} from '@beyonda-labs/angular-components';
import { delay, Observable, of } from 'rxjs';

const PREFIX = 'angular-components-style-guide.form.section-picked-list';
const SEARCH_DELAY_MS = 200;
const SEARCH_PAGE_SIZE = 5;
const PEOPLE: BeyFormFieldOption[] = [
    { label: 'Nora Lectora (nora@empresa.com)', value: 'p1' },
    { label: 'Íñigo Ruiz (inigo@empresa.com)', value: 'p2' },
    { label: 'Ada Lovelace (ada@empresa.com)', value: 'p3' },
    { label: 'Grace Hopper (grace@empresa.com)', value: 'p4' },
    { label: 'Alan Turing (alan@empresa.com)', value: 'p5' },
    { label: 'Margaret Hamilton (margaret@empresa.com)', value: 'p6' },
    { label: 'Katherine Johnson (katherine@empresa.com)', value: 'p7' },
    { label: 'Edsger Dijkstra (edsger@empresa.com)', value: 'p8' },
    { label: 'Barbara Liskov (barbara@empresa.com)', value: 'p9' },
    { label: 'Donald Knuth (donald@empresa.com)', value: 'p10' },
    { label: 'Frances Allen (frances@empresa.com)', value: 'p11' },
    { label: 'Linus Torvalds (linus@empresa.com)', value: 'p12' }
];
const ROLES: BeyFormFieldOption[] = [
    { label: 'Reviewers', value: 'r1' },
    { label: 'Writers', value: 'r2' },
    { label: 'Publishers', value: 'r3' }
];

export function buildListSections(): BeyFormSection[] {
    return [
        new BeyFormSection({
            key: 'section-picked-list',
            isTooltipVisible: true,
            rows: [
                new BeyFormRow({
                    fields: [
                        new BeyFormListField({
                            columns: 6,
                            emptyKey: `${PREFIX}.people.empty`,
                            isRemovable: true,
                            key: 'people',
                            options: PEOPLE,
                            picker: { search: searchPeople }
                        }),
                        new BeyFormListField({
                            columns: 6,
                            emptyKey: `${PREFIX}.roles.empty`,
                            isRemovable: true,
                            key: 'roles',
                            options: ROLES,
                            picker: {}
                        })
                    ]
                }),
                new BeyFormRow({
                    fields: [
                        new BeyFormListField({
                            columns: 6,
                            emptyKey: `${PREFIX}.read-only-people.empty`,
                            isDisabled: true,
                            isRemovable: true,
                            key: 'readOnlyPeople',
                            options: PEOPLE,
                            picker: { search: searchPeople }
                        })
                    ]
                })
            ]
        })
    ];
}

function fold(text: string): string {
    return text
        .normalize('NFD')
        .replaceAll(/[\u0300-\u036F]/gu, '')
        .toLowerCase();
}

function searchPeople(text: string, chosenIds: string[]): Observable<BeyFormAutocompleteSearchResult> {
    const matches = PEOPLE.filter(
        ({ label, value }) => !chosenIds.includes(value) && fold(label).includes(fold(text.trim()))
    );

    return of({ hasMore: matches.length > SEARCH_PAGE_SIZE, options: matches.slice(0, SEARCH_PAGE_SIZE) }).pipe(
        delay(SEARCH_DELAY_MS)
    );
}
