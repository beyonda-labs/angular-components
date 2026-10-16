import { catchError, map, Observable, of } from 'rxjs';

import { SearchSuggestionRequest, SearchSuggestions } from '../models/search-draft.model';

export function requestSearchSuggestions({
    field,
    index,
    text
}: SearchSuggestionRequest): Observable<SearchSuggestions | null> {
    if (!field.searchOptions) {
        return of(null);
    }

    return field.searchOptions(text).pipe(
        map(({ hasMore = false, options }): SearchSuggestions | null => ({ hasMore, index, options })),
        catchError(() => of(null))
    );
}
