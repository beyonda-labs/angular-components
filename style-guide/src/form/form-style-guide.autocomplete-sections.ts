import {
    BeyFormAutocompleteField,
    BeyFormFieldOption,
    BeyFormRow,
    BeyFormSection
} from '@beyonda-labs/angular-components';
import { delay, Observable, of } from 'rxjs';

const PREFIX = 'angular-components-style-guide.form.section-autocomplete-options';
const SEARCH_DELAY_MS = 200;
const CITIES: BeyFormFieldOption[] = [
    { label: 'Barcelona', value: 'barcelona' },
    { label: 'Bilbao', value: 'bilbao' },
    { label: 'Madrid', value: 'madrid' },
    { label: 'Málaga', value: 'malaga' },
    { label: 'Sevilla', value: 'sevilla' },
    { label: 'Valencia', value: 'valencia' }
];

export function buildAutocompleteOptionsSection(onPick: () => void): BeyFormSection {
    return new BeyFormSection({
        key: 'section-autocomplete-options',
        isTooltipVisible: true,
        rows: [
            new BeyFormRow({
                fields: [
                    new BeyFormAutocompleteField({
                        key: 'freeText',
                        columns: 6,
                        isFreeTextAllowed: true,
                        options: CITIES
                    }),
                    new BeyFormAutocompleteField({
                        key: 'startsWith',
                        columns: 6,
                        filter: (option, text) => option.label.toLowerCase().startsWith(text.toLowerCase()),
                        options: CITIES
                    })
                ]
            }),
            new BeyFormRow({
                fields: [
                    new BeyFormAutocompleteField({
                        key: 'server',
                        columns: 6,
                        emptyKey: `${PREFIX}.server.empty`,
                        excludedValues: ['madrid'],
                        options: CITIES,
                        search: searchCities
                    }),
                    new BeyFormAutocompleteField({
                        key: 'picker',
                        columns: 6,
                        isClearedOnSelect: true,
                        onSelect: onPick,
                        options: CITIES
                    })
                ]
            })
        ]
    });
}

function searchCities(text: string, excludedValues: string[]): Observable<BeyFormFieldOption[]> {
    const term = text.toLowerCase();

    return of(
        CITIES.filter(({ label, value }) => !excludedValues.includes(value) && label.toLowerCase().includes(term))
    ).pipe(delay(SEARCH_DELAY_MS));
}
