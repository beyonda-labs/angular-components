import { firstValueFrom, of, throwError } from 'rxjs';

import { SearchField, SearchFieldType } from '../models/search.model';
import { requestSearchSuggestions } from './search-suggestions';

describe('requestSearchSuggestions', () => {
    it('answers the options of the typed text for the row asked', async () => {
        const field = new SearchField({
            key: 'author',
            searchOptions: text => of({ options: [{ label: text, value: '1' }] }),
            type: SearchFieldType.Autocomplete
        });

        await expect(firstValueFrom(requestSearchSuggestions({ field, index: 2, text: 'Ada' }))).resolves.toEqual({
            hasMore: false,
            index: 2,
            options: [{ label: 'Ada', value: '1' }]
        });
    });

    it('answers nothing for a field without a search or a search that fails', async () => {
        const plain = new SearchField({ key: 'author', type: SearchFieldType.Autocomplete });
        const failing = new SearchField({
            key: 'author',
            searchOptions: () => throwError(() => new Error('down')),
            type: SearchFieldType.Autocomplete
        });

        await expect(
            firstValueFrom(requestSearchSuggestions({ field: plain, index: 0, text: '' }))
        ).resolves.toBeNull();
        await expect(
            firstValueFrom(requestSearchSuggestions({ field: failing, index: 0, text: '' }))
        ).resolves.toBeNull();
    });
});
